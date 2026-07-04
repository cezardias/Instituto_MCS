const metrics = [
  { label: 'Pessoas impactadas', value: '+15.000' },
  { label: 'Projetos avaliados', value: '12' },
  { label: 'Recursos captados', value: 'R$ 8,75 mi' },
  { label: 'Experiência de entrega', value: '100%' }
]

export default function TransparencyPage() {
  return (
    <div className="bg-marfim text-carbono min-h-screen">
      <section className="pt-32 pb-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-dourado font-semibold tracking-wider text-xs uppercase mb-4 block">
              PRESTAÇÃO DE CONTAS
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-tight mb-6">
              Transparência que gera confiança
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              Relatórios institucionais, históricos de impacto e dados acessíveis com segurança e clareza para todos os nossos parceiros e comunidade.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 mb-20">
            {metrics.map((metric) => (
              <div key={metric.label} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                <strong className="block font-serif text-3xl md:text-4xl text-carbono mb-2">{metric.value}</strong>
                <span className="text-sm text-gray-500 uppercase tracking-widest font-semibold">{metric.label}</span>
              </div>
            ))}
          </div>

          <div className="bg-carbono text-marfim rounded-[2rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10">
            <div>
              <h2 className="font-serif text-3xl mb-4">Relatório Anual de Atividades</h2>
              <p className="text-gray-400 max-w-xl">
                Acesse nosso relatório completo com todos os detalhes financeiros, operacionais e o impacto gerado no último ano.
              </p>
            </div>
            <button className="bg-dourado text-carbono px-8 py-4 rounded-full font-bold hover:bg-yellow-500 transition-colors whitespace-nowrap">
              BAIXAR RELATÓRIO PDF
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
