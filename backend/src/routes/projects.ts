import express from 'express'
import db from '../db'
import { authMiddleware } from '../middleware/auth'

const router = express.Router()
const AREAS = ['Educação', 'Cultura', 'Esporte', 'Saúde', 'Meio Ambiente', 'Geração de Renda']
const STATUS = ['em_execucao', 'em_planejamento', 'concluido', 'suspenso']

router.get('/', (req, res) => {
  const { tenant_id } = req.query
  if (!tenant_id) return res.status(400).json({ error: 'tenant_id required' })
  const rows = db.prepare('SELECT * FROM projects WHERE tenant_id = ? ORDER BY created_at DESC').all(tenant_id)
  res.json(rows)
})

router.post('/', authMiddleware, (req, res) => {
  const { title, status, area, location, beneficiados, budget, start_date, end_date, description, image_url } = req.body
  const tenant_id = (req as any).user.tenant_id
  if (!title || !location) return res.status(400).json({ error: 'title and location required' })
  try {
    const info = db.prepare(
      'INSERT INTO projects (tenant_id, title, status, area, location, beneficiados, budget, start_date, end_date, description, impact, image_url) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)'
    ).run(tenant_id, title, status || 'em_execucao', area || 'Educação', location, beneficiados || 0, budget || 0, start_date, end_date, description, '', image_url || '')
    res.status(201).json({ id: info.lastInsertRowid })
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

router.put('/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const tenant_id = (req as any).user.tenant_id
  const { title, status, area, location, beneficiados, budget, start_date, end_date, description, image_url } = req.body
  try {
    const info = db.prepare(
      'UPDATE projects SET title=?, status=?, area=?, location=?, beneficiados=?, budget=?, start_date=?, end_date=?, description=?, impact=?, image_url=? WHERE id=? AND tenant_id=?'
    ).run(title, status, area, location, beneficiados, budget, start_date, end_date, description, '', image_url || '', id, tenant_id)
    if (info.changes === 0) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true })
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

router.delete('/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const tenant_id = (req as any).user.tenant_id
  const info = db.prepare('DELETE FROM projects WHERE id=? AND tenant_id=?').run(id, tenant_id)
  if (info.changes === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
})

export default router
