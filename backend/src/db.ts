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
  status TEXT NOT NULL DEFAULT 'em_execucao',
  area TEXT NOT NULL DEFAULT 'Educação',
  location TEXT NOT NULL,
  beneficiados INTEGER DEFAULT 0,
  budget REAL DEFAULT 0,
  start_date TEXT,
  end_date TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`

const createAlunos = `CREATE TABLE IF NOT EXISTS alunos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  area TEXT NOT NULL DEFAULT 'Educação',
  project_id INTEGER,
  status TEXT NOT NULL DEFAULT 'ativo',
  birth_date TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`

const createNews = `CREATE TABLE IF NOT EXISTS news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`

db.exec(createTenants)
db.exec(createUsers)
db.exec(createProjects)
db.exec(createAlunos)
db.exec(createNews)

export default db
