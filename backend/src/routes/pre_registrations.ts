import express from 'express'
import db from '../db'
import { authMiddleware } from '../middleware/auth'

const router = express.Router()

router.get('/', authMiddleware, (req, res) => {
  const tenant_id = (req as any).user.tenant_id
  try {
    const rows = db.prepare(`
      SELECT pr.*, p.title as project_name 
      FROM pre_registrations pr
      LEFT JOIN projects p ON pr.project_id = p.id
      WHERE pr.tenant_id = ? 
      ORDER BY pr.created_at DESC
    `).all(tenant_id)
    res.json(rows)
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

router.post('/', (req, res) => {
  const {
    tenant_id, name, email, phone, project_id, student_name, student_email, student_cpf, student_rg,
    address, gender, rnm, school_name, school_shift, school_grade, birth_date,
    health_allergies, blood_type, weight, height, medications, health_conditions,
    parent_name, family_income, parents_profession, workplace, emergency_phone, family_kinship,
    image_voice_authorization, pick_drop_responsibility, project_expectations, safety_word
  } = req.body

  if (!tenant_id || !name || !phone) return res.status(400).json({ error: 'tenant_id, name and phone required' })

  try {
    const info = db.prepare(`
      INSERT INTO pre_registrations (
        tenant_id, name, email, phone, project_id, student_name, student_email, student_cpf, student_rg,
        address, gender, rnm, school_name, school_shift, school_grade, birth_date,
        health_allergies, blood_type, weight, height, medications, health_conditions,
        parent_name, family_income, parents_profession, workplace, emergency_phone, family_kinship,
        image_voice_authorization, pick_drop_responsibility, project_expectations, safety_word
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      tenant_id, name, email || '', phone, project_id || null, student_name || null, student_email || null, student_cpf || null, student_rg || null,
      address || null, gender || null, rnm || null, school_name || null, school_shift || null, school_grade || null, birth_date || null,
      health_allergies || null, blood_type || null, weight || null, height || null, medications || null, health_conditions || null,
      parent_name || name, family_income || null, parents_profession || null, workplace || null, emergency_phone || null, family_kinship || null,
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
  const { status } = req.body
  try {
    const info = db.prepare('UPDATE pre_registrations SET status=? WHERE id=? AND tenant_id=?').run(status, id, tenant_id)
    if (info.changes === 0) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true })
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

router.delete('/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const tenant_id = (req as any).user.tenant_id
  try {
    const info = db.prepare('DELETE FROM pre_registrations WHERE id=? AND tenant_id=?').run(id, tenant_id)
    if (info.changes === 0) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true })
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

export default router
