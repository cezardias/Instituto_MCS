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

// GET /api/classes/:id/lessons
router.get('/:id/lessons', authMiddleware, (req, res) => {
  const { id } = req.params
  try {
    const lessons = db.prepare('SELECT * FROM class_lessons WHERE class_id = ? ORDER BY date DESC, start_time DESC').all(id)
    res.json(lessons)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// POST /api/classes/:id/lessons
router.post('/:id/lessons', authMiddleware, (req, res) => {
  const { id } = req.params
  const { title, date, start_time, end_time, description } = req.body
  const user = (req as any).user

  let allowed = false
  if (user.role === 'admin' || user.role === 'diretoria') allowed = true
  else if (user.role === 'oficineiro') {
    const isTeacher = db.prepare('SELECT 1 FROM class_teachers WHERE class_id = ? AND teacher_id = ?').get(id, user.id)
    if (isTeacher) allowed = true
  }

  if (!allowed) return res.status(403).json({ error: 'Acesso negado' })

  try {
    const stmt = db.prepare(`
      INSERT INTO class_lessons (class_id, title, date, start_time, end_time, description, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    const info = stmt.run(id, title, date, start_time || null, end_time || null, description || null, user.id)
    res.status(201).json({ id: info.lastInsertRowid })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// PUT /api/classes/lessons/:lessonId
router.put('/lessons/:lessonId', authMiddleware, (req, res) => {
  const { lessonId } = req.params
  const { title, date, start_time, end_time, description } = req.body
  const user = (req as any).user

  const lesson = db.prepare('SELECT class_id FROM class_lessons WHERE id = ?').get(lessonId) as any
  if (!lesson) return res.status(404).json({ error: 'Aula não encontrada' })

  let allowed = false
  if (user.role === 'admin' || user.role === 'diretoria') allowed = true
  else if (user.role === 'oficineiro') {
    const isTeacher = db.prepare('SELECT 1 FROM class_teachers WHERE class_id = ? AND teacher_id = ?').get(lesson.class_id, user.id)
    if (isTeacher) allowed = true
  }

  if (!allowed) return res.status(403).json({ error: 'Acesso negado' })

  try {
    const stmt = db.prepare(`
      UPDATE class_lessons 
      SET title = ?, date = ?, start_time = ?, end_time = ?, description = ?
      WHERE id = ?
    `)
    stmt.run(title, date, start_time || null, end_time || null, description || null, lessonId)
    res.json({ success: true })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// DELETE /api/classes/lessons/:lessonId
router.delete('/lessons/:lessonId', authMiddleware, (req, res) => {
  const { lessonId } = req.params
  const user = (req as any).user

  const lesson = db.prepare('SELECT class_id FROM class_lessons WHERE id = ?').get(lessonId) as any
  if (!lesson) return res.status(404).json({ error: 'Aula não encontrada' })

  let allowed = false
  if (user.role === 'admin' || user.role === 'diretoria') allowed = true
  else if (user.role === 'oficineiro') {
    const isTeacher = db.prepare('SELECT 1 FROM class_teachers WHERE class_id = ? AND teacher_id = ?').get(lesson.class_id, user.id)
    if (isTeacher) allowed = true
  }

  if (!allowed) return res.status(403).json({ error: 'Acesso negado' })

  try {
    db.prepare('DELETE FROM class_lessons WHERE id = ?').run(lessonId)
    res.json({ success: true })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// GET /api/classes/lessons/:lessonId/attendance
router.get('/lessons/:lessonId/attendance', authMiddleware, (req, res) => {
  const { lessonId } = req.params
  try {
    const records = db.prepare('SELECT * FROM attendance WHERE lesson_id = ?').all(lessonId)
    res.json(records)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// POST /api/classes/lessons/:lessonId/attendance
router.post('/lessons/:lessonId/attendance', authMiddleware, (req, res) => {
  const { lessonId } = req.params
  const { records } = req.body
  const user = (req as any).user

  // verify permission (needs to check which class this lesson belongs to)
  const lesson = db.prepare('SELECT class_id FROM class_lessons WHERE id = ?').get(lessonId) as any
  if (!lesson) return res.status(404).json({ error: 'Aula não encontrada' })

  let allowed = false
  if (user.role === 'admin' || user.role === 'diretoria') allowed = true
  else if (user.role === 'oficineiro') {
    const isTeacher = db.prepare('SELECT 1 FROM class_teachers WHERE class_id = ? AND teacher_id = ?').get(lesson.class_id, user.id)
    if (isTeacher) allowed = true
  }

  if (!allowed) return res.status(403).json({ error: 'Acesso negado' })

  try {
    db.exec('BEGIN TRANSACTION')
    const insertStmt = db.prepare(`
      INSERT INTO attendance (lesson_id, student_id, status, justification_text, justification_file_url, recorded_by)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(lesson_id, student_id) DO UPDATE SET
        status = excluded.status,
        justification_text = excluded.justification_text,
        justification_file_url = excluded.justification_file_url,
        recorded_by = excluded.recorded_by
    `)

    for (const rec of records) {
      insertStmt.run(
        lessonId, 
        rec.student_id, 
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

// GET /api/classes/:id/student-attendance (For students and parents)
router.get('/:id/student-attendance', authMiddleware, (req, res) => {
  const { id } = req.params
  const user = (req as any).user

  try {
    let studentIds: number[] = []
    if (user.role === 'aluno') studentIds = [user.id]
    else if (user.role === 'responsavel') {
      const children = db.prepare('SELECT id FROM users WHERE parent_id = ?').all(user.id).map((r:any) => r.id)
      studentIds = children
    }
    
    if (studentIds.length === 0) return res.json([])

    const placeholders = studentIds.map(()=>'?').join(',')
    const query = `
      SELECT cl.date, cl.title, cl.description, a.* 
      FROM class_lessons cl
      LEFT JOIN attendance a ON cl.id = a.lesson_id AND a.student_id IN (${placeholders})
      WHERE cl.class_id = ?
      ORDER BY cl.date DESC, cl.start_time DESC
    `
    // pass the array of studentIds and then the class id
    const records = db.prepare(query).all(...studentIds, id)
    res.json(records)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// GET /api/classes/:id/report
router.get('/:id/report', authMiddleware, (req, res) => {
  const { id } = req.params
  const user = (req as any).user

  if (user.role !== 'admin' && user.role !== 'diretoria') {
    return res.status(403).json({ error: 'Acesso negado' })
  }

  try {
    const query = `
      SELECT 
        u.name as student_name,
        cl.date as lesson_date,
        cl.title as lesson_title,
        a.status,
        a.justification_text
      FROM users u
      JOIN class_students cs ON u.id = cs.student_id
      JOIN class_lessons cl ON cs.class_id = cl.class_id
      LEFT JOIN attendance a ON a.lesson_id = cl.id AND a.student_id = u.id
      WHERE cs.class_id = ?
      ORDER BY u.name ASC, cl.date ASC, cl.start_time ASC
    `
    const records = db.prepare(query).all(id)
    res.json(records)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router
