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

const createTransactions = `CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'receita' or 'despesa'
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pago',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`

const createAccountability = `CREATE TABLE IF NOT EXISTS accountability_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  project_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  document_url TEXT,
  status TEXT NOT NULL DEFAULT 'em_analise',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
)`

const createDocuments = `CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL, -- 'relatorio' ou 'documento'
  document_url TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`

const createDenuncias = `CREATE TABLE IF NOT EXISTS reports_denuncias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  name TEXT,
  email TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`

const createVideos = `CREATE TABLE IF NOT EXISTS videos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  author TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`

const createVideoLikes = `CREATE TABLE IF NOT EXISTS video_likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  video_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(video_id) REFERENCES videos(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(video_id, user_id)
)`

const createVideoComments = `CREATE TABLE IF NOT EXISTS video_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  video_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  user_name TEXT NOT NULL,
  comment TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(video_id) REFERENCES videos(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
)`

db.exec(createTenants)
db.exec(createUsers)
db.exec(createProjects)
db.exec(createAlunos)
db.exec(createNews)
db.exec(createTransactions)
db.exec(createAccountability)
db.exec(createDocuments)
db.exec(createDenuncias)
db.exec(createVideos)
db.exec(createVideoLikes)
db.exec(createVideoComments)

export default db
