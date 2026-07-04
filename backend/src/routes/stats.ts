import express from 'express'
import db from '../db'
import { authMiddleware } from '../middleware/auth'

const router = express.Router()

router.get('/', authMiddleware, (req, res) => {
  const tenant_id = (req as any).user.tenant_id

  const totalAlunos: any = db.prepare("SELECT COUNT(*) as count FROM alunos WHERE tenant_id=? AND status='ativo'").get(tenant_id)
  const totalProjetos: any = db.prepare("SELECT COUNT(*) as count FROM projects WHERE tenant_id=? AND status='em_execucao'").get(tenant_id)
  const totalNews: any = db.prepare('SELECT COUNT(*) as count FROM news WHERE tenant_id=?').get(tenant_id)
  const totalUsers: any = db.prepare('SELECT COUNT(*) as count FROM users WHERE tenant_id=?').get(tenant_id)
  const totalBeneficiados: any = db.prepare('SELECT SUM(beneficiados) as total FROM projects WHERE tenant_id=?').get(tenant_id)
  const totalBudget: any = db.prepare('SELECT SUM(budget) as total FROM projects WHERE tenant_id=?').get(tenant_id)

  // Alunos por área
  const alunosPorArea = db.prepare(
    "SELECT area, COUNT(*) as count FROM alunos WHERE tenant_id=? AND status='ativo' GROUP BY area ORDER BY count DESC"
  ).all(tenant_id)

  // Projetos por status
  const projetosPorStatus = db.prepare(
    'SELECT status, COUNT(*) as count FROM projects WHERE tenant_id=? GROUP BY status'
  ).all(tenant_id)

  res.json({
    alunos_ativos: totalAlunos?.count || 0,
    projetos_em_execucao: totalProjetos?.count || 0,
    total_noticias: totalNews?.count || 0,
    total_usuarios: totalUsers?.count || 0,
    pessoas_beneficiadas: totalBeneficiados?.total || 0,
    recursos_captados: totalBudget?.total || 0,
    alunos_por_area: alunosPorArea,
    projetos_por_status: projetosPorStatus,
  })
})

export default router
