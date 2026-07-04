import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const dbFile = process.env.DATABASE_FILE || path.join(__dirname, '..', 'data', 'mcs.db')
const directory = path.dirname(dbFile)
if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true })

const db = new Database(dbFile)

const createUsers = `CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`

const createTenants = `CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`

const createProjects = `CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  impact TEXT NOT NULL,
  location TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`

db.exec(createTenants)
db.exec(createUsers)
db.exec(createProjects)

export default db
