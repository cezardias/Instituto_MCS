const cards = [
  { title: 'Política de ética', description: 'Governança, conduta e compromisso com a transparência institucional.' },
  { title: 'Canal de denúncias', description: 'Ambiente seguro, sigiloso e independente para reportar irregularidades.' },
  { title: 'Relatórios anuais', description: 'Publicação constante de resultados, auditorias e impactos.' },
  { title: 'Gestão de documentos', description: 'Controle de políticas, compras e contrações em um único painel.' }
]

export default function CompliancePage() {
  return (
    <section>
      <div className="section">
        <div className="page-header">
          <div>
            <h2>Compliance e governança</h2>
            <p>Processos robustos para acompanhar toda a jornada de prestação de contas do Instituto MCS.</p>
          </div>
        </div>

        <div className="grid-2">
          {cards.map((card) => (
            <article key={card.title} className="card">
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
