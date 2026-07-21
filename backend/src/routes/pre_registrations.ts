import express from 'express'
import db from '../db'
import { authMiddleware } from '../middleware/auth'

const router = express.Router()

router.get('/', authMiddleware, (req, res) => {
  const tenant_id = (req as any).user.tenant_id
  try {
    const rows = db.prepare(`
      SELECT pr.*, p.title as project_name 
      FROM pre_registrations pr
      LEFT JOIN projects p ON pr.project_id = p.id
      WHERE pr.tenant_id = ? 
      ORDER BY pr.created_at DESC
    `).all(tenant_id)
    res.json(rows)
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

router.post('/', (req, res) => {
  const { tenant_id, name, email, phone, project_id, student_name } = req.body
  if (!tenant_id || !name || !phone) return res.status(400).json({ error: 'tenant_id, name and phone required' })
  try {
    const info = db.prepare(
      'INSERT INTO pre_registrations (tenant_id, name, email, phone, project_id, student_name) VALUES (?,?,?,?,?,?)'
    ).run(tenant_id, name, email || '', phone, project_id || null, student_name || null)
    res.status(201).json({ id: info.lastInsertRowid })
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

router.put('/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const tenant_id = (req as any).user.tenant_id
  const { status } = req.body
  try {
    const info = db.prepare('UPDATE pre_registrations SET status=? WHERE id=? AND tenant_id=?').run(status, id, tenant_id)
    if (info.changes === 0) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true })
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

router.delete('/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const tenant_id = (req as any).user.tenant_id
  try {
    const info = db.prepare('DELETE FROM pre_registrations WHERE id=? AND tenant_id=?').run(id, tenant_id)
    if (info.changes === 0) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true })
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

export default router
