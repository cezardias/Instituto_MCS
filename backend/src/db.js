"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var better_sqlite3_1 = require("better-sqlite3");
var path_1 = require("path");
var fs_1 = require("fs");
var dbFile = process.env.DATABASE_FILE || path_1.default.join(__dirname, '..', 'data', 'mcs.db');
var directory = path_1.default.dirname(dbFile);
if (!fs_1.default.existsSync(directory))
    fs_1.default.mkdirSync(directory, { recursive: true });
var db = new better_sqlite3_1.default(dbFile);
var createUsers = "CREATE TABLE IF NOT EXISTS users (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  tenant_id TEXT NOT NULL,\n  name TEXT NOT NULL,\n  email TEXT NOT NULL UNIQUE,\n  password_hash TEXT NOT NULL,\n  role TEXT NOT NULL DEFAULT 'user',\n  personal_email TEXT,\n  cpf TEXT,\n  rg TEXT,\n  phone TEXT,\n  address TEXT,\n  photo_url TEXT,\n  must_change_password BOOLEAN DEFAULT 0,\n  parent_id INTEGER,\n  streak INTEGER DEFAULT 0,\n  coins INTEGER DEFAULT 0,\n  league TEXT DEFAULT 'Bronze',\n  last_activity TEXT,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n)";
var createTenants = "CREATE TABLE IF NOT EXISTS tenants (\n  id TEXT PRIMARY KEY,\n  name TEXT NOT NULL,\n  slug TEXT NOT NULL UNIQUE,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n)";
var createProjects = "CREATE TABLE IF NOT EXISTS projects (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  tenant_id TEXT NOT NULL,\n  title TEXT NOT NULL,\n  status TEXT NOT NULL DEFAULT 'em_execucao',\n  area TEXT NOT NULL DEFAULT 'Educa\u00E7\u00E3o',\n  location TEXT NOT NULL,\n  beneficiados INTEGER DEFAULT 0,\n  budget REAL DEFAULT 0,\n  start_date TEXT,\n  end_date TEXT,\n  description TEXT,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n)";
var createAlunos = "CREATE TABLE IF NOT EXISTS alunos (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  tenant_id TEXT NOT NULL,\n  name TEXT NOT NULL,\n  email TEXT,\n  phone TEXT,\n  area TEXT NOT NULL DEFAULT 'Educa\u00E7\u00E3o',\n  project_id INTEGER,\n  status TEXT NOT NULL DEFAULT 'ativo',\n  birth_date TEXT,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n)";
var createNews = "CREATE TABLE IF NOT EXISTS news (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  tenant_id TEXT NOT NULL,\n  title TEXT NOT NULL,\n  category TEXT NOT NULL,\n  content TEXT NOT NULL,\n  image_url TEXT,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n)";
var createTransactions = "CREATE TABLE IF NOT EXISTS transactions (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  tenant_id TEXT NOT NULL,\n  type TEXT NOT NULL, -- 'receita' or 'despesa'\n  category TEXT NOT NULL,\n  description TEXT NOT NULL,\n  amount REAL NOT NULL,\n  date TEXT NOT NULL,\n  status TEXT NOT NULL DEFAULT 'pago',\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n)";
var createAccountability = "CREATE TABLE IF NOT EXISTS accountability_reports (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  tenant_id TEXT NOT NULL,\n  project_id INTEGER NOT NULL,\n  title TEXT NOT NULL,\n  document_url TEXT,\n  status TEXT NOT NULL DEFAULT 'em_analise',\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE\n)";
var createPreRegistrations = "CREATE TABLE IF NOT EXISTS pre_registrations (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  tenant_id TEXT NOT NULL,\n  name TEXT NOT NULL,\n  email TEXT,\n  phone TEXT NOT NULL,\n  project_id INTEGER,\n  status TEXT NOT NULL DEFAULT 'pendente',\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n)";
var createDocuments = "CREATE TABLE IF NOT EXISTS documents (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  tenant_id TEXT NOT NULL,\n  title TEXT NOT NULL,\n  type TEXT NOT NULL, -- 'relatorio' ou 'documento'\n  document_url TEXT NOT NULL,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n)";
var createDenuncias = "CREATE TABLE IF NOT EXISTS reports_denuncias (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  tenant_id TEXT NOT NULL,\n  name TEXT,\n  email TEXT,\n  subject TEXT NOT NULL,\n  message TEXT NOT NULL,\n  status TEXT NOT NULL DEFAULT 'pendente',\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n)";
var createVideos = "CREATE TABLE IF NOT EXISTS videos (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  tenant_id TEXT NOT NULL,\n  title TEXT NOT NULL,\n  description TEXT NOT NULL,\n  author TEXT NOT NULL,\n  youtube_url TEXT NOT NULL,\n  category TEXT NOT NULL,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n)";
var createVideoLikes = "CREATE TABLE IF NOT EXISTS video_likes (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  video_id INTEGER NOT NULL,\n  user_id INTEGER NOT NULL,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  FOREIGN KEY(video_id) REFERENCES videos(id) ON DELETE CASCADE,\n  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,\n  UNIQUE(video_id, user_id)\n)";
var createVideoComments = "CREATE TABLE IF NOT EXISTS video_comments (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  video_id INTEGER NOT NULL,\n  user_id INTEGER NOT NULL,\n  user_name TEXT NOT NULL,\n  comment TEXT NOT NULL,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  FOREIGN KEY(video_id) REFERENCES videos(id) ON DELETE CASCADE,\n  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE\n)";
var createComunicados = "CREATE TABLE IF NOT EXISTS comunicados (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  tenant_id TEXT NOT NULL,\n  title TEXT NOT NULL,\n  message TEXT NOT NULL,\n  author_name TEXT NOT NULL,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n)";
var createOficineiroRegistrations = "CREATE TABLE IF NOT EXISTS oficineiro_registrations (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  tenant_id TEXT NOT NULL,\n  name TEXT NOT NULL,\n  email TEXT NOT NULL,\n  phone TEXT NOT NULL,\n  cpf TEXT NOT NULL,\n  birth_date TEXT NOT NULL,\n  education TEXT NOT NULL,\n  experience TEXT NOT NULL,\n  contribution TEXT NOT NULL,\n  status TEXT NOT NULL DEFAULT 'pendente',\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n)";
var createPassaporteItems = "CREATE TABLE IF NOT EXISTS passaporte_items (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  tenant_id TEXT NOT NULL,\n  user_id INTEGER NOT NULL,\n  badge_name TEXT NOT NULL,\n  description TEXT NOT NULL,\n  points INTEGER NOT NULL DEFAULT 0,\n  awarded_by INTEGER,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE\n)";
var createAuthorizations = "CREATE TABLE IF NOT EXISTS authorizations (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  tenant_id TEXT NOT NULL,\n  title TEXT NOT NULL,\n  description TEXT,\n  event_date TEXT,\n  event_time TEXT,\n  location TEXT,\n  target_type TEXT DEFAULT 'all',\n  target_id INTEGER,\n  created_by INTEGER NOT NULL,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n)";
var createAuthorizationSignatures = "CREATE TABLE IF NOT EXISTS authorization_signatures (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  authorization_id INTEGER NOT NULL,\n  parent_id INTEGER NOT NULL,\n  student_id INTEGER NOT NULL,\n  signed_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  UNIQUE(authorization_id, parent_id, student_id)\n)";
var createClasses = "CREATE TABLE IF NOT EXISTS classes (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  tenant_id TEXT NOT NULL,\n  name TEXT NOT NULL,\n  description TEXT,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n)";
var createClassTeachers = "CREATE TABLE IF NOT EXISTS class_teachers (\n  class_id INTEGER NOT NULL,\n  teacher_id INTEGER NOT NULL,\n  PRIMARY KEY(class_id, teacher_id)\n)";
var createClassStudents = "CREATE TABLE IF NOT EXISTS class_students (\n  class_id INTEGER NOT NULL,\n  student_id INTEGER NOT NULL,\n  PRIMARY KEY(class_id, student_id)\n)";
var createClassLessons = "CREATE TABLE IF NOT EXISTS class_lessons (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  class_id INTEGER NOT NULL,\n  title TEXT NOT NULL,\n  date TEXT NOT NULL,\n  start_time TEXT,\n  end_time TEXT,\n  description TEXT,\n  created_by INTEGER NOT NULL,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n)";
var createAttendance = "CREATE TABLE IF NOT EXISTS attendance (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  lesson_id INTEGER NOT NULL,\n  student_id INTEGER NOT NULL,\n  status TEXT NOT NULL,\n  justification_text TEXT,\n  justification_file_url TEXT,\n  recorded_by INTEGER NOT NULL,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  UNIQUE(lesson_id, student_id)\n)";
var createAssessments = "CREATE TABLE IF NOT EXISTS assessments (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  tenant_id TEXT NOT NULL,\n  title TEXT NOT NULL,\n  description TEXT,\n  date TEXT,\n  time TEXT,\n  type TEXT NOT NULL,\n  target_type TEXT DEFAULT 'all',\n  target_ids TEXT,\n  max_score REAL,\n  is_gamified INTEGER DEFAULT 0,\n  journey_order INTEGER DEFAULT 0,\n  created_by INTEGER NOT NULL,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n)";
var createAssessmentQuestions = "CREATE TABLE IF NOT EXISTS assessment_questions (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  assessment_id INTEGER NOT NULL,\n  type TEXT NOT NULL,\n  question_text TEXT NOT NULL,\n  options_json TEXT,\n  FOREIGN KEY(assessment_id) REFERENCES assessments(id) ON DELETE CASCADE\n)";
var createAssessmentDeliveries = "CREATE TABLE IF NOT EXISTS assessment_deliveries (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  assessment_id INTEGER NOT NULL,\n  student_id INTEGER NOT NULL,\n  answers_json TEXT,\n  signed BOOLEAN DEFAULT 0,\n  delivered_at DATETIME,\n  teacher_grade REAL,\n  teacher_comment TEXT,\n  status TEXT DEFAULT 'pending',\n  FOREIGN KEY(assessment_id) REFERENCES assessments(id) ON DELETE CASCADE\n)";
db.exec(createTenants);
db.exec(createUsers);
// Graceful upgrade for existing users table
try {
    db.exec("ALTER TABLE users ADD COLUMN personal_email TEXT");
}
catch (e) { }
try {
    db.exec("ALTER TABLE users ADD COLUMN cpf TEXT");
}
catch (e) { }
try {
    db.exec("ALTER TABLE users ADD COLUMN rg TEXT");
}
catch (e) { }
try {
    db.exec("ALTER TABLE users ADD COLUMN phone TEXT");
}
catch (e) { }
try {
    db.exec("ALTER TABLE users ADD COLUMN address TEXT");
}
catch (e) { }
try {
    db.exec("ALTER TABLE users ADD COLUMN photo_url TEXT");
}
catch (e) { }
try {
    db.exec("ALTER TABLE users ADD COLUMN must_change_password BOOLEAN DEFAULT 0");
}
catch (e) { }
try {
    db.exec("ALTER TABLE users ADD COLUMN parent_id INTEGER");
}
catch (e) { }
try {
    db.exec("ALTER TABLE users ADD COLUMN birth_date TEXT");
}
catch (e) { }
try {
    db.exec("ALTER TABLE users ADD COLUMN medical_report_url TEXT");
}
catch (e) { }
try {
    db.exec("ALTER TABLE users ADD COLUMN anamnesis_url TEXT");
}
catch (e) { }
try {
    db.exec("ALTER TABLE users ADD COLUMN anamnesis_data TEXT");
}
catch (e) { }
try {
    db.exec("ALTER TABLE users ADD COLUMN family_income TEXT");
}
catch (e) { }
try {
    db.exec("ALTER TABLE users ADD COLUMN parents_profession TEXT");
}
catch (e) { }
try {
    db.exec("ALTER TABLE authorizations ADD COLUMN target_type TEXT DEFAULT 'all'");
}
catch (e) { }
try {
    db.exec("ALTER TABLE authorizations ADD COLUMN target_id INTEGER");
}
catch (e) { }
db.exec(createProjects);
db.exec(createAlunos);
db.exec(createNews);
db.exec(createTransactions);
db.exec(createAccountability);
db.exec(createPreRegistrations);
db.exec(createOficineiroRegistrations);
// Migrations
try {
    db.exec('ALTER TABLE transactions ADD COLUMN receipt_url TEXT;');
}
catch (e) {
    if (!e.message.includes('duplicate column name')) {
        console.error('Migration error:', e.message);
    }
}
try {
    db.exec('ALTER TABLE transactions ADD COLUMN expected_date TEXT;');
}
catch (e) {
    if (!e.message.includes('duplicate column name')) {
        console.error('Migration error:', e.message);
    }
}
try {
    db.exec("ALTER TABLE projects ADD COLUMN area TEXT NOT NULL DEFAULT 'Educação';");
}
catch (e) {
    if (!e.message.includes('duplicate column name'))
        console.error('Migration error (projects.area):', e.message);
}
try {
    db.exec("ALTER TABLE projects ADD COLUMN image_url TEXT;");
}
catch (e) {
    if (!e.message.includes('duplicate column name'))
        console.error('Migration error (projects.image_url):', e.message);
}
var projectColumns = [
    "ADD COLUMN location TEXT NOT NULL DEFAULT ''",
    "ADD COLUMN beneficiados INTEGER DEFAULT 0",
    "ADD COLUMN budget REAL DEFAULT 0",
    "ADD COLUMN start_date TEXT",
    "ADD COLUMN end_date TEXT",
    "ADD COLUMN description TEXT",
    "ADD COLUMN impact TEXT DEFAULT ''"
];
for (var _i = 0, projectColumns_1 = projectColumns; _i < projectColumns_1.length; _i++) {
    var col = projectColumns_1[_i];
    try {
        db.exec("ALTER TABLE projects ".concat(col, ";"));
    }
    catch (e) {
        if (!e.message.includes('duplicate column name'))
            console.error("Migration error (projects ".concat(col, "):"), e.message);
    }
}
db.exec(createDocuments);
db.exec(createDenuncias);
db.exec(createVideos);
db.exec(createVideoLikes);
db.exec(createVideoComments);
db.exec(createComunicados);
db.exec(createPassaporteItems);
db.exec(createAuthorizations);
db.exec(createAuthorizationSignatures);
db.exec(createClasses);
db.exec(createClassTeachers);
db.exec(createClassStudents);
db.exec(createClassLessons);
// Gracefully migrate attendance table
try {
    db.exec('ALTER TABLE attendance RENAME TO old_attendance_v1');
}
catch (e) { }
db.exec(createAttendance);
db.exec(createAssessments);
db.exec(createAssessmentQuestions);
db.exec(createAssessmentDeliveries);
// Ensure is_gamified column exists if migrating
try {
    db.exec("ALTER TABLE assessments ADD COLUMN is_gamified INTEGER DEFAULT 0");
}
catch (err) { }
try {
    db.exec("ALTER TABLE assessments ADD COLUMN journey_order INTEGER DEFAULT 0");
}
catch (err) { }
try {
    db.exec("ALTER TABLE users ADD COLUMN streak INTEGER DEFAULT 0");
    db.exec("ALTER TABLE users ADD COLUMN coins INTEGER DEFAULT 0");
    db.exec("ALTER TABLE users ADD COLUMN league TEXT DEFAULT 'Bronze'");
    db.exec("ALTER TABLE users ADD COLUMN last_activity TEXT");
}
catch (err) { }
exports.default = db;
