import express from 'express'
import db from '../db'
import { authMiddleware } from '../middleware/auth'

const router = express.Router()

router.get('/', authMiddleware, (req, res) => {
  const tenant_id = (req as any).user.tenant_id
  try {
    const rows = db.prepare(`
      SELECT a.*, p.title as project_name 
      FROM alunos a 
      LEFT JOIN projects p ON a.project_id = p.id 
      WHERE a.tenant_id = ? 
      ORDER BY a.created_at DESC
    `).all(tenant_id)
    res.json(rows)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

router.post('/', authMiddleware, (req, res) => {
  const {
    name, email, phone, area, project_id, status, birth_date,
    student_name, student_email, student_cpf, student_rg, address, gender, rnm, school_name, school_shift, school_grade,
    health_allergies, blood_type, weight, height, medications, health_conditions,
    parent_name, parent_email, parent_cpf, parent_rg, family_income, parents_profession, workplace, emergency_phone, emergency_phone_2, family_kinship,
    image_voice_authorization, pick_drop_responsibility, project_expectations, safety_word
  } = req.body
  const tenant_id = (req as any).user.tenant_id
  if (!name && !student_name) return res.status(400).json({ error: 'name or student_name required' })

  try {
    const finalStudentName = student_name || name
    const finalParentName = parent_name || name

    const info = db.prepare(`
      INSERT INTO alunos (
        tenant_id, name, email, phone, area, project_id, status, birth_date,
        student_name, student_email, student_cpf, student_rg, address, gender, rnm, school_name, school_shift, school_grade,
        health_allergies, blood_type, weight, height, medications, health_conditions,
        parent_name, parent_email, parent_cpf, parent_rg, family_income, parents_profession, workplace, emergency_phone, emergency_phone_2, family_kinship,
        image_voice_authorization, pick_drop_responsibility, project_expectations, safety_word
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      tenant_id, finalStudentName, email || student_email || '', phone || '', area || 'Educação', project_id || null, status || 'ativo', birth_date || null,
      finalStudentName, student_email || null, student_cpf || null, student_rg || null, address || null, gender || null, rnm || null, school_name || null, school_shift || null, school_grade || null,
      health_allergies || null, blood_type || null, weight || null, height || null, medications || null, health_conditions || null,
      finalParentName, parent_email || null, parent_cpf || null, parent_rg || null, family_income || null, parents_profession || null, workplace || null, emergency_phone || null, emergency_phone_2 || null, family_kinship || null,
      image_voice_authorization !== undefined ? (image_voice_authorization ? 1 : 0) : 1,
      pick_drop_responsibility !== undefined ? (pick_drop_responsibility ? 1 : 0) : 1,
      project_expectations || null, safety_word || null
    )
    res.status(201).json({ id: info.lastInsertRowid })
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

router.put('/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const tenant_id = (req as any).user.tenant_id
  const {
    name, email, phone, area, project_id, status, birth_date,
    student_name, student_email, student_cpf, student_rg, address, gender, rnm, school_name, school_shift, school_grade,
    health_allergies, blood_type, weight, height, medications, health_conditions,
    parent_name, parent_email, parent_cpf, parent_rg, family_income, parents_profession, workplace, emergency_phone, emergency_phone_2, family_kinship,
    image_voice_authorization, pick_drop_responsibility, project_expectations, safety_word
  } = req.body
  try {
    const finalStudentName = student_name || name
    const finalParentName = parent_name || name

    const info = db.prepare(`
      UPDATE alunos SET 
        name=?, email=?, phone=?, area=?, project_id=?, status=?, birth_date=?,
        student_name=?, student_email=?, student_cpf=?, student_rg=?, address=?, gender=?, rnm=?, school_name=?, school_shift=?, school_grade=?,
        health_allergies=?, blood_type=?, weight=?, height=?, medications=?, health_conditions=?,
        parent_name=?, parent_email=?, parent_cpf=?, parent_rg=?, family_income=?, parents_profession=?, workplace=?, emergency_phone=?, emergency_phone_2=?, family_kinship=?,
        image_voice_authorization=?, pick_drop_responsibility=?, project_expectations=?, safety_word=?
      WHERE id=? AND tenant_id=?
    `).run(
      finalStudentName, email || student_email || '', phone || '', area || 'Educação', project_id || null, status || 'ativo', birth_date || null,
      finalStudentName, student_email || null, student_cpf || null, student_rg || null, address || null, gender || null, rnm || null, school_name || null, school_shift || null, school_grade || null,
      health_allergies || null, blood_type || null, weight || null, height || null, medications || null, health_conditions || null,
      finalParentName, parent_email || null, parent_cpf || null, parent_rg || null, family_income || null, parents_profession || null, workplace || null, emergency_phone || null, emergency_phone_2 || null, family_kinship || null,
      image_voice_authorization !== undefined ? (image_voice_authorization ? 1 : 0) : 1,
      pick_drop_responsibility !== undefined ? (pick_drop_responsibility ? 1 : 0) : 1,
      project_expectations || null, safety_word || null,
      id, tenant_id
    )
    if (info.changes === 0) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true })
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

router.delete('/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const tenant_id = (req as any).user.tenant_id
  const info = db.prepare('DELETE FROM alunos WHERE id=? AND tenant_id=?').run(id, tenant_id)
  if (info.changes === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
})

export default router
