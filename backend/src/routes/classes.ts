import express from 'express'
import db from '../db'
import { authMiddleware } from '../middleware/auth'

const router = express.Router()

router.get('/', authMiddleware, (req, res) => {
  const tenant_id = (req as any).user.tenant_id
  const user = (req as any).user

  try {
    let classes = db.prepare('SELECT * FROM classes WHERE tenant_id = ?').all(tenant_id) as any[]

    // Filter by role
    if (user.role === 'oficineiro') {
      const myClasses = db.prepare('SELECT class_id FROM class_teachers WHERE teacher_id = ?').all(user.id).map((r:any) => r.class_id)
      classes = classes.filter(c => myClasses.includes(c.id))
    } else if (user.role === 'aluno') {
      const myClasses = db.prepare('SELECT class_id FROM class_students WHERE student_id = ?').all(user.id).map((r:any) => r.class_id)
      classes = classes.filter(c => myClasses.includes(c.id))
    } else if (user.role === 'responsavel') {
      const children = db.prepare('SELECT id FROM users WHERE parent_id = ?').all(user.id).map((r:any) => r.id)
      if (children.length > 0) {
        const placeholders = children.map(()=>'?').join(',')
        const myClasses = db.prepare(`SELECT class_id FROM class_students WHERE student_id IN (${placeholders})`).all(...children).map((r:any) => r.class_id)
        classes = classes.filter(c => myClasses.includes(c.id))
      } else {
        classes = []
      }
    }

    // Attach teachers and students to each class
    const result = classes.map(c => {
      const teachers = db.prepare('SELECT u.id, u.name, u.email FROM class_teachers ct JOIN users u ON ct.teacher_id = u.id WHERE ct.class_id = ?').all(c.id)
      const students = db.prepare('SELECT u.id, u.name, u.email FROM class_students cs JOIN users u ON cs.student_id = u.id WHERE cs.class_id = ?').all(c.id)
      return { ...c, teachers, students }
    })

    res.json(result)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/', authMiddleware, (req, res) => {
  const { name, description, teacher_ids, student_ids } = req.body
  const tenant_id = (req as any).user.tenant_id
  const user = (req as any).user

  if (user.role !== 'admin' && user.role !== 'diretoria') {
    return res.status(403).json({ error: 'Acesso negado' })
  }

  try {
    db.exec('BEGIN TRANSACTION')
    const stmt = db.prepare('INSERT INTO classes (tenant_id, name, description) VALUES (?, ?, ?)')
    const info = stmt.run(tenant_id, name, description)
    const classId = info.lastInsertRowid

    if (Array.isArray(teacher_ids)) {
      const insertT = db.prepare('INSERT INTO class_teachers (class_id, teacher_id) VALUES (?, ?)')
      teacher_ids.forEach(tid => insertT.run(classId, tid))
    }

    if (Array.isArray(student_ids)) {
      const insertS = db.prepare('INSERT INTO class_students (class_id, student_id) VALUES (?, ?)')
      student_ids.forEach(sid => insertS.run(classId, sid))
    }

    db.exec('COMMIT')
    res.status(201).json({ id: classId })
  } catch (error: any) {
    db.exec('ROLLBACK')
    res.status(500).json({ error: error.message })
  }
})

router.put('/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const { name, description, teacher_ids, student_ids } = req.body
  const tenant_id = (req as any).user.tenant_id
  const user = (req as any).user

  if (user.role !== 'admin' && user.role !== 'diretoria') {
    return res.status(403).json({ error: 'Acesso negado' })
  }

  try {
    db.exec('BEGIN TRANSACTION')
    db.prepare('UPDATE classes SET name = ?, description = ? WHERE id = ? AND tenant_id = ?').run(name, description, id, tenant_id)

    db.prepare('DELETE FROM class_teachers WHERE class_id = ?').run(id)
    if (Array.isArray(teacher_ids)) {
      const insertT = db.prepare('INSERT INTO class_teachers (class_id, teacher_id) VALUES (?, ?)')
      teacher_ids.forEach(tid => insertT.run(id, tid))
    }

    db.prepare('DELETE FROM class_students WHERE class_id = ?').run(id)
    if (Array.isArray(student_ids)) {
      const insertS = db.prepare('INSERT INTO class_students (class_id, student_id) VALUES (?, ?)')
      student_ids.forEach(sid => insertS.run(id, sid))
    }

    db.exec('COMMIT')
    res.json({ success: true })
  } catch (error: any) {
    db.exec('ROLLBACK')
    res.status(500).json({ error: error.message })
  }
})

