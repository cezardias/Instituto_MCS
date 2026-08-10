import express from 'express'
import db from '../db'
import { authMiddleware } from '../middleware/auth'

const router = express.Router()

// GET /api/assignments
router.get('/', (req, res) => {
  try {
    const { tenant_id = 'mcs', student_name, parent_email, turma } = req.query

    let sql = 'SELECT * FROM assignments WHERE tenant_id = ?'
    const params: any[] = [tenant_id]

    if (student_name) {
      sql += ' AND LOWER(student_name) LIKE ?'
      params.push(`%${String(student_name).toLowerCase()}%`)
    }
    if (parent_email) {
      sql += ' AND LOWER(parent_email) = ?'
      params.push(String(parent_email).toLowerCase())
    }
    if (turma) {
      sql += ' AND LOWER(turma) LIKE ?'
      params.push(`%${String(turma).toLowerCase()}%`)
    }

    sql += ' ORDER BY created_at DESC'
    const rows = db.prepare(sql).all(...params)
    res.json(rows)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// POST /api/assignments
router.post('/', (req, res) => {
  try {
    const {
      tenant_id = 'mcs',
      student_id,
      student_name,
      student_email,
      parent_email,
      turma,
      title,
      description,
      file_url,
      file_name,
      file_type
    } = req.body

    if (!student_name || !title || !file_url) {
      return res.status(400).json({ error: 'student_name, title and file_url are required' })
    }

    const info = db.prepare(`
      INSERT INTO assignments (
        tenant_id, student_id, student_name, student_email, parent_email, turma, title, description, file_url, file_name, file_type, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'enviado')
    `).run(
      tenant_id,
      student_id || null,
      student_name,
      student_email || '',
      parent_email || '',
      turma || 'Geral',
      title,
      description || '',
      file_url,
      file_name || 'arquivo',
      file_type || ''
    )

    res.status(201).json({ id: info.lastInsertRowid, success: true })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// PUT /api/assignments/:id (Avaliação e Feedback pelo Professor/Diretoria)
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params
    const { status, feedback, grade } = req.body

    const info = db.prepare(`
      UPDATE assignments SET 
        status = COALESCE(?, status),
        feedback = COALESCE(?, feedback),
        grade = COALESCE(?, grade)
      WHERE id = ?
    `).run(status, feedback, grade, id)

    if (info.changes === 0) return res.status(404).json({ error: 'Trabalho não encontrado' })
    res.json({ success: true })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// DELETE /api/assignments/:id
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params
    const info = db.prepare('DELETE FROM assignments WHERE id = ?').run(id)
    if (info.changes === 0) return res.status(404).json({ error: 'Trabalho não encontrado' })
    res.json({ success: true })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

export default router
