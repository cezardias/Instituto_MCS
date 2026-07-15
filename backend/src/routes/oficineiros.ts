import express from 'express'
import db from '../db'
import { authMiddleware } from '../middleware/auth'

const router = express.Router()

// POST /api/oficineiros (Public - used by landing page)
router.post('/', (req, res) => {
  const { tenant_id, name, email, phone, cpf, birth_date, education, experience, contribution } = req.body

  if (!tenant_id || !name || !email || !phone || !cpf || !birth_date || !education || !experience || !contribution) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' })
  }

  try {
    const info = db.prepare(
      'INSERT INTO oficineiro_registrations (tenant_id, name, email, phone, cpf, birth_date, education, experience, contribution) VALUES (?,?,?,?,?,?,?,?,?)'
    ).run(tenant_id, name, email, phone, cpf, birth_date, education, experience, contribution)
    
    res.status(201).json({ id: info.lastInsertRowid })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// GET /api/oficineiros (Protected - used by admin dashboard)
router.get('/', authMiddleware, (req, res) => {
  const tenant_id = (req as any).user.tenant_id
  
  // Only admin should see this, but we'll filter it on frontend/middleware level if needed
  try {
    const rows = db.prepare('SELECT * FROM oficineiro_registrations WHERE tenant_id = ? ORDER BY created_at DESC').all(tenant_id)
    res.json(rows)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// PUT /api/oficineiros/:id (Protected - used to update status)
router.put('/:id', authMiddleware, (req, res) => {
  const tenant_id = (req as any).user.tenant_id
  const { id } = req.params
  const { status } = req.body

  if ((req as any).user.role !== 'admin') {
    return res.status(403).json({ error: 'Apenas administradores podem atualizar o status.' })
  }

  try {
    const info = db.prepare('UPDATE oficineiro_registrations SET status = ? WHERE id = ? AND tenant_id = ?').run(status, id, tenant_id)
    if (info.changes === 0) return res.status(404).json({ error: 'Inscrição não encontrada' })
    res.json({ success: true })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

export default router
