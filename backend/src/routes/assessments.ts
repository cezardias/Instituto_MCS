import express from 'express'
import db from '../db'
import { authMiddleware } from '../middleware/auth'

const router = express.Router()

// GET /api/assessments - List assessments
router.get('/', authMiddleware, (req, res) => {
  const tenant_id = (req as any).user.tenant_id
  const user = (req as any).user

  try {
    let query = `SELECT * FROM assessments WHERE tenant_id = ? ORDER BY date DESC, time DESC`
    const assessments = db.prepare(query).all(tenant_id) as any[]
    
    // Filter assessments by target and user role
    const filtered = assessments.filter(a => {
      if (user.role === 'admin' || user.role === 'diretoria') return true
      if (user.role === 'oficineiro') {
        return a.created_by === user.id
      }
      
      let targetIds = []
      try { targetIds = JSON.parse(a.target_ids || '[]') } catch(e){}
      
      if (user.role === 'aluno') {
        if (a.target_type === 'all') return true
        if (a.target_type === 'student' && targetIds.includes(user.id.toString())) return true
        if (a.target_type === 'class') {
          const myClasses = db.prepare('SELECT class_id FROM class_students WHERE student_id = ?').all(user.id).map((r:any) => r.class_id.toString())
          return myClasses.some((cid: string) => targetIds.includes(cid))
        }
      } else if (user.role === 'responsavel') {
        const children = db.prepare('SELECT id FROM users WHERE parent_id = ?').all(user.id).map((r:any) => r.id.toString())
        if (a.target_type === 'all') return true
        if (a.target_type === 'student' && children.some((cid:string) => targetIds.includes(cid))) return true
        if (a.target_type === 'class') {
          if (children.length === 0) return false
          const placeholders = children.map(()=>'?').join(',')
          const childrenClasses = db.prepare(`SELECT class_id FROM class_students WHERE student_id IN (${placeholders})`).all(...children).map((r:any) => r.class_id.toString())
          return childrenClasses.some((cid: string) => targetIds.includes(cid))
        }
      }
      return false
    })

    // Attach deliveries count for teachers/admins
    // Attach user delivery status for students
    const result = filtered.map(a => {
      const data = { ...a }
      if (user.role === 'admin' || user.role === 'diretoria' || user.role === 'oficineiro') {
        const count = db.prepare('SELECT COUNT(*) as c FROM assessment_deliveries WHERE assessment_id = ?').get(a.id) as any
        data.deliveries_count = count.c
      } else if (user.role === 'aluno') {
        const delivery = db.prepare('SELECT * FROM assessment_deliveries WHERE assessment_id = ? AND student_id = ?').get(a.id, user.id)
        data.my_delivery = delivery || null
      }
      return data
    })

    res.json(result)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// GET /api/assessments/:id - Get specific assessment and questions
router.get('/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const tenant_id = (req as any).user.tenant_id

  try {
    const assessment = db.prepare('SELECT * FROM assessments WHERE id = ? AND tenant_id = ?').get(id, tenant_id) as any
    if (!assessment) return res.status(404).json({ error: 'Avaliação não encontrada' })

    const questions = db.prepare('SELECT * FROM assessment_questions WHERE assessment_id = ?').all(id)
    res.json({ ...assessment, questions })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// POST /api/assessments - Create assessment
router.post('/', authMiddleware, (req, res) => {
  const tenant_id = (req as any).user.tenant_id
  const user = (req as any).user
  const { title, description, date, time, type, target_type, target_ids, max_score, questions, is_gamified } = req.body

  if (!['admin', 'diretoria', 'oficineiro'].includes(user.role)) {
    return res.status(403).json({ error: 'Acesso negado' })
  }

  try {
    db.exec('BEGIN TRANSACTION')
    const stmt = db.prepare(`
      INSERT INTO assessments (tenant_id, title, description, date, time, type, target_type, target_ids, max_score, is_gamified, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    const info = stmt.run(tenant_id, title, description, date || null, time || null, type, target_type, JSON.stringify(target_ids || []), max_score || null, is_gamified ? 1 : 0, user.id)
    const assessmentId = info.lastInsertRowid

    if (type === 'questionario' && Array.isArray(questions)) {
      const qStmt = db.prepare(`INSERT INTO assessment_questions (assessment_id, type, question_text, options_json) VALUES (?, ?, ?, ?)`)
      questions.forEach(q => {
        qStmt.run(assessmentId, q.type, q.question_text, JSON.stringify(q.options || []))
      })
    }

    db.exec('COMMIT')
    res.status(201).json({ id: assessmentId })
  } catch (error: any) {
    db.exec('ROLLBACK')
    res.status(500).json({ error: error.message })
  }
})

// DELETE /api/assessments/:id
router.delete('/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const tenant_id = (req as any).user.tenant_id
  const user = (req as any).user

  if (!['admin', 'diretoria', 'oficineiro'].includes(user.role)) {
    return res.status(403).json({ error: 'Acesso negado' })
  }

  try {
    db.prepare('DELETE FROM assessments WHERE id = ? AND tenant_id = ?').run(id, tenant_id)
    res.json({ success: true })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// --- Deliveries ---

// GET /api/assessments/:id/deliveries - List deliveries for an assessment
router.get('/:id/deliveries', authMiddleware, (req, res) => {
  const { id } = req.params
  const user = (req as any).user

  if (!['admin', 'diretoria', 'oficineiro'].includes(user.role)) {
    return res.status(403).json({ error: 'Acesso negado' })
  }

  try {
    const deliveries = db.prepare(`
      SELECT ad.*, u.name as student_name 
      FROM assessment_deliveries ad
      JOIN users u ON ad.student_id = u.id
      WHERE ad.assessment_id = ?
    `).all(id)
    res.json(deliveries)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// POST /api/assessments/:id/deliver - Student delivers the assessment
router.post('/:id/deliver', authMiddleware, (req, res) => {
  const { id } = req.params
  const user = (req as any).user
  const { answers } = req.body

  if (user.role !== 'aluno') {
    return res.status(403).json({ error: 'Apenas alunos podem entregar avaliações' })
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO assessment_deliveries (assessment_id, student_id, answers_json, signed, delivered_at, status)
      VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP, 'delivered')
    `)
    stmt.run(id, user.id, JSON.stringify(answers || {}))
    res.json({ success: true })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// POST /api/assessments/deliveries/:id/grade - Grade a delivery
router.post('/deliveries/:id/grade', authMiddleware, (req, res) => {
  const { id } = req.params
  const user = (req as any).user
  const { teacher_grade, teacher_comment } = req.body

  if (!['admin', 'diretoria', 'oficineiro'].includes(user.role)) {
    return res.status(403).json({ error: 'Acesso negado' })
  }

  try {
    const stmt = db.prepare(`
      UPDATE assessment_deliveries 
      SET teacher_grade = ?, teacher_comment = ?, status = 'graded'
      WHERE id = ?
    `)
    stmt.run(teacher_grade, teacher_comment, id)
    res.json({ success: true })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router
