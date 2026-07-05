import express from 'express'
import db from '../db'
import { authMiddleware } from '../middleware/auth'

const router = express.Router()

// List authorizations
router.get('/', authMiddleware, (req, res) => {
  const tenant_id = (req as any).user.tenant_id
  const user = (req as any).user

  try {
    const auths = db.prepare('SELECT a.*, u.name as creator_name FROM authorizations a JOIN users u ON a.created_by = u.id WHERE a.tenant_id = ? ORDER BY a.created_at DESC').all(tenant_id) as any[]

    if (user.role === 'admin' || user.role === 'diretoria') {
      // Return authorizations with signature counts
      const authsWithStats = auths.map(auth => {
        const countRow = db.prepare('SELECT count(*) as count FROM authorization_signatures WHERE authorization_id = ?').get(auth.id) as any
        return {
          ...auth,
          signatures_count: countRow.count
        }
      })
      res.json(authsWithStats)
    } else if (user.role === 'responsavel') {
      // Find students belonging to this parent
      const students = db.prepare('SELECT id, name FROM users WHERE tenant_id = ? AND parent_id = ? AND role = ?').all(tenant_id, user.id, 'aluno') as any[]
      
      const authsWithSignatures = auths.map(auth => {
        // Check if parent signed for their students
        const signs = db.prepare('SELECT student_id, signed_at FROM authorization_signatures WHERE authorization_id = ? AND parent_id = ?').all(auth.id, user.id) as any[]
        const signedStudentIds = signs.map(s => s.student_id)
        
        return {
          ...auth,
          signed: students.length > 0 && signedStudentIds.length === students.length, // signed if signed for all children
          signed_at: signs.length > 0 ? signs[0].signed_at : null,
          students: students.map(s => ({
            id: s.id,
            name: s.name,
            signed: signedStudentIds.includes(s.id)
          }))
        }
      })
      res.json(authsWithSignatures)
    } else {
      res.status(403).json({ error: 'Acesso negado' })
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Create authorization (admin/diretoria)
router.post('/', authMiddleware, (req, res) => {
  const { title, description, event_date, event_time, location } = req.body
  const tenant_id = (req as any).user.tenant_id
  const user = (req as any).user

  if (user.role !== 'admin' && user.role !== 'diretoria') {
    return res.status(403).json({ error: 'Acesso negado' })
  }

  if (!title || !event_date) {
    return res.status(400).json({ error: 'Título e Data são obrigatórios' })
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO authorizations (tenant_id, title, description, event_date, event_time, location, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    const info = stmt.run(tenant_id, title, description || null, event_date, event_time || null, location || null, user.id)
    res.status(201).json({ id: info.lastInsertRowid })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Sign authorization (responsavel)
router.post('/:id/sign', authMiddleware, (req, res) => {
  const { id } = req.params
  const tenant_id = (req as any).user.tenant_id
  const user = (req as any).user

  if (user.role !== 'responsavel') {
    return res.status(403).json({ error: 'Apenas responsáveis podem assinar' })
  }

  try {
    const auth = db.prepare('SELECT * FROM authorizations WHERE id = ? AND tenant_id = ?').get(id, tenant_id)
    if (!auth) {
      return res.status(404).json({ error: 'Autorização não encontrada' })
    }

    // Get all students for this parent
    const students = db.prepare('SELECT id FROM users WHERE tenant_id = ? AND parent_id = ? AND role = ?').all(tenant_id, user.id, 'aluno') as any[]
    
    if (students.length === 0) {
      return res.status(400).json({ error: 'Você não tem alunos vinculados' })
    }

    db.exec('BEGIN TRANSACTION')
    try {
      const stmt = db.prepare(`
        INSERT OR IGNORE INTO authorization_signatures (authorization_id, parent_id, student_id)
        VALUES (?, ?, ?)
      `)
      
      for (const student of students) {
        stmt.run(id, user.id, student.id)
      }
      db.exec('COMMIT')
      res.json({ success: true })
    } catch (e: any) {
      db.exec('ROLLBACK')
      throw e
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Delete authorization (admin/diretoria)
router.delete('/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const tenant_id = (req as any).user.tenant_id
  const user = (req as any).user

  if (user.role !== 'admin' && user.role !== 'diretoria') {
    return res.status(403).json({ error: 'Acesso negado' })
  }

  try {
    db.prepare('DELETE FROM authorization_signatures WHERE authorization_id = ?').run(id)
    db.prepare('DELETE FROM authorizations WHERE id = ? AND tenant_id = ?').run(id, tenant_id)
    res.json({ success: true })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// View signatures (admin/diretoria)
router.get('/:id/signatures', authMiddleware, (req, res) => {
  const { id } = req.params
  const tenant_id = (req as any).user.tenant_id
  const user = (req as any).user

  if (user.role !== 'admin' && user.role !== 'diretoria') {
    return res.status(403).json({ error: 'Acesso negado' })
  }

  try {
    const signatures = db.prepare(`
      SELECT s.*, p.name as parent_name, a.name as student_name
      FROM authorization_signatures s
      JOIN users p ON s.parent_id = p.id
      JOIN users a ON s.student_id = a.id
      WHERE s.authorization_id = ?
      ORDER BY s.signed_at DESC
    `).all(id)
    res.json(signatures)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router
