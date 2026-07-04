import express from 'express'
import cors from 'cors'
import { json } from 'express'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import tenantRoutes from './routes/tenant'
import adminRoutes from './routes/admin'
import { graphqlHTTP } from 'express-graphql'
import { schema, rootValue } from './graphql/schema'
import tenantMiddleware from './middleware/tenant'

dotenv.config()

const app = express()
app.use(cors())
app.use(json())
app.use(tenantMiddleware)

app.use('/auth', authRoutes)
app.use('/tenant', tenantRoutes)
app.use('/admin', adminRoutes)
app.use('/graphql', graphqlHTTP({ schema, rootValue, graphiql: true }))
app.get('/health', (_, res) => res.json({ status: 'ok' }))

export default app
