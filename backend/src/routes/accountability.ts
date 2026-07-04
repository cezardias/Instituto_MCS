import express from 'express'
import db from '../db'
import { authMiddleware } from '../middleware/auth'

const router = express.Router()

router.get('/', authMiddleware, (req, res) => {
  const tenant_id = (req as any).user.tenant_id
  const rows = db.prepare(`
    SELECT a.*, p.title as project_name 
    FROM accountability_reports a 
    JOIN projects p ON a.project_id = p.id 
    WHERE a.tenant_id = ? 
    ORDER BY a.created_at DESC
  `).all(tenant_id)
  res.json(rows)
})

router.post('/', authMiddleware, (req, res) => {
  const { project_id, title, document_url, status } = req.body
  const tenant_id = (req as any).user.tenant_id

  if (!project_id || !title) {
    return res.status(400).json({ error: 'Projeto e título são obrigatórios.' })
  }

  try {
    const info = db.prepare(
      'INSERT INTO accountability_reports (tenant_id, project_id, title, document_url, status) VALUES (?,?,?,?,?)'
    ).run(tenant_id, project_id, title, document_url || null, status || 'em_analise')
    res.status(201).json({ id: info.lastInsertRowid })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

router.put('/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const tenant_id = (req as any).user.tenant_id
  const { project_id, title, document_url, status } = req.body

  try {
    const info = db.prepare(
      'UPDATE accountability_reports SET project_id=?, title=?, document_url=?, status=? WHERE id=? AND tenant_id=?'
    ).run(project_id, title, document_url, status, id, tenant_id)
    if (info.changes === 0) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

router.delete('/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const tenant_id = (req as any).user.tenant_id
  const info = db.prepare('DELETE FROM accountability_reports WHERE id=? AND tenant_id=?').run(id, tenant_id)
  if (info.changes === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
})

export default router
