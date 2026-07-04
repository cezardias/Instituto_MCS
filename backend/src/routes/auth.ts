import { Router } from 'express'
import db from '../db'
import { hashPassword, comparePassword, generateToken } from '../auth'

const router = Router()

router.post('/register', async (req, res) => {
  const { name, email, password, tenantId } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Dados incompletos' })
  }

  const password_hash = await hashPassword(password)
  try {
    const stmt = db.prepare('INSERT INTO users (tenant_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)')
    const result = stmt.run(tenantId || 'instituto-mcs', name, email, password_hash, 'admin')
    const token = generateToken({ id: result.lastInsertRowid, email, tenant_id: tenantId || 'instituto-mcs', role: 'admin' })
    res.json({ token })
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'E-mail já cadastrado' })
    }
    return res.status(500).json({ error: 'Erro ao criar usuário' })
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios' })
  }

  // Busca o usuário pelo email em qualquer tenant
  const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
  if (!user) return res.status(401).json({ error: 'Credenciais inválidas' })

  const isValid = await comparePassword(password, user.password_hash)
  if (!isValid) return res.status(401).json({ error: 'Credenciais inválidas' })

  const token = generateToken({
    id: user.id,
    name: user.name,
    email: user.email,
    tenant_id: user.tenant_id,
    role: user.role
  })

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenant_id: user.tenant_id
    }
  })
})

export default router

