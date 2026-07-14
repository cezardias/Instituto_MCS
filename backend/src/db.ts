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
  personal_email TEXT,
  cpf TEXT,
  rg TEXT,
  phone TEXT,
  address TEXT,
  photo_url TEXT,
  must_change_password BOOLEAN DEFAULT 0,
  parent_id INTEGER,
  streak INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 0,
  league TEXT DEFAULT 'Bronze',
  last_activity TEXT,
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

const createComunicados = `CREATE TABLE IF NOT EXISTS comunicados (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  author_name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`

const createPassaporteItems = `CREATE TABLE IF NOT EXISTS passaporte_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  badge_name TEXT NOT NULL,
  description TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  awarded_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
)`

const createAuthorizations = `CREATE TABLE IF NOT EXISTS authorizations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date TEXT,
  event_time TEXT,
  location TEXT,
  target_type TEXT DEFAULT 'all',
  target_id INTEGER,
  created_by INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`

const createAuthorizationSignatures = `CREATE TABLE IF NOT EXISTS authorization_signatures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  authorization_id INTEGER NOT NULL,
  parent_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  signed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(authorization_id, parent_id, student_id)
)`

const createClasses = `CREATE TABLE IF NOT EXISTS classes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`

const createClassTeachers = `CREATE TABLE IF NOT EXISTS class_teachers (
  class_id INTEGER NOT NULL,
  teacher_id INTEGER NOT NULL,
  PRIMARY KEY(class_id, teacher_id)
)`

const createClassStudents = `CREATE TABLE IF NOT EXISTS class_students (
  class_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  PRIMARY KEY(class_id, student_id)
)`

const createClassLessons = `CREATE TABLE IF NOT EXISTS class_lessons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  class_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  start_time TEXT,
  end_time TEXT,
  description TEXT,
  created_by INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`

const createAttendance = `CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lesson_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  status TEXT NOT NULL,
  justification_text TEXT,
  justification_file_url TEXT,
  recorded_by INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(lesson_id, student_id)
)`

const createAssessments = `CREATE TABLE IF NOT EXISTS assessments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT,
  time TEXT,
  type TEXT NOT NULL,
  target_type TEXT DEFAULT 'all',
  target_ids TEXT,
  max_score REAL,
  is_gamified INTEGER DEFAULT 0,
  journey_order INTEGER DEFAULT 0,
  created_by INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`

const createAssessmentQuestions = `CREATE TABLE IF NOT EXISTS assessment_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assessment_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  question_text TEXT NOT NULL,
  options_json TEXT,
  FOREIGN KEY(assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
)`

const createAssessmentDeliveries = `CREATE TABLE IF NOT EXISTS assessment_deliveries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assessment_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  answers_json TEXT,
  signed BOOLEAN DEFAULT 0,
  delivered_at DATETIME,
  teacher_grade REAL,
  teacher_comment TEXT,
  status TEXT DEFAULT 'pending',
  FOREIGN KEY(assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
)`

db.exec(createTenants)
db.exec(createUsers)

// Graceful upgrade for existing users table
try { db.exec("ALTER TABLE users ADD COLUMN personal_email TEXT") } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN cpf TEXT") } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN rg TEXT") } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN phone TEXT") } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN address TEXT") } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN photo_url TEXT") } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN must_change_password BOOLEAN DEFAULT 0") } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN parent_id INTEGER") } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN birth_date TEXT") } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN medical_report_url TEXT") } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN anamnesis_url TEXT") } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN anamnesis_data TEXT") } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN family_income TEXT") } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN parents_profession TEXT") } catch(e) {}
try { db.exec("ALTER TABLE authorizations ADD COLUMN target_type TEXT DEFAULT 'all'") } catch(e) {}
try { db.exec("ALTER TABLE authorizations ADD COLUMN target_id INTEGER") } catch(e) {}
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
db.exec(createComunicados)
db.exec(createPassaporteItems)
db.exec(createAuthorizations)
db.exec(createAuthorizationSignatures)
db.exec(createClasses)
db.exec(createClassTeachers)
db.exec(createClassStudents)
db.exec(createClassLessons)
// Gracefully migrate attendance table
try { db.exec('ALTER TABLE attendance RENAME TO old_attendance_v1') } catch(e) {}
db.exec(createAttendance)
db.exec(createAssessments)
db.exec(createAssessmentQuestions)
db.exec(createAssessmentDeliveries)

// Ensure is_gamified column exists if migrating
try {
  db.exec(`ALTER TABLE assessments ADD COLUMN is_gamified INTEGER DEFAULT 0`)
} catch (err) {}

try {
  db.exec(`ALTER TABLE assessments ADD COLUMN journey_order INTEGER DEFAULT 0`)
} catch (err) {}

try {
  db.exec(`ALTER TABLE users ADD COLUMN streak INTEGER DEFAULT 0`)
  db.exec(`ALTER TABLE users ADD COLUMN coins INTEGER DEFAULT 0`)
  db.exec(`ALTER TABLE users ADD COLUMN league TEXT DEFAULT 'Bronze'`)
  db.exec(`ALTER TABLE users ADD COLUMN last_activity TEXT`)
} catch (err) {}

export default db
