import express from 'express'
import cors from 'cors'
import { json } from 'express'
import path from 'path'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import tenantRoutes from './routes/tenant'
import adminRoutes from './routes/admin'
import newsRoutes from './routes/news'
import usersRoutes from './routes/users'
import uploadRoutes from './routes/upload'
import projectsRoutes from './routes/projects'
import alunosRoutes from './routes/alunos'
import statsRoutes from './routes/stats'
import preRegistrationsRoutes from './routes/pre_registrations'
import financeRoutes from './routes/finance'
import accountabilityRoutes from './routes/accountability'
import documentsRoutes from './routes/documents'
import denunciasRoutes from './routes/denuncias'
import videosRoutes from './routes/videos'
import comunicadosRoutes from './routes/comunicados'
import passaporteRoutes from './routes/passaporte'
import authorizationsRoutes from './routes/authorizations'
import classesRoutes from './routes/classes'
import assessmentsRoutes from './routes/assessments'
import jornadaRoutes from './routes/jornada'
import oficineirosRoutes from './routes/oficineiros'
import parceirosRoutes from './routes/parceiros'
import { graphqlHTTP } from 'express-graphql'
import { schema, rootValue } from './graphql/schema'
import tenantMiddleware from './middleware/tenant'
import db from './db'
import { hashPassword } from './auth'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '..', '..', 'uploads')))
app.use('/api/uploads', express.static(path.join(__dirname, '..', '..', 'uploads')))

app.use(tenantMiddleware)

app.use('/auth', authRoutes)
app.use('/api/auth', authRoutes)   // alias para o frontend via nginx
app.use('/tenant', tenantRoutes)
app.use('/admin', adminRoutes)
app.use('/api/news', newsRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/projects', projectsRoutes)
app.use('/api/alunos', alunosRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/pre-registration', preRegistrationsRoutes)
app.use('/api/finance', financeRoutes)
app.use('/api/accountability', accountabilityRoutes)
app.use('/api/documents', documentsRoutes)
app.use('/api/denuncias', denunciasRoutes)
app.use('/api/parceiros', parceirosRoutes)
app.use('/api/videos', videosRoutes)
app.use('/api/comunicados', comunicadosRoutes)
app.use('/api/passaporte', passaporteRoutes)
app.use('/api/authorizations', authorizationsRoutes)
app.use('/api/classes', classesRoutes)
app.use('/api/assessments', assessmentsRoutes)
app.use('/api/jornada', jornadaRoutes)
app.use('/api/oficineiros', oficineirosRoutes)
app.use('/graphql', graphqlHTTP({ schema, rootValue, graphiql: true }))
app.get('/health', (_, res) => res.json({ status: 'ok' }))

// Seed: create default tenant and admin user if not exists
async function seedAdmin() {
  const TENANT_ID = 'instituto-mcs'
  const ADMIN_EMAIL = 'admin@institutomcs.org.br'

  // Create tenant if not exists
  const existingTenant = db.prepare('SELECT id FROM tenants WHERE id = ?').get(TENANT_ID)
  if (!existingTenant) {
    db.prepare('INSERT INTO tenants (id, name, slug) VALUES (?, ?, ?)').run(
      TENANT_ID,
      'Instituto Movimento de Cultura Social',
      'instituto-mcs'
    )
    console.log('✅ Tenant "instituto-mcs" criado')
  }

  // Create admin user if not exists
  const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(ADMIN_EMAIL)
  if (!existingAdmin) {
    const hash = await hashPassword('admin123')
    db.prepare('INSERT INTO users (tenant_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)').run(
      TENANT_ID,
      'Administrador',
      ADMIN_EMAIL,
      hash,
      'admin'
    )
    console.log(`✅ Admin criado: ${ADMIN_EMAIL} / admin123`)
  }
}

async function seedMCMission() {
  const TENANT_ID = 'instituto-mcs'
  const ADMIN_EMAIL = 'admin@institutomcs.org.br'
  
  const admin = db.prepare('SELECT id FROM users WHERE email = ?').get(ADMIN_EMAIL) as any
  if (!admin) return

  const missionTitle = 'O que é ser um MC na vida?'
  const existingMission = db.prepare('SELECT id FROM assessments WHERE title = ?').get(missionTitle)
  
  if (!existingMission) {
    console.log('🌱 Criando Missão Gamificada: O que é ser um MC na vida?')
    
    // Create the assessment
    const stmt = db.prepare(`
      INSERT INTO assessments (tenant_id, title, description, type, target_type, target_ids, max_score, is_gamified, journey_order, created_by)
      VALUES (?, ?, ?, 'questionario', 'all', '[]', 100, 1, 1, ?)
    `)
    
    const info = stmt.run(
      TENANT_ID, 
      missionTitle, 
      'Nesta missão, vamos explorar a essência de ser um Mestre de Cerimônias (MC) não apenas nos palcos, mas na atitude, no estilo e na posição social dentro da comunidade.',
      admin.id
    )
    
    const assessmentId = info.lastInsertRowid
    
    // Create Questions
    const qStmt = db.prepare(`INSERT INTO assessment_questions (assessment_id, type, question_text, options_json) VALUES (?, ?, ?, ?)`)
    
    // Q1
    qStmt.run(assessmentId, 'multiple_choice', "O que significa a sigla 'MC' originalmente na cultura Hip-Hop e como isso se traduz para a vida cotidiana?", JSON.stringify([
      "A) 'Mestre de Cerimônias' - Significa ser o protagonista da própria história e ter a responsabilidade de passar uma mensagem e liderar.",
      "B) 'Músico Cantor' - Significa apenas fazer rimas em batalhas de rap de forma técnica.",
      "C) 'Menino Criativo' - É apenas uma gíria moderna para jovens artistas.",
      "D) 'Mundo da Cultura' - Representa apenas o gosto musical e roupas de marca."
    ]))
    
    // Q2
    qStmt.run(assessmentId, 'multiple_choice', "O estilo de roupas e a estética visual de um MC e da cultura urbana refletem principalmente:", JSON.stringify([
      "A) Apenas a vontade de usar as marcas de luxo mais caras e ostentar dinheiro.",
      "B) Uma obrigação de usar sempre calças muito largas e correntes de ouro.",
      "C) Identidade cultural, resistência, pertencimento e o orgulho das próprias raízes.",
      "D) O desejo de se vestir igual a todo mundo para não ser notado."
    ]))
    
    // Q3
    qStmt.run(assessmentId, 'dissertation', "Na sua opinião, qual é a responsabilidade e a posição social de um verdadeiro MC dentro da sua comunidade (quebrada/bairro)?", '[]')
    
    // Q4
    qStmt.run(assessmentId, 'multiple_choice', "Ser um 'MC' na vida real, mesmo sem cantar ou rimar, significa ter a atitude de:", JSON.stringify([
      "A) Ter coragem para falar suas verdades, lutar pelo que é certo e inspirar os outros ao redor.",
      "B) Focar inteiramente no sucesso financeiro e ignorar os problemas coletivos.",
      "C) Competir com todos ao seu redor para provar quem é o melhor.",
      "D) Falar usando rimas e gírias o tempo todo em qualquer conversa."
    ]))
    
    // Q5
    qStmt.run(assessmentId, 'dissertation', "Descreva o SEU próprio estilo (roupas, jeito de falar, atitude) e o que você acha que esse seu estilo comunica para o mundo sobre quem você é.", '[]')
    
    console.log('✅ Missão Gamificada criada com sucesso!')
  }
}

seedAdmin().then(() => seedMCMission()).catch(console.error)

export default app
