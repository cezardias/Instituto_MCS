const items = [
  { title: 'Transparência completa', description: 'Relatórios, governança e dados em tempo real para cada ação.' },
  { title: 'IA integrada MCS', description: 'Assistente inteligente para educadores, gestores e parceiros.' },
  { title: 'Plataforma responsiva', description: 'WebApp moderno com experiência única em desktop e mobile.' },
  { title: 'Multi-tenant seguro', description: 'Ambientes independentes para parceiros e unidades de projeto.' }
]

export default function HomePage() {
  return (
    <section>
      <div className="section hero">
        <div>
          <span className="badge">Instituto Movimento de Cultura Social</span>
          <h1>Plataforma digital completa para gestão, projetos e impacto social.</h1>
          <p>Uma experiência WebApp moderna com infraestrutura pronta para implementar IA MCS local, multi-tenant e painéis administrativos integrados.</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.8rem', flexWrap: 'wrap' }}>
            <a className="primary-button" href="/dashboard">Abrir painel</a>
            <a className="secondary-button" href="/projetos">Conheça projetos</a>
          </div>
        </div>
        <div className="card" style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <strong>Impacto recente</strong>
            <p>+3.200 pessoas beneficiadas em 12 projetos executados com transparência e governança.</p>
          </div>
          <div>
            <strong>IA MCS</strong>
            <p>Assistente de políticas, relatórios e educação social configurável com base no estatuto do instituto.</p>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="page-header">
          <div>
            <h2>O projeto completo para o Instituto MCS</h2>
            <p>Design inspirado no documento de identidade visual do Instituto, com paleta sóbria, dourada e layouts corporativos claros.</p>
          </div>
          <span className="badge">WebApp · Multi-tenant · IA on-premise</span>
        </div>

        <div className="grid-2">
          {items.map((item) => (
            <article key={item.title} className="card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
