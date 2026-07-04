import express from 'express'
import db from '../db'
import { authMiddleware } from '../middleware/auth'

const router = express.Router()

router.get('/', authMiddleware, (req, res) => {
  const tenant_id = (req as any).user.tenant_id
  const rows = db.prepare('SELECT * FROM alunos WHERE tenant_id = ? ORDER BY created_at DESC').all(tenant_id)
  res.json(rows)
})

router.post('/', authMiddleware, (req, res) => {
  const { name, email, phone, area, project_id, status, birth_date } = req.body
  const tenant_id = (req as any).user.tenant_id
  if (!name) return res.status(400).json({ error: 'name required' })
  try {
    const info = db.prepare(
      'INSERT INTO alunos (tenant_id, name, email, phone, area, project_id, status, birth_date) VALUES (?,?,?,?,?,?,?,?)'
    ).run(tenant_id, name, email, phone, area || 'Educação', project_id || null, status || 'ativo', birth_date)
    res.status(201).json({ id: info.lastInsertRowid })
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

router.put('/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const tenant_id = (req as any).user.tenant_id
  const { name, email, phone, area, project_id, status, birth_date } = req.body
  try {
    const info = db.prepare(
      'UPDATE alunos SET name=?, email=?, phone=?, area=?, project_id=?, status=?, birth_date=? WHERE id=? AND tenant_id=?'
    ).run(name, email, phone, area, project_id, status, birth_date, id, tenant_id)
    if (info.changes === 0) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true })
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

router.delete('/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const tenant_id = (req as any).user.tenant_id
  const info = db.prepare('DELETE FROM alunos WHERE id=? AND tenant_id=?').run(id, tenant_id)
  if (info.changes === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
})

export default router
