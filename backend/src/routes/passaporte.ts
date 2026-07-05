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

router.get('/ranking', authMiddleware, (req, res) => {
  const user = (req as any).user
  // Calculate total points for all students
  const users = db.prepare(`
    SELECT u.id, u.name, u.email,
      COALESCE((SELECT SUM(points) FROM passaporte_items WHERE user_id = u.id), 0) as badges_points,
      COALESCE((
        SELECT SUM(d.teacher_grade) 
        FROM assessment_deliveries d 
        JOIN assessments a ON d.assessment_id = a.id 
        WHERE d.student_id = u.id AND d.status = 'graded' AND a.is_gamified = 1
      ), 0) as games_points
    FROM users u
    WHERE u.tenant_id = ? AND u.role = 'aluno'
  `).all(user.tenant_id)
  
  const ranking = users.map((u: any) => ({
    ...u,
    total_points: u.badges_points + u.games_points
  })).sort((a: any, b: any) => b.total_points - a.total_points)

  res.json(ranking)
})

export default router
