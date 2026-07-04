import express from 'express'
import db from '../db'
import { authMiddleware } from '../middleware/auth'

const router = express.Router()

// List all news (public)
router.get('/', (req, res) => {
  const { tenant_id } = req.query
  if (!tenant_id) {
    return res.status(400).json({ error: 'tenant_id is required' })
  }

  try {
    const news = db.prepare('SELECT * FROM news WHERE tenant_id = ? ORDER BY created_at DESC').all(tenant_id)
    res.json(news)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news' })
  }
})

// Get single news (public)
router.get('/:id', (req, res) => {
  const { id } = req.params
  const { tenant_id } = req.query
  if (!tenant_id) {
    return res.status(400).json({ error: 'tenant_id is required' })
  }

  try {
    const newsItem = db.prepare('SELECT * FROM news WHERE id = ? AND tenant_id = ?').get(id, tenant_id)
    if (!newsItem) return res.status(404).json({ error: 'News not found' })
    res.json(newsItem)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news' })
  }
})

// Create news (admin only)
router.post('/', authMiddleware, (req, res) => {
  const { title, category, content, image_url } = req.body
  const tenant_id = (req as any).user.tenant_id

  if (!title || !category || !content) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const stmt = db.prepare('INSERT INTO news (tenant_id, title, category, content, image_url) VALUES (?, ?, ?, ?, ?)')
    const info = stmt.run(tenant_id, title, category, content, image_url || null)
    res.status(201).json({ id: info.lastInsertRowid })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create news' })
  }
})

// Update news (admin only)
router.put('/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const { title, category, content, image_url } = req.body
  const tenant_id = (req as any).user.tenant_id

  try {
    const stmt = db.prepare('UPDATE news SET title = ?, category = ?, content = ?, image_url = ? WHERE id = ? AND tenant_id = ?')
    const info = stmt.run(title, category, content, image_url, id, tenant_id)
    if (info.changes === 0) return res.status(404).json({ error: 'News not found' })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update news' })
  }
})

// Delete news (admin only)
router.delete('/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const tenant_id = (req as any).user.tenant_id

  try {
    const stmt = db.prepare('DELETE FROM news WHERE id = ? AND tenant_id = ?')
    const info = stmt.run(id, tenant_id)
    if (info.changes === 0) return res.status(404).json({ error: 'News not found' })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete news' })
  }
})

export default router
