import express from 'express'
import db from '../db'
import { authMiddleware } from '../middleware/auth'
import { hashPassword } from '../auth'

const router = express.Router()

// List users (admin only)
router.get('/', authMiddleware, (req, res) => {
  const tenant_id = (req as any).user.tenant_id
  
  // Verify if caller is admin
  if ((req as any).user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' })
  }

  try {
    const users = db.prepare('SELECT id, name, email, role, created_at FROM users WHERE tenant_id = ?').all(tenant_id)
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// Create user (admin only)
router.post('/', authMiddleware, async (req, res) => {
  const { name, email, password, role } = req.body
  const tenant_id = (req as any).user.tenant_id

  if ((req as any).user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' })
  }

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const hashedPassword = await hashPassword(password)
    const stmt = db.prepare('INSERT INTO users (tenant_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)')
    const info = stmt.run(tenant_id, name, email, hashedPassword, role || 'user')
    res.status(201).json({ id: info.lastInsertRowid })
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Email already exists' })
    }
    res.status(500).json({ error: 'Failed to create user' })
  }
})

// Delete user (admin only)
router.delete('/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const tenant_id = (req as any).user.tenant_id

  if ((req as any).user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' })
  }

  try {
    const stmt = db.prepare('DELETE FROM users WHERE id = ? AND tenant_id = ?')
    const info = stmt.run(id, tenant_id)
    if (info.changes === 0) return res.status(404).json({ error: 'User not found' })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' })
  }
})

export default router
