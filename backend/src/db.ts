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

const createPreRegistrations = `CREATE TABLE IF NOT EXISTS pre_registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  project_id INTEGER,
  status TEXT NOT NULL DEFAULT 'pendente',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

const createParceiros = `CREATE TABLE IF NOT EXISTS parceiros (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  responsavel TEXT,
  endereco TEXT,
  cnpj TEXT,
  instagram TEXT,
  website TEXT,
  logo_url TEXT,
  active INTEGER DEFAULT 1,
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

const createOficineiroRegistrations = `CREATE TABLE IF NOT EXISTS oficineiro_registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  cpf TEXT NOT NULL,
  birth_date TEXT NOT NULL,
  education TEXT NOT NULL,
  experience TEXT NOT NULL,
  contribution TEXT NOT NULL,
  test_answers TEXT,
  scores TEXT,
  primary_profile TEXT,
  secondary_profile TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
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
try { db.exec("ALTER TABLE users ADD COLUMN education TEXT") } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN availability_schedule TEXT") } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN positive_points TEXT") } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN negative_points TEXT") } catch(e) {}
try { db.exec("ALTER TABLE authorizations ADD COLUMN target_type TEXT DEFAULT 'all'") } catch(e) {}
try { db.exec("ALTER TABLE authorizations ADD COLUMN target_id INTEGER") } catch(e) {}
try { db.exec("ALTER TABLE oficineiro_registrations ADD COLUMN availability TEXT") } catch(e) {}
const createAssignments = `
CREATE TABLE IF NOT EXISTS assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL DEFAULT 'mcs',
  student_id INTEGER,
  student_name TEXT NOT NULL,
  student_email TEXT,
  parent_email TEXT,
  turma TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_type TEXT,
  status TEXT DEFAULT 'enviado',
  feedback TEXT,
  grade TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

db.exec(createProjects)
db.exec(createAlunos)
db.exec(createNews)
db.exec(createTransactions)
db.exec(createAccountability)
db.exec(createPreRegistrations)
db.exec(createOficineiroRegistrations)
db.exec(createAssignments)

// Migrations
try {
  db.exec('ALTER TABLE transactions ADD COLUMN receipt_url TEXT;');
} catch (e: any) {
  if (!e.message.includes('duplicate column name')) {
    console.error('Migration error:', e.message);
  }
}
try {
  db.exec('ALTER TABLE transactions ADD COLUMN expected_date TEXT;');
} catch (e: any) {
  if (!e.message.includes('duplicate column name')) {
    console.error('Migration error:', e.message);
  }
}
try {
  db.exec("ALTER TABLE projects ADD COLUMN area TEXT NOT NULL DEFAULT 'Educação';");
} catch (e: any) {
  if (!e.message.includes('duplicate column name')) console.error('Migration error (projects.area):', e.message);
}
try {
  db.exec("ALTER TABLE projects ADD COLUMN image_url TEXT;");
} catch (e: any) {
  if (!e.message.includes('duplicate column name')) console.error('Migration error (projects.image_url):', e.message);
}

const projectColumns = [
  "ADD COLUMN location TEXT NOT NULL DEFAULT ''",
  "ADD COLUMN beneficiados INTEGER DEFAULT 0",
  "ADD COLUMN budget REAL DEFAULT 0",
  "ADD COLUMN start_date TEXT",
  "ADD COLUMN end_date TEXT",
  "ADD COLUMN description TEXT",
  "ADD COLUMN impact TEXT DEFAULT ''",
  "ADD COLUMN active INTEGER DEFAULT 0",
  "ADD COLUMN periodo TEXT DEFAULT ''",
  "ADD COLUMN dias TEXT DEFAULT ''",
  "ADD COLUMN horarios TEXT DEFAULT ''",
  "ADD COLUMN publico TEXT DEFAULT ''",
  "ADD COLUMN apoio TEXT DEFAULT ''"
];

for (const col of projectColumns) {
  try {
    db.exec(`ALTER TABLE projects ${col};`);
  } catch (e: any) {
    if (!e.message.includes('duplicate column name')) console.error(`Migration error (projects ${col}):`, e.message);
  }
}
db.exec(createDocuments)
db.exec(createDenuncias)
db.exec(createParceiros)
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

const studentExtraColumns = [
  "ADD COLUMN student_name TEXT",
  "ADD COLUMN student_email TEXT",
  "ADD COLUMN student_cpf TEXT",
  "ADD COLUMN student_rg TEXT",
  "ADD COLUMN gender TEXT",
  "ADD COLUMN rnm TEXT",
  "ADD COLUMN school_name TEXT",
  "ADD COLUMN school_shift TEXT",
  "ADD COLUMN school_grade TEXT",
  "ADD COLUMN health_allergies TEXT",
  "ADD COLUMN blood_type TEXT",
  "ADD COLUMN weight TEXT",
  "ADD COLUMN height TEXT",
  "ADD COLUMN medications TEXT",
  "ADD COLUMN health_conditions TEXT",
  "ADD COLUMN parent_name TEXT",
  "ADD COLUMN family_income TEXT",
  "ADD COLUMN parents_profession TEXT",
  "ADD COLUMN workplace TEXT",
  "ADD COLUMN emergency_phone TEXT",
  "ADD COLUMN family_kinship TEXT",
  "ADD COLUMN image_voice_authorization INTEGER DEFAULT 1",
  "ADD COLUMN pick_drop_responsibility INTEGER DEFAULT 1",
  "ADD COLUMN project_expectations TEXT",
  "ADD COLUMN safety_word TEXT"
];

for (const col of studentExtraColumns) {
  try { db.exec(`ALTER TABLE pre_registrations ${col};`); } catch (e) {}
  try { db.exec(`ALTER TABLE users ${col};`); } catch (e) {}
  try { db.exec(`ALTER TABLE alunos ${col};`); } catch (e) {}
}

const oficineiroColumns = [
  "ADD COLUMN test_answers TEXT",
  "ADD COLUMN scores TEXT",
  "ADD COLUMN primary_profile TEXT",
  "ADD COLUMN secondary_profile TEXT"
];

for (const col of oficineiroColumns) {
  try {
    db.exec(`ALTER TABLE oficineiro_registrations ${col};`);
  } catch (e: any) {
    if (!e.message.includes('duplicate column name')) console.error(`Migration error (oficineiro_registrations ${col}):`, e.message);
  }
}

// Migrações para transformar parceiros em associados
const parceirosColumns = [
  "ADD COLUMN tipo TEXT",
  "ADD COLUMN status_aprovacao TEXT DEFAULT 'pendente'",
  "ADD COLUMN email TEXT",
  "ADD COLUMN phone TEXT",
  "ADD COLUMN cpf_cnpj TEXT",
  "ADD COLUMN exibir_site INTEGER DEFAULT 0",
  "ADD COLUMN aceitou_termos INTEGER DEFAULT 0"
];

for (const col of parceirosColumns) {
  try {
    db.exec(`ALTER TABLE parceiros ${col};`);
  } catch (e: any) {
    if (!e.message.includes('duplicate column name')) console.error(`Migration error (parceiros ${col}):`, e.message);
  }
}

try {
  // Converte parceiros antigos (onde 'tipo' ainda está vazio ou nulo) para Fundadores aprovados e exibidos
  db.exec(`UPDATE parceiros SET tipo = 'Fundador', status_aprovacao = 'aprovado', exibir_site = 1, aceitou_termos = 1 WHERE tipo IS NULL OR tipo = ''`);
} catch (e: any) {
  console.error('Migration error updating old parceiros:', e.message);
}

// Sync/Migration for Facilitadora Luana Pessoa Barbosa and all approved oficineiros into users table & oficineiro_registrations
try {
  const luanaParceiro: any = db.prepare("SELECT * FROM parceiros WHERE email LIKE '%luanapessoabarbosa%' OR name LIKE '%Luana%'").get()
  if (luanaParceiro) {
    const existingOficineiro: any = db.prepare("SELECT * FROM oficineiro_registrations WHERE email LIKE '%luanapessoabarbosa%' OR name LIKE '%Luana%'").get()
    if (!existingOficineiro) {
      db.prepare(`
        INSERT INTO oficineiro_registrations 
        (tenant_id, name, email, phone, cpf, birth_date, education, experience, contribution, status)
        VALUES ('instituto-mcs', ?, ?, ?, ?, '1995-01-01', 'Graduação / Facilitadora MCS', 'Facilitadora de Projetos MCS', 'Contribuição com oficinas e desenvolvimento humano', 'aprovado')
      `).run(
        luanaParceiro.name || 'Luana Pessoa Barbosa',
        luanaParceiro.email || 'luanapessoabarbosa@gmail.com',
        luanaParceiro.phone || '61982084706',
        luanaParceiro.cpf_cnpj || '05854001136'
      )
    }

    const existingUser: any = db.prepare("SELECT * FROM users WHERE email LIKE '%luanapessoabarbosa%' OR name LIKE '%Luana%'").get()
    if (!existingUser) {
      const defaultPasswordHash = '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQOEg6Lruj3vjPGga31lW' // 123456
      db.prepare(`
        INSERT INTO users (tenant_id, name, email, password_hash, role, cpf, phone, must_change_password)
        VALUES ('instituto-mcs', ?, ?, ?, 'oficineiro', ?, ?, 1)
      `).run(
        luanaParceiro.name || 'Luana Pessoa Barbosa',
        luanaParceiro.email || 'luanapessoabarbosa@gmail.com',
        defaultPasswordHash,
        luanaParceiro.cpf_cnpj || '05854001136',
        luanaParceiro.phone || '61982084706'
      )
    } else {
      db.prepare("UPDATE users SET role = 'oficineiro', photo_url = COALESCE(?, photo_url) WHERE id = ?").run(luanaParceiro.logo_url || null, existingUser.id)
    }
  }

  // Ensure all approved oficineiros in oficineiro_registrations exist in users table as 'oficineiro'
  const approvedOficineiros: any[] = db.prepare("SELECT * FROM oficineiro_registrations WHERE status = 'aprovado'").all()
  for (const reg of approvedOficineiros) {
    const usr: any = db.prepare("SELECT id FROM users WHERE email = ?").get(reg.email)
    if (!usr) {
      const defaultPasswordHash = '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQOEg6Lruj3vjPGga31lW' // 123456
      db.prepare(`
        INSERT INTO users (tenant_id, name, email, password_hash, role, cpf, phone, birth_date, must_change_password)
        VALUES ('instituto-mcs', ?, ?, ?, 'oficineiro', ?, ?, ?, 1)
      `).run(reg.name, reg.email, defaultPasswordHash, reg.cpf || null, reg.phone || null, reg.birth_date || null)
    } else {
      db.prepare("UPDATE users SET role = 'oficineiro' WHERE email = ?").run(reg.email)
    }
  }
} catch (e: any) {
  console.error('Migration error syncing Facilitadores into users:', e.message)
}


// --- SEED PROJECTS ---
try {
  const insertProj = db.prepare('INSERT INTO projects (tenant_id, title, status, area, location, description, image_url, active, periodo, dias, horarios, publico, apoio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  
  const existing = db.prepare("SELECT title FROM projects").all() as any[];
  const existingTitles = existing.map(e => e.title);

  const seedProjects = [
    {
      title: 'Contraturno Conexão Rima',
      area: 'Cultura',
      location: 'Polo UAB Alto Paraíso de Goiás',
      description: 'Linguagem, Respeito e Expressão Cultural. Uma iniciativa focada no desenvolvimento psicossocial, cidadania ativa e comunicação de forma criativa e acolhedora.',
      image_url: '/projeto_rima.png',
      active: 1,
      periodo: 'Agosto a Dezembro',
      dias: 'Terças e Quintas-feiras',
      horarios: 'Manhã (09h às 10h) | Tarde (15h às 16h)',
      publico: 'Crianças assistidas pela rede (Foco: 4º e 5º ano, Escolas Ana Aguiar e Zeca de Faria)',
      apoio: 'Sec. de Assistência Social / Sec. de Educação'
    },
    {
      title: 'MCS em Movimento',
      area: 'Esporte',
      location: 'Alto Paraíso de Goiás',
      description: 'Você já imaginou um espaço onde a energia, o ritmo e o esporte se unem para construir disciplina, saúde e um futuro brilhante para o seu filho? Apresentamos o MCS em Movimento, uma iniciativa transformadora desenvolvida para elevar o potencial físico, mental e social dos estudantes no contraturno escolar.',
      image_url: '/hero.png',
      active: 0,
      periodo: 'Anual',
      dias: 'Encontros Semanais',
      horarios: 'Contraturno Escolar',
      publico: 'Crianças e Jovens da Comunidade',
      apoio: 'Instituto MCS'
    },
    {
      title: 'MCS Digital',
      area: 'Tecnologia',
      location: 'Alto Paraíso de Goiás',
      description: 'Você já imaginou um ecossistema onde a tecnologia de ponta e a Inteligência Artificial entram na sala de aula para transformar a curiosidade do seu filho na ferramenta mais poderosa para o futuro? Apresentamos o MCS Digital, uma iniciativa pioneira para democratizar o acesso à tecnologia e formar a nova geração de criadores e empreendedores do Cerrado.',
      image_url: '/hero.png',
      active: 0,
      periodo: 'Ciclos Contínuos',
      dias: 'A definir',
      horarios: 'A definir',
      publico: 'Estudantes por Faixa Etária',
      apoio: 'Instituto MCS'
    },
    {
      title: 'MCS Família',
      area: 'Comunidade',
      location: 'Alto Paraíso de Goiás',
      description: 'Você já imaginou um espaço de acolhimento onde a comunidade encontra suporte jurídico, apoio psicossocial e trilhas de capacitação para transformar o potencial da nossa região em conquistas reais para dentro de casa? Apresentamos o MCS Família, a base de sustentação do nosso ecossistema de desenvolvimento.',
      image_url: '/hero.png',
      active: 0,
      periodo: 'Contínuo',
      dias: 'Segunda a Sexta',
      horarios: 'Horário Comercial',
      publico: 'Famílias e Comunidade Local',
      apoio: 'Rede de Apoio Multidisciplinar'
    }
  ];

  for (const p of seedProjects) {
    if (!existingTitles.find((t:string) => t.toLowerCase().includes(p.title.split(' ')[1].toLowerCase()))) {
      insertProj.run('mcs', p.title, 'em_execucao', p.area, p.location, p.description, p.image_url, p.active, p.periodo, p.dias, p.horarios, p.publico, p.apoio);
    }
  }

  // Garantir que Conexão Rima esteja ATIVO (1) e preenchido no banco existente
  db.exec(`UPDATE projects SET 
    active = 1,
    location = CASE WHEN location IS NULL OR location = '' OR location = 'Alto Paraíso de Goiás' THEN 'Polo UAB Alto Paraíso de Goiás' ELSE location END,
    periodo = CASE WHEN periodo IS NULL OR periodo = '' THEN 'Agosto a Dezembro' ELSE periodo END,
    dias = CASE WHEN dias IS NULL OR dias = '' THEN 'Terças e Quintas-feiras' ELSE dias END,
    horarios = CASE WHEN horarios IS NULL OR horarios = '' THEN 'Manhã (09h às 10h) | Tarde (15h às 16h)' ELSE horarios END,
    publico = CASE WHEN publico IS NULL OR publico = '' THEN 'Crianças assistidas pela rede (Foco: 4º e 5º ano, Escolas Ana Aguiar e Zeca de Faria)' ELSE publico END,
    apoio = CASE WHEN apoio IS NULL OR apoio = '' THEN 'Sec. de Assistência Social / Sec. de Educação' ELSE apoio END
    WHERE title LIKE '%Rima%'`);
} catch (e) {
  console.error('Seed projects error:', e)
}

export default db
