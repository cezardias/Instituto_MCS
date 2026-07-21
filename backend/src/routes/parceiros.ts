import express from 'express'
import db from '../db'
import { authMiddleware } from '../middleware/auth'

const router = express.Router()

router.get('/', (req, res) => {
  const { tenant_id } = req.query
  if (!tenant_id) return res.status(400).json({ error: 'tenant_id required' })
  try {
    const rows = db.prepare('SELECT * FROM parceiros WHERE tenant_id = ? ORDER BY created_at DESC').all(tenant_id)
    res.json(rows)
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

router.post('/', authMiddleware, (req, res) => {
  const tenant_id = (req as any).user.tenant_id
  const { name, responsavel, endereco, cnpj, instagram, website, logo_url, active } = req.body
  if (!name) return res.status(400).json({ error: 'name required' })
  
  try {
    const info = db.prepare(`
      INSERT INTO parceiros (tenant_id, name, responsavel, endereco, cnpj, instagram, website, logo_url, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(tenant_id, name, responsavel || '', endereco || '', cnpj || '', instagram || '', website || '', logo_url || '', active !== undefined ? active : 1)
    
    res.status(201).json({ id: info.lastInsertRowid })
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

router.put('/:id', authMiddleware, (req, res) => {
  const tenant_id = (req as any).user.tenant_id
  const { id } = req.params
  const { name, responsavel, endereco, cnpj, instagram, website, logo_url, active } = req.body
  
  try {
    const info = db.prepare(`
      UPDATE parceiros 
      SET name=?, responsavel=?, endereco=?, cnpj=?, instagram=?, website=?, logo_url=?, active=?
      WHERE id=? AND tenant_id=?
    `).run(name, responsavel || '', endereco || '', cnpj || '', instagram || '', website || '', logo_url || '', active !== undefined ? active : 1, id, tenant_id)
    
    if (info.changes === 0) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true })
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

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
