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
import financeRoutes from './routes/finance'
import accountabilityRoutes from './routes/accountability'
import documentsRoutes from './routes/documents'
import denunciasRoutes from './routes/denuncias'
import videosRoutes from './routes/videos'
import comunicadosRoutes from './routes/comunicados'
import passaporteRoutes from './routes/passaporte'
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
app.use('/api/finance', financeRoutes)
app.use('/api/accountability', accountabilityRoutes)
app.use('/api/documents', documentsRoutes)
app.use('/api/denuncias', denunciasRoutes)
app.use('/api/videos', videosRoutes)
app.use('/api/comunicados', comunicadosRoutes)
app.use('/api/passaporte', passaporteRoutes)
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

seedAdmin().catch(console.error)

export default app
