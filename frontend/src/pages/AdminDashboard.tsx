const summary = [
  { label: 'Pessoas beneficiadas', value: '24.680' },
  { label: 'Alunos ativos', value: '3.842' },
  { label: 'Projetos em execução', value: '18' },
  { label: 'Recursos captados', value: 'R$ 8,75 mi' }
]

const rows = [
  { rank: 1, name: 'Gabriel Souza', project: 'Educação que transforma', progress: '97,7' },
  { rank: 2, name: 'Maria Eduarda Lima', project: 'Saúde para todos', progress: '94,2' },
  { rank: 3, name: 'Rafael Martins', project: 'Esporte que inspira', progress: '88,9' }
]

export default function DashboardPage() {
  return (
    <section>
      <div className="section">
        <div className="page-header">
          <div>
            <h2>Dashboard Executivo</h2>
            <p>Visão estratégica, indicadores e acompanhamento de projetos com painel webapp moderno.</p>
          </div>
          <span className="badge">Administração</span>
        </div>

        <div className="stats-grid">
          {summary.map((stat) => (
            <div key={stat.label} className="stat-card">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="section" style={{ marginTop: '1.5rem' }}>
          <h3>Ranking de desempenho</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Posição</th>
                <th>Nome</th>
                <th>Projeto</th>
                <th>Desempenho</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.rank}>
                  <td>{row.rank}</td>
                  <td>{row.name}</td>
                  <td>{row.project}</td>
                  <td>{row.progress}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
