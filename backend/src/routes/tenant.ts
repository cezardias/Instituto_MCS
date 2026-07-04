import { Router } from 'express'
import db from '../db'

const router = Router()

router.get('/', (req, res) => {
  const tenants = db.prepare('SELECT id, name, slug, created_at FROM tenants').all()
  res.json({ tenants })
})

router.post('/', (req, res) => {
  const { id, name, slug } = req.body
  if (!id || !name || !slug) return res.status(400).json({ error: 'Dados obrigatórios' })
  try {
    db.prepare('INSERT INTO tenants (id, name, slug) VALUES (?, ?, ?)').run(id, name, slug)
    res.status(201).json({ id, name, slug })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar tenant' })
  }
})

export default router
