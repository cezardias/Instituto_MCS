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
    const users = db.prepare('SELECT * FROM users WHERE tenant_id = ?').all(tenant_id)
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// Create user (admin only)
router.post('/', authMiddleware, async (req, res) => {
  const { name, email, password, role, personal_email, cpf, rg, phone, address, photo_url, parent, birth_date, medical_report_url, anamnesis_url, anamnesis_data, family_income, parents_profession, education, availability_schedule, positive_points, negative_points } = req.body
  const tenant_id = (req as any).user.tenant_id

  if ((req as any).user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' })
  }

  if (!name) return res.status(400).json({ error: 'Name is required' })

  // Auto-generate system email if not provided
  const generateUniqueEmail = (n: string) => {
    const clean = n.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    const parts = clean.split(' ').filter(p => p.length > 0)
    let base = ''
    if (parts.length > 1) {
      base = `${parts[0]}.${parts[parts.length-1]}`
    } else if (parts.length === 1) {
      base = `${parts[0]}`
    } else {
      base = `usuario`
    }
    
    let candidate = `${base}@institutomcs.org.br`
    let counter = 1
    while (db.prepare('SELECT id FROM users WHERE email = ?').get(candidate)) {
      candidate = `${base}${counter}@institutomcs.org.br`
      counter++
    }
    return candidate
  }

  if (email && db.prepare('SELECT id FROM users WHERE email = ?').get(email)) {
    return res.status(400).json({ error: 'O login (e-mail de acesso) informado já está em uso.' })
  }

  const systemEmail = email || generateUniqueEmail(name)
  const systemPassword = password || '123456'

  try {
    const hashedPassword = await hashPassword(systemPassword)
    let finalId = 0
    
    // Begin transaction
    db.exec('BEGIN TRANSACTION')

    try {
      let parent_id = null
      
      // If role is aluno and parent info exists, create parent first
      if (role === 'aluno' && parent && parent.name) {
        const parentSystemEmail = parent.email || generateUniqueEmail(parent.name)
        const parentHashedPassword = await hashPassword('123456')
        
        const parentStmt = db.prepare('INSERT INTO users (tenant_id, name, email, password_hash, role, personal_email, cpf, rg, phone, must_change_password, birth_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        const pInfo = parentStmt.run(tenant_id, parent.name, parentSystemEmail, parentHashedPassword, 'responsavel', parent.personal_email || null, parent.cpf || null, parent.rg || null, parent.phone || null, 1, parent.birth_date || null)
        parent_id = pInfo.lastInsertRowid
      }

      const stmt = db.prepare('INSERT INTO users (tenant_id, name, email, password_hash, role, personal_email, cpf, rg, phone, address, photo_url, must_change_password, parent_id, birth_date, medical_report_url, anamnesis_url, anamnesis_data, family_income, parents_profession, education, availability_schedule, positive_points, negative_points) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      const info = stmt.run(tenant_id, name, systemEmail, hashedPassword, role || 'user', personal_email || null, cpf || null, rg || null, phone || null, address || null, photo_url || null, 1, parent_id, birth_date || null, medical_report_url || null, anamnesis_url || null, anamnesis_data ? JSON.stringify(anamnesis_data) : null, family_income || null, parents_profession || null, education || null, availability_schedule || null, positive_points || null, negative_points || null)
      
      finalId = Number(info.lastInsertRowid)
      db.exec('COMMIT')
    } catch (e: any) {
      db.exec('ROLLBACK')
      throw e
    }
    
    res.status(201).json({ id: finalId, email: systemEmail })
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Email já existe (talvez o nome gerado colidiu)' })
    }
    res.status(500).json({ error: 'Failed to create user: ' + error.message })
  }
})

// Update user (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params
  const { name, email, role, personal_email, cpf, rg, phone, address, photo_url, birth_date, family_income, parents_profession, password, education, availability_schedule, positive_points, negative_points } = req.body
  const tenant_id = (req as any).user.tenant_id

  if ((req as any).user.role !== 'admin' && (req as any).user.role !== 'diretoria') {
    return res.status(403).json({ error: 'Forbidden' })
  }

  try {
    const updateCols = [
      'name = ?', 'email = ?', 'role = ?', 'personal_email = ?', 'cpf = ?', 
      'rg = ?', 'phone = ?', 'address = ?', 'birth_date = ?', 'family_income = ?', 'parents_profession = ?',
      'education = ?', 'availability_schedule = ?', 'positive_points = ?', 'negative_points = ?'
    ]
    const updateVals = [
      name, email, role, personal_email || null, cpf || null,
      rg || null, phone || null, address || null, birth_date || null, family_income || null, parents_profession || null,
      education || null, availability_schedule || null, positive_points || null, negative_points || null
    ]

    const extraFields = [
      'student_name', 'student_email', 'student_cpf', 'student_rg', 'gender', 'rnm', 'school_name', 'school_shift', 'school_grade',
      'health_allergies', 'blood_type', 'weight', 'height', 'medications', 'health_conditions',
      'parent_name', 'parent_email', 'parent_cpf', 'parent_rg', 'workplace', 'emergency_phone', 'emergency_phone_2', 'family_kinship', 'safety_word',
      'image_voice_authorization', 'pick_drop_responsibility', 'project_expectations'
    ]
    extraFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateCols.push(`${field} = ?`)
        updateVals.push(req.body[field] || null)
      }
    })

    if (photo_url) {
      updateCols.push('photo_url = ?')
      updateVals.push(photo_url)
    }

    if (password) {
      updateCols.push('password_hash = ?')
      updateVals.push(await hashPassword(password))
    }

    updateVals.push(id, tenant_id)

    const stmt = db.prepare(`UPDATE users SET ${updateCols.join(', ')} WHERE id = ? AND tenant_id = ?`)
    const info = stmt.run(...updateVals)

    if (info.changes === 0) return res.status(404).json({ error: 'User not found' })
    res.json({ success: true })
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Email já existe' })
    }
    res.status(500).json({ error: 'Failed to update user' })
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

// Update user anamnesis (admin only)
router.put('/:id/anamnesis', authMiddleware, (req, res) => {
  const { id } = req.params
  const { anamnesis_data } = req.body
  const tenant_id = (req as any).user.tenant_id

  if ((req as any).user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' })
  }

  try {
    const stmt = db.prepare('UPDATE users SET anamnesis_data = ? WHERE id = ? AND tenant_id = ?')
    const info = stmt.run(anamnesis_data ? JSON.stringify(anamnesis_data) : null, id, tenant_id)
    if (info.changes === 0) return res.status(404).json({ error: 'User not found' })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update anamnesis' })
  }
})

export default router
