const metrics = [
  { label: 'Pessoas impactadas', value: '+15.000' },
  { label: 'Projetos avaliados', value: '12' },
  { label: 'Recursos captados', value: 'R$ 8,75 mi' },
  { label: 'Experiência de entrega', value: '100%' }
]

export default function TransparencyPage() {
  return (
    <section>
      <div className="section">
        <div className="page-header">
          <div>
            <h2>Transparência que gera confiança</h2>
            <p>Relatórios institucionais, históricos de impacto e dados acessíveis com segurança e clareza.</p>
          </div>
        </div>
        <div className="stats-grid">
          {metrics.map((metric) => (
            <div key={metric.label} className="stat-card">
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
