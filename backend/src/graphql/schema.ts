import { buildSchema } from 'graphql'
import db from '../db'

export const schema = buildSchema(`
  type Project {
    id: ID!
    title: String!
    status: String!
    impact: String!
    location: String!
  }

  type Query {
    projects(tenantId: String!): [Project!]!
  }

  type Mutation {
    createProject(tenantId: String!, title: String!, status: String!, impact: String!, location: String!): Project!
  }
`)

export const rootValue = {
  projects: ({ tenantId }: { tenantId: string }) => {
    return db.prepare('SELECT id, title, status, impact, location FROM projects WHERE tenant_id = ?').all(tenantId)
  },
  createProject: ({ tenantId, title, status, impact, location }: any) => {
    const result = db.prepare('INSERT INTO projects (tenant_id, title, status, impact, location) VALUES (?, ?, ?, ?, ?)').run(tenantId, title, status, impact, location)
    return { id: result.lastInsertRowid, title, status, impact, location }
  }
}
