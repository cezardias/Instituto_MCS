import express from 'express'
import db from '../db'
import { authMiddleware } from '../middleware/auth'

const router = express.Router()

router.get('/', authMiddleware, (req, res) => {
  const tenant_id = (req as any).user.tenant_id
  const comunicados = db.prepare('SELECT * FROM comunicados WHERE tenant_id = ? ORDER BY created_at DESC').all(tenant_id)
  res.json(comunicados)
})

router.post('/', authMiddleware, (req, res) => {
  const user = (req as any).user
  if (user.role !== 'admin' && user.role !== 'diretoria' && user.role !== 'coordenacao') {
    return res.status(403).json({ error: 'Acesso negado' })
  }

  const { title, message } = req.body
  if (!title || !message) return res.status(400).json({ error: 'Campos obrigatórios faltando' })

  try {
    const info = db.prepare('INSERT INTO comunicados (tenant_id, title, message, author_name) VALUES (?,?,?,?)')
      .run(user.tenant_id, title, message, user.name || 'Admin')
    res.json({ id: info.lastInsertRowid })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', authMiddleware, (req, res) => {
  const user = (req as any).user
  if (user.role !== 'admin' && user.role !== 'diretoria' && user.role !== 'coordenacao') {
    return res.status(403).json({ error: 'Acesso negado' })
  }
  
  db.prepare('DELETE FROM comunicados WHERE id = ? AND tenant_id = ?').run(req.params.id, user.tenant_id)
  res.json({ success: true })
})

export default router
