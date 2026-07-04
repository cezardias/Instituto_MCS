import express from 'express'
import db from '../db'
import { authMiddleware } from '../middleware/auth'

const router = express.Router()

// Get all passaporte items for the logged in user (or all if admin)
router.get('/', authMiddleware, (req, res) => {
  const user = (req as any).user
  
  if (user.role === 'admin' || user.role === 'oficineiro') {
    // If admin or oficineiro, might want to see all students' passports.
    // For now, let's just return all items joined with user info
    const items = db.prepare(`
      SELECT p.*, u.name as user_name 
      FROM passaporte_items p
      JOIN users u ON p.user_id = u.id
      WHERE p.tenant_id = ?
      ORDER BY p.created_at DESC
    `).all(user.tenant_id)
    return res.json(items)
  } else {
    // For a student, return only their own passport items
    const items = db.prepare('SELECT * FROM passaporte_items WHERE tenant_id = ? AND user_id = ? ORDER BY created_at DESC').all(user.tenant_id, user.id)
    return res.json(items)
  }
})

// Award points/badge to a student
router.post('/', authMiddleware, (req, res) => {
  const user = (req as any).user
  if (user.role !== 'admin' && user.role !== 'oficineiro' && user.role !== 'coordenacao') {
    return res.status(403).json({ error: 'Acesso negado' })
  }

  const { user_id, badge_name, description, points } = req.body
  if (!user_id || !badge_name) return res.status(400).json({ error: 'Campos obrigatórios faltando' })

  try {
    const info = db.prepare('INSERT INTO passaporte_items (tenant_id, user_id, badge_name, description, points, awarded_by) VALUES (?,?,?,?,?,?)')
      .run(user.tenant_id, user_id, badge_name, description || '', points || 0, user.id)
    res.json({ id: info.lastInsertRowid })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', authMiddleware, (req, res) => {
  const user = (req as any).user
  if (user.role !== 'admin' && user.role !== 'oficineiro' && user.role !== 'coordenacao') {
    return res.status(403).json({ error: 'Acesso negado' })
  }
  
  db.prepare('DELETE FROM passaporte_items WHERE id = ? AND tenant_id = ?').run(req.params.id, user.tenant_id)
  res.json({ success: true })
})

export default router
