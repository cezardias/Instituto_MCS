import express from 'express'
import db from '../db'
import { authMiddleware } from '../middleware/auth'

const router = express.Router()

router.get('/', authMiddleware, (req, res) => {
  const tenant_id = (req as any).user.tenant_id
  const { type } = req.query
  let query = 'SELECT * FROM transactions WHERE tenant_id = ?'
  const params: any[] = [tenant_id]

  if (type) {
    query += ' AND type = ?'
    params.push(type)
  }

  query += ' ORDER BY date DESC, created_at DESC'
  const rows = db.prepare(query).all(...params)
  res.json(rows)
})

router.post('/', authMiddleware, (req, res) => {
  const { type, category, description, amount, date, status } = req.body
  const tenant_id = (req as any).user.tenant_id

  if (!type || !category || !description || amount === undefined || !date) {
    return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' })
  }

  try {
    const info = db.prepare(
      'INSERT INTO transactions (tenant_id, type, category, description, amount, date, status) VALUES (?,?,?,?,?,?,?)'
    ).run(tenant_id, type, category, description, amount, date, status || 'pago')
    res.status(201).json({ id: info.lastInsertRowid })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

router.put('/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const tenant_id = (req as any).user.tenant_id
  const { category, description, amount, date, status } = req.body

  try {
    const info = db.prepare(
      'UPDATE transactions SET category=?, description=?, amount=?, date=?, status=? WHERE id=? AND tenant_id=?'
    ).run(category, description, amount, date, status, id, tenant_id)
    if (info.changes === 0) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

router.delete('/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const tenant_id = (req as any).user.tenant_id
  const info = db.prepare('DELETE FROM transactions WHERE id=? AND tenant_id=?').run(id, tenant_id)
  if (info.changes === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
})

export default router
