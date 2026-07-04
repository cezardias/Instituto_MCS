import express from 'express'
import db from '../db'
import { authMiddleware } from '../middleware/auth'

const router = express.Router()

router.get('/', authMiddleware, (req, res) => {
  const tenant_id = (req as any).user.tenant_id
  const { type } = req.query
  let query = 'SELECT * FROM documents WHERE tenant_id = ?'
  const params: any[] = [tenant_id]

  if (type) {
    query += ' AND type = ?'
    params.push(type)
  }

  query += ' ORDER BY created_at DESC'
  const rows = db.prepare(query).all(...params)
  res.json(rows)
})

router.post('/', authMiddleware, (req, res) => {
  const { title, type, document_url } = req.body
  const tenant_id = (req as any).user.tenant_id

  if (!title || !type || !document_url) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' })
  }

  try {
    const info = db.prepare(
      'INSERT INTO documents (tenant_id, title, type, document_url) VALUES (?,?,?,?)'
    ).run(tenant_id, title, type, document_url)
    res.status(201).json({ id: info.lastInsertRowid })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

router.delete('/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const tenant_id = (req as any).user.tenant_id
  const info = db.prepare('DELETE FROM documents WHERE id=? AND tenant_id=?').run(id, tenant_id)
  if (info.changes === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
})

export default router