router.delete('/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const tenant_id = (req as any).user.tenant_id
  const user = (req as any).user

  if (user.role !== 'admin' && user.role !== 'diretoria') {
    return res.status(403).json({ error: 'Acesso negado' })
  }

  try {
    db.exec('BEGIN TRANSACTION')
    db.prepare('DELETE FROM class_teachers WHERE class_id = ?').run(id)
    db.prepare('DELETE FROM class_students WHERE class_id = ?').run(id)
    db.prepare('DELETE FROM attendance WHERE class_id = ?').run(id)
    db.prepare('DELETE FROM classes WHERE id = ? AND tenant_id = ?').run(id, tenant_id)
    db.exec('COMMIT')
    res.json({ success: true })
  } catch (error: any) {
    db.exec('ROLLBACK')
    res.status(500).json({ error: error.message })
  }
})

// GET /api/classes/:id/attendance?date=YYYY-MM-DD
router.get('/:id/attendance', authMiddleware, (req, res) => {
  const { id } = req.params
  const { date } = req.query
  const user = (req as any).user

  try {
    if (date) {
      const records = db.prepare('SELECT * FROM attendance WHERE class_id = ? AND date = ?').all(id, date)
      return res.json(records)
    } else {
      // If student/parent, return only their attendance
      if (user.role === 'aluno') {
        const records = db.prepare('SELECT * FROM attendance WHERE class_id = ? AND student_id = ? ORDER BY date DESC').all(id, user.id)
        return res.json(records)
      } else if (user.role === 'responsavel') {
        const children = db.prepare('SELECT id FROM users WHERE parent_id = ?').all(user.id).map((r:any) => r.id)
        if (children.length > 0) {
          const placeholders = children.map(()=>'?').join(',')
          const records = db.prepare(`SELECT * FROM attendance WHERE class_id = ? AND student_id IN (${placeholders}) ORDER BY date DESC`).all(id, ...children)
          return res.json(records)
        }
        return res.json([])
      }
      
      const records = db.prepare('SELECT * FROM attendance WHERE class_id = ? ORDER BY date DESC').all(id)
      return res.json(records)
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// POST /api/classes/:id/attendance (Save batch attendance for a date)
// Body: { date: 'YYYY-MM-DD', records: [{ student_id, status, justification_text, justification_file_url }] }
router.post('/:id/attendance', authMiddleware, (req, res) => {
  const { id } = req.params
  const { date, records } = req.body
  const user = (req as any).user

  // Check if user is teacher of this class or admin/diretoria
  let allowed = false
  if (user.role === 'admin' || user.role === 'diretoria') {
    allowed = true
  } else if (user.role === 'oficineiro') {
    const isTeacher = db.prepare('SELECT 1 FROM class_teachers WHERE class_id = ? AND teacher_id = ?').get(id, user.id)
    if (isTeacher) allowed = true
  }

  if (!allowed) {
    return res.status(403).json({ error: 'Acesso negado' })
  }

  if (!date || !Array.isArray(records)) {
    return res.status(400).json({ error: 'Data e registros inválidos' })
  }

  try {
    db.exec('BEGIN TRANSACTION')
    const insertStmt = db.prepare(`
      INSERT INTO attendance (class_id, student_id, date, status, justification_text, justification_file_url, recorded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(class_id, student_id, date) DO UPDATE SET
        status = excluded.status,
        justification_text = excluded.justification_text,
        justification_file_url = excluded.justification_file_url,
        recorded_by = excluded.recorded_by
    `)

    for (const rec of records) {
      insertStmt.run(
        id, 
        rec.student_id, 
        date, 
        rec.status, 
        rec.justification_text || null, 
        rec.justification_file_url || null, 
        user.id
      )
    }

    db.exec('COMMIT')
    res.json({ success: true })
  } catch (error: any) {
    db.exec('ROLLBACK')
    res.status(500).json({ error: error.message })
  }
})

export default router
