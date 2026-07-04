import express from 'express'
import db from '../db'
import { authMiddleware } from '../middleware/auth'

const router = express.Router()

router.get('/', authMiddleware, (req, res) => {
  const tenant_id = (req as any).user.tenant_id
  const rows = db.prepare('SELECT * FROM reports_denuncias WHERE tenant_id = ? ORDER BY created_at DESC').all(tenant_id)
  res.json(rows)
})

router.post('/', (req, res) => {
  const { tenant_id, name, email, subject, message } = req.body

  if (!tenant_id || !subject || !message) {
    return res.status(400).json({ error: 'Assunto e mensagem são obrigatórios.' })
  }

  try {
    const info = db.prepare(
      'INSERT INTO reports_denuncias (tenant_id, name, email, subject, message) VALUES (?,?,?,?,?)'
    ).run(tenant_id, name || null, email || null, subject, message)
    res.status(201).json({ id: info.lastInsertRowid })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

router.put('/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const tenant_id = (req as any).user.tenant_id
  const { status } = req.body

  try {
    const info = db.prepare(
      'UPDATE reports_denuncias SET status=? WHERE id=? AND tenant_id=?'
    ).run(status, id, tenant_id)
    if (info.changes === 0) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

router.delete('/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const tenant_id = (req as any).user.tenant_id
  const info = db.prepare('DELETE FROM reports_denuncias WHERE id=? AND tenant_id=?').run(id, tenant_id)
  if (info.changes === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
})

export default router
