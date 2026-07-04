const projects = [
  { title: 'Educação que gera futuro', status: 'Em andamento', impact: '1.200 beneficiados', location: 'Goiânia - GO' },
  { title: 'Saúde para transformar vidas', status: 'Em andamento', impact: '800 beneficiados', location: 'Aparecida - GO' },
  { title: 'Esporte que inspira', status: 'Planejamento', impact: '650 beneficiados', location: 'Trindade - GO' },
  { title: 'Sustentabilidade que conecta', status: 'Planejamento', impact: '500 beneficiados', location: 'Goiânia - GO' }
]

export default function ProjectsPage() {
  return (
    <section>
      <div className="section">
        <div className="page-header">
          <div>
            <h2>Banco de Projetos</h2>
            <p>Conheça iniciativas que transformam realidades com educação, cultura, esporte e cidadania.</p>
          </div>
        </div>
        <div className="grid-2">
          {projects.map((project) => (
            <article key={project.title} className="card">
              <span className="badge">{project.status}</span>
              <h3>{project.title}</h3>
              <p>{project.impact}</p>
              <p style={{ marginTop: '1rem', color: '#72674f' }}>{project.location}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
