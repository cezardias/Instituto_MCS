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
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

// Lista todos os associados (admin vê todos)
router.get('/', (req, res) => {
  const { tenant_id } = req.query
  if (!tenant_id) return res.status(400).json({ error: 'tenant_id required' })
  try {
    const rows = db.prepare('SELECT * FROM parceiros WHERE tenant_id = ? ORDER BY created_at DESC').all(tenant_id)
    res.json(rows)
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

// Criação pelo admin via dashboard
router.post('/', authMiddleware, (req, res) => {
  const tenant_id = (req as any).user.tenant_id
  const { name, responsavel, endereco, cnpj, instagram, website, logo_url, active, tipo, email, phone, cpf_cnpj, exibir_site, status_aprovacao } = req.body
  if (!name) return res.status(400).json({ error: 'name required' })
  
  try {
    const info = db.prepare(`
      INSERT INTO parceiros (
        tenant_id, name, responsavel, endereco, cnpj, instagram, website, logo_url, active,
        tipo, email, phone, cpf_cnpj, exibir_site, status_aprovacao, aceitou_termos
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(
      tenant_id, name, responsavel || '', endereco || '', cnpj || '', instagram || '', website || '', logo_url || '', 
      active !== undefined ? active : 1,
      tipo || 'Voluntário', email || '', phone || '', cpf_cnpj || '', 
      exibir_site !== undefined ? exibir_site : 0,
      status_aprovacao || 'aprovado' // Admin criando direto, já vai aprovado
    )
    
    res.status(201).json({ id: info.lastInsertRowid })
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

// Atualização pelo admin via dashboard
router.put('/:id', authMiddleware, (req, res) => {
  const tenant_id = (req as any).user.tenant_id
  const { id } = req.params
  const { name, responsavel, endereco, cnpj, instagram, website, logo_url, active, tipo, email, phone, cpf_cnpj, exibir_site, status_aprovacao } = req.body
  
  try {
    const info = db.prepare(`
      UPDATE parceiros 
      SET name=?, responsavel=?, endereco=?, cnpj=?, instagram=?, website=?, logo_url=?, active=?,
          tipo=?, email=?, phone=?, cpf_cnpj=?, exibir_site=?, status_aprovacao=?
      WHERE id=? AND tenant_id=?
    `).run(
      name, responsavel || '', endereco || '', cnpj || '', instagram || '', website || '', logo_url || '', 
      active !== undefined ? active : 1,
      tipo || '', email || '', phone || '', cpf_cnpj || '', 
      exibir_site !== undefined ? exibir_site : 0, status_aprovacao || 'pendente',
      id, tenant_id
    )
    
    if (info.changes === 0) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true })
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

// Exclusão pelo admin via dashboard
router.delete('/:id', authMiddleware, (req, res) => {
  const tenant_id = (req as any).user.tenant_id
  const { id } = req.params
  try {
    const info = db.prepare('DELETE FROM parceiros WHERE id=? AND tenant_id=?').run(id, tenant_id)
    if (info.changes === 0) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true })
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

export default router
