import express from 'express'
import db from '../db'
import { authMiddleware } from '../middleware/auth'

const router = express.Router()

// Rota pública para submissão de formulário pelo site
router.post('/public', (req, res) => {
  const { tenant_id, name, email, phone, cpf_cnpj, tipo, aceitou_termos } = req.body
  if (!tenant_id) return res.status(400).json({ error: 'tenant_id required' })
  if (!name) return res.status(400).json({ error: 'name required' })
  
  try {
    const info = db.prepare(`
      INSERT INTO parceiros (
        tenant_id, name, email, phone, cpf_cnpj, tipo, aceitou_termos, 
        status_aprovacao, active, exibir_site
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pendente', 0, 0)
    `).run(
      tenant_id, name, email || '', phone || '', cpf_cnpj || '', 
      tipo || 'Voluntário', aceitou_termos ? 1 : 0
    )
    
    res.status(201).json({ id: info.lastInsertRowid, success: true })
  } catch (e: any) { 
    console.error('Error public associado creation:', e)
    res.status(500).json({ error: e.message }) 
  }
})

// Lista todos os associados (admin vê todos)
router.get('/', (req, res) => {
  const { tenant_id } = req.query
  try {
    const targetTenant = tenant_id || 'instituto-mcs'
    const rows = db.prepare('SELECT * FROM parceiros WHERE tenant_id = ? OR tenant_id = "mcs" OR tenant_id = "instituto-mcs" ORDER BY created_at DESC').all(targetTenant)
    res.json(rows)
  } catch (e: any) { 
    console.error('Error listing associados:', e)
    res.status(500).json({ error: e.message }) 
  }
})

// Criação pelo admin via dashboard
router.post('/', authMiddleware, (req, res) => {
  const userTenant = (req as any).user?.tenant_id
  const tenant_id = req.body.tenant_id || userTenant || 'instituto-mcs'
  const { name, responsavel, endereco, cnpj, instagram, website, logo_url, active, tipo, email, phone, cpf_cnpj, exibir_site, status_aprovacao, aceitou_termos } = req.body
  if (!name) return res.status(400).json({ error: 'Nome do associado é obrigatório' })
  
  try {
    const info = db.prepare(`
      INSERT INTO parceiros (
        tenant_id, name, responsavel, endereco, cnpj, instagram, website, logo_url, active,
        tipo, email, phone, cpf_cnpj, exibir_site, status_aprovacao, aceitou_termos
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      tenant_id, name, responsavel || '', endereco || '', cnpj || '', instagram || '', website || '', logo_url || '', 
      active !== undefined ? Number(active) : 1,
      tipo || 'Voluntário', email || '', phone || '', cpf_cnpj || '', 
      exibir_site !== undefined ? Number(exibir_site) : 0,
      status_aprovacao || 'aprovado',
      aceitou_termos !== undefined ? Number(aceitou_termos) : 1
    )
    
    res.status(201).json({ id: info.lastInsertRowid, success: true })
  } catch (e: any) { 
    console.error('Error creating associado:', e)
    res.status(500).json({ error: e.message }) 
  }
})

// Atualização pelo admin via dashboard
router.put('/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const { name, responsavel, endereco, cnpj, instagram, website, logo_url, active, tipo, email, phone, cpf_cnpj, exibir_site, status_aprovacao, aceitou_termos } = req.body
  
  if (!name) return res.status(400).json({ error: 'Nome do associado é obrigatório' })

  try {
    const info = db.prepare(`
      UPDATE parceiros 
      SET name=?, responsavel=?, endereco=?, cnpj=?, instagram=?, website=?, logo_url=?, active=?,
          tipo=?, email=?, phone=?, cpf_cnpj=?, exibir_site=?, status_aprovacao=?, aceitou_termos=?
      WHERE id=?
    `).run(
      name, responsavel || '', endereco || '', cnpj || '', instagram || '', website || '', logo_url || '', 
      active !== undefined ? Number(active) : 1,
      tipo || '', email || '', phone || '', cpf_cnpj || '', 
      exibir_site !== undefined ? Number(exibir_site) : 0, 
      status_aprovacao || 'aprovado',
      aceitou_termos !== undefined ? Number(aceitou_termos) : 1,
      id
    )
    
    if (info.changes === 0) return res.status(404).json({ error: 'Associado não encontrado' })
    res.json({ success: true })
  } catch (e: any) { 
    console.error('Error updating associado:', e)
    res.status(500).json({ error: e.message }) 
  }
})

// Exclusão pelo admin via dashboard
router.delete('/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  try {
    const info = db.prepare('DELETE FROM parceiros WHERE id=?').run(id)
    if (info.changes === 0) return res.status(404).json({ error: 'Associado não encontrado' })
    res.json({ success: true })
  } catch (e: any) { 
    console.error('Error deleting associado:', e)
    res.status(500).json({ error: e.message }) 
  }
})

export default router
