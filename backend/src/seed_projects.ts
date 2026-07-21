import db from './db'

const seedProjects = [
  {
    title: 'MCS em Movimento',
    area: 'Esporte',
    location: 'Alto Paraíso de Goiás',
    description: 'Você já imaginou um espaço onde a energia, o ritmo e o esporte se unem para construir disciplina, saúde e um futuro brilhante para o seu filho? Apresentamos o MCS em Movimento, uma iniciativa transformadora desenvolvida para elevar o potencial físico, mental e social dos estudantes no contraturno escolar.',
    image_url: '/hero.png'
  },
  {
    title: 'MCS Digital',
    area: 'Tecnologia',
    location: 'Alto Paraíso de Goiás',
    description: 'Você já imaginou um ecossistema onde a tecnologia de ponta e a Inteligência Artificial entram na sala de aula para transformar a curiosidade do seu filho na ferramenta mais poderosa para o futuro? Apresentamos o MCS Digital, uma iniciativa pioneira para democratizar o acesso à tecnologia e formar a nova geração de criadores e empreendedores do Cerrado.',
    image_url: '/hero.png'
  },
  {
    title: 'MCS Família',
    area: 'Comunidade',
    location: 'Alto Paraíso de Goiás',
    description: 'Você já imaginou um espaço de acolhimento onde a comunidade encontra suporte jurídico, apoio psicossocial e trilhas de capacitação para transformar o potencial da nossa região em conquistas reais para dentro de casa? Apresentamos o MCS Família, a base de sustentação do nosso ecossistema de desenvolvimento.',
    image_url: '/hero.png'
  },
  {
    title: 'Conexão Rima',
    area: 'Cultura',
    location: 'Polo UAB',
    description: 'Acreditamos que a educação deve ir além dos muros da escola. O projeto Contraturno Conexão Rima oferece um espaço criativo e acolhedor onde a leitura, a música e a consciência social se encontram para transformar o futuro das nossas crianças e adolescentes.',
    image_url: '/conexao-rima.png'
  }
];

const existing = db.prepare('SELECT count(*) as count FROM projects WHERE tenant_id = ?').get('mcs') as any;
if (existing.count === 0) {
  const insert = db.prepare('INSERT INTO projects (tenant_id, title, status, area, location, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)');
  for (const p of seedProjects) {
    insert.run('mcs', p.title, 'em_execucao', p.area, p.location, p.description, p.image_url);
  }
  console.log('Seeded projects');
} else {
  // Try to update existing ones to have image_url if they don't
  db.prepare("UPDATE projects SET image_url = '/hero.png' WHERE image_url IS NULL OR image_url = ''").run();
}
