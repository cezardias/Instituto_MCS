import express from 'express'
import db from '../db'
import { authMiddleware } from '../middleware/auth'
import { hashPassword } from '../auth'

const router = express.Router()

// POST /api/oficineiros (Public - used by landing page)
router.post('/', (req, res) => {
  const { tenant_id, name, email, phone, cpf, birth_date, education, experience, contribution, availability, test_answers, scores, primary_profile, secondary_profile } = req.body

  if (!tenant_id || !name || !email || !phone || !cpf || !birth_date || !education || !experience || !contribution) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' })
  }

  const testAnswersStr = typeof test_answers === 'object' ? JSON.stringify(test_answers) : (test_answers || null)
  const scoresStr = typeof scores === 'object' ? JSON.stringify(scores) : (scores || null)

  try {
    const info = db.prepare(
      `INSERT INTO oficineiro_registrations 
       (tenant_id, name, email, phone, cpf, birth_date, education, experience, contribution, availability, test_answers, scores, primary_profile, secondary_profile) 
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).run(
      tenant_id, name, email, phone, cpf, birth_date, education, experience, contribution, availability || '',
      testAnswersStr, scoresStr, primary_profile || null, secondary_profile || null
    )
    
    res.status(201).json({ id: info.lastInsertRowid })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// GET /api/oficineiros (Protected - used by admin dashboard)
router.get('/', authMiddleware, (req, res) => {
  const tenant_id = (req as any).user.tenant_id
  
  try {
    const rows = db.prepare('SELECT * FROM oficineiro_registrations WHERE tenant_id = ? ORDER BY created_at DESC').all(tenant_id)
    res.json(rows)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// PUT /api/oficineiros/:id (Protected - used to update status)
router.put('/:id', authMiddleware, async (req, res) => {
  const tenant_id = (req as any).user.tenant_id
  const { id } = req.params
  const { status } = req.body

  if ((req as any).user.role !== 'admin') {
    return res.status(403).json({ error: 'Apenas administradores podem atualizar o status.' })
  }

  try {
    const info = db.prepare('UPDATE oficineiro_registrations SET status = ? WHERE id = ? AND tenant_id = ?').run(status, id, tenant_id)
    if (info.changes === 0) return res.status(404).json({ error: 'Inscrição não encontrada' })

    if (status === 'aprovado') {
      const reg: any = db.prepare('SELECT * FROM oficineiro_registrations WHERE id = ?').get(id)
      if (reg) {
        const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(reg.email)
        if (!existingUser) {
          const defaultPassword = await hashPassword('123456')
          db.prepare(`
            INSERT INTO users (tenant_id, name, email, password_hash, role, cpf, phone, birth_date, must_change_password)
            VALUES (?, ?, ?, ?, 'oficineiro', ?, ?, ?, 1)
          `).run(tenant_id, reg.name, reg.email, defaultPassword, reg.cpf || null, reg.phone || null, reg.birth_date || null)
        }
      }
    }

    res.json({ success: true })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

export default router
