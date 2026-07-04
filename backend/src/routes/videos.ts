import express from 'express'
import db from '../db'
import { authMiddleware } from '../middleware/auth'

const router = express.Router()

// Get all videos with likes and comments
router.get('/', authMiddleware, (req, res) => {
  const tenant_id = (req as any).user.tenant_id
  const user_id = (req as any).user.id

  const videos = db.prepare('SELECT * FROM videos WHERE tenant_id = ? ORDER BY created_at DESC').all(tenant_id) as any[]
  
  // Attach likes and comments to each video
  for (const video of videos) {
    const likesCount = db.prepare('SELECT COUNT(*) as count FROM video_likes WHERE video_id = ?').get(video.id) as any
    const userLiked = db.prepare('SELECT 1 FROM video_likes WHERE video_id = ? AND user_id = ?').get(video.id, user_id) as any
    const comments = db.prepare('SELECT * FROM video_comments WHERE video_id = ? ORDER BY created_at DESC').all(video.id)
    
    video.likes = likesCount.count
    video.userLiked = !!userLiked
    video.comments = comments
  }

  res.json(videos)
})

// Add new video (Admin only)
router.post('/', authMiddleware, (req, res) => {
  const user = (req as any).user
  if (user.role !== 'admin') return res.status(403).json({ error: 'Acesso negado' })

  const { title, description, author, youtube_url, category } = req.body
  if (!title || !youtube_url || !category) return res.status(400).json({ error: 'Campos obrigatórios faltando' })

  try {
    const info = db.prepare(
      'INSERT INTO videos (tenant_id, title, description, author, youtube_url, category) VALUES (?,?,?,?,?,?)'
    ).run(user.tenant_id, title, description || '', author || '', youtube_url, category)
    res.json({ id: info.lastInsertRowid })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// Delete video
router.delete('/:id', authMiddleware, (req, res) => {
  const user = (req as any).user
  if (user.role !== 'admin') return res.status(403).json({ error: 'Acesso negado' })
  
  db.prepare('DELETE FROM videos WHERE id = ? AND tenant_id = ?').run(req.params.id, user.tenant_id)
  res.json({ success: true })
})

// Toggle Like
router.post('/:id/like', authMiddleware, (req, res) => {
  const user_id = (req as any).user.id
  const video_id = req.params.id

  const existing = db.prepare('SELECT * FROM video_likes WHERE video_id = ? AND user_id = ?').get(video_id, user_id)
  if (existing) {
    db.prepare('DELETE FROM video_likes WHERE video_id = ? AND user_id = ?').run(video_id, user_id)
  } else {
    db.prepare('INSERT INTO video_likes (video_id, user_id) VALUES (?,?)').run(video_id, user_id)
  }
  res.json({ success: true })
})

// Add comment
router.post('/:id/comments', authMiddleware, (req, res) => {
  const user = (req as any).user
  const video_id = req.params.id
  const { comment } = req.body

  if (!comment) return res.status(400).json({ error: 'Comentário vazio' })

  try {
    db.prepare(
      'INSERT INTO video_comments (video_id, user_id, user_name, comment) VALUES (?,?,?,?)'
    ).run(video_id, user.id, user.name || 'Usuário', comment)
    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
