import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import db from '../db'

const router = Router()
router.use(authMiddleware)

router.get('/projects', (req, res) => {
  const tenantId = req.tenantId || 'default'
  const projects = db.prepare('SELECT id, title, status, impact, location FROM projects WHERE tenant_id = ?').all(tenantId)
  res.json({ projects })
})

router.post('/projects', (req, res) => {
  const tenantId = req.tenantId || 'default'
  const { title, status, impact, location } = req.body
  const stmt = db.prepare('INSERT INTO projects (tenant_id, title, status, impact, location) VALUES (?, ?, ?, ?, ?)')
  const result = stmt.run(tenantId, title, status, impact, location)
  res.status(201).json({ id: result.lastInsertRowid, title, status, impact, location })
})

export default router
