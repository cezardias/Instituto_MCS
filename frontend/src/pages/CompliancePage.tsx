const cards = [
  {
    icon: '⚖️',
    title: 'Política de Ética',
    description: 'Governança, conduta e compromisso com a transparência institucional em todas as nossas ações.'
  },
  {
    icon: '📣',
    title: 'Canal de Denúncias',
    description: 'Ambiente seguro, sigiloso e independente para reportar irregularidades com total anonimato.'
  },
  {
    icon: '📋',
    title: 'Relatórios Anuais',
    description: 'Publicação constante de resultados, auditorias e impactos com linguagem acessível.'
  },
  {
    icon: '🗂️',
    title: 'Gestão de Documentos',
    description: 'Controle de políticas, compras e contrações em um único painel organizado e auditável.'
  }
]

export default function CompliancePage() {
  return (
    <div className="bg-marfim text-carbono min-h-screen">
      {/* Header */}
      <section className="pt-32 pb-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          {/* Hero */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
            <div>
              <span className="text-dourado font-semibold tracking-wider text-xs uppercase mb-4 block">
                GOVERNANÇA E INTEGRIDADE
              </span>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-tight mb-6">
                Compliance e Governança
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                Processos robustos para acompanhar toda a jornada de prestação de contas do Instituto MCS com ética, transparência e responsabilidade.
              </p>
              <a
                href="#canal-denuncia"
                className="inline-flex items-center gap-2 bg-carbono text-marfim px-8 py-4 rounded-full font-bold hover:bg-gray-800 transition-colors"
              >
                ACESSAR CANAL DE DENÚNCIAS
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            <div className="bg-carbono text-marfim rounded-[2rem] p-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-dourado/20 flex items-center justify-center text-dourado font-bold">✓</div>
                <p className="font-semibold">Auditoria externa independente</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-dourado/20 flex items-center justify-center text-dourado font-bold">✓</div>
                <p className="font-semibold">Prestação de contas pública anual</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-dourado/20 flex items-center justify-center text-dourado font-bold">✓</div>
                <p className="font-semibold">Código de conduta para colaboradores</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-dourado/20 flex items-center justify-center text-dourado font-bold">✓</div>
                <p className="font-semibold">Política de conflito de interesses</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-dourado/20 flex items-center justify-center text-dourado font-bold">✓</div>
                <p className="font-semibold">Canal de denúncias sigiloso</p>
              </div>
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {cards.map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <span className="text-4xl mb-4 block">{card.icon}</span>
                <h3 className="font-bold text-lg mb-3">{card.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>

          {/* Canal de Denúncias CTA */}
          <div id="canal-denuncia" className="bg-carbono text-marfim rounded-[2rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10">
            <div>
              <span className="text-dourado text-xs font-bold tracking-widest uppercase mb-3 block">CANAL DE DENÚNCIAS</span>
              <h2 className="font-serif text-3xl mb-4">Reporte irregularidades com segurança</h2>
              <p className="text-gray-400 max-w-xl text-sm leading-relaxed">
                Nosso canal de denúncias é gerenciado por empresa independente, garantindo anonimato e sigilo total. Todas as denúncias são investigadas com rigor.
              </p>
            </div>
            <button className="bg-dourado text-carbono px-8 py-4 rounded-full font-bold hover:bg-yellow-500 transition-colors whitespace-nowrap">
              ACESSAR O CANAL
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

