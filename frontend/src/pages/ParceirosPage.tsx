import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

const tiposParceiros = [
  {
    tipo: 'Parceiros Governamentais',
    icone: '🏛️',
    cor: 'bg-blue-50 border-blue-100',
    iconeBg: 'bg-blue-100 text-blue-600',
    parceiros: [
      { nome: 'Ministério da Cultura', sigla: 'MinC', descricao: 'Apoio a projetos culturais e incentivos fiscais para iniciativas sociais.' },
      { nome: 'Secretaria de Educação', sigla: 'SEDUC', descricao: 'Parceria em programas de reforço escolar e alfabetização.' },
      { nome: 'Secretaria de Esporte', sigla: 'SEL', descricao: 'Fomento a projetos esportivos de inclusão social.' },
    ]
  },
  {
    tipo: 'Parceiros Empresariais',
    icone: '🏢',
    cor: 'bg-yellow-50 border-yellow-100',
    iconeBg: 'bg-yellow-100 text-yellow-700',
    parceiros: [
      { nome: 'Empresas Privadas', sigla: 'Patrocinadores', descricao: 'Empresas comprometidas com a responsabilidade social e o desenvolvimento comunitário.' },
      { nome: 'Indústria e Comércio', sigla: 'Apoiadores', descricao: 'Parceiros do setor produtivo que apoiam a geração de renda e capacitação.' },
      { nome: 'Startups e Tecnologia', sigla: 'Inovação', descricao: 'Empresas de tecnologia que contribuem com soluções digitais para os projetos.' },
    ]
  },
  {
    tipo: 'Organizações da Sociedade Civil',
    icone: '🤝',
    cor: 'bg-green-50 border-green-100',
    iconeBg: 'bg-green-100 text-green-700',
    parceiros: [
      { nome: 'ONGs e Associações', sigla: 'OSC', descricao: 'Entidades que somam esforços na construção de uma rede de proteção social.' },
      { nome: 'Igrejas e Comunidades', sigla: 'Comunidade', descricao: 'Líderes comunitários e religiosos que ampliam o alcance das ações.' },
      { nome: 'Universidades', sigla: 'Acadêmico', descricao: 'Instituições de ensino superior parceiras em pesquisa e extensão social.' },
    ]
  },
  {
    tipo: 'Parceiros Internacionais',
    icone: '🌍',
    cor: 'bg-purple-50 border-purple-100',
    iconeBg: 'bg-purple-100 text-purple-700',
    parceiros: [
      { nome: 'Organizações Internacionais', sigla: 'ONU / UNICEF', descricao: 'Agências internacionais que reforçam boas práticas e recursos para projetos sociais.' },
      { nome: 'Fundações Globais', sigla: 'Fundações', descricao: 'Fundações internacionais que apoiam iniciativas de impacto social em países em desenvolvimento.' },
    ]
  },
]

const numeros = [
  { valor: '23+', label: 'Parceiros ativos' },
  { valor: '7', label: 'Municípios alcançados' },
  { valor: '15.000+', label: 'Beneficiados' },
  { valor: '100%', label: 'Transparência' },
]

export default function ParceirosPage() {
  const [dbParceiros, setDbParceiros] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/parceiros?tenant_id=instituto-mcs')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDbParceiros(data.filter(p => p.active === 1))
        }
      })
      .catch(err => console.error(err))
  }, [])

  return (
    <div className="bg-marfim text-carbono min-h-screen">

      {/* ── Hero ──────────────────────────────────── */}
      <section className="pt-28 pb-16 border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
            <Link to="/" className="hover:text-dourado transition-colors">🏠</Link>
            <span>›</span>
            <span className="text-carbono font-semibold">Parceiros</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-dourado font-bold text-xs uppercase tracking-widest mb-4 block">
                REDE DE PARCEIROS
              </span>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-tight mb-6">
                Juntos transformamos realidades
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-lg">
                O Instituto MCS acredita no poder das parcerias para multiplicar o impacto social. Cada parceiro é um elo fundamental na corrente que transforma vidas.
              </p>
              <a
                href="#seja-parceiro"
                className="inline-flex items-center gap-2 bg-dourado text-carbono px-8 py-4 rounded-full font-bold hover:bg-yellow-500 transition-colors"
              >
                SEJA UM PARCEIRO
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            {/* Números */}
            <div className="grid grid-cols-2 gap-4">
              {numeros.map((n) => (
                <div key={n.label} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center hover:shadow-md transition-shadow">
                  <strong className="block font-serif text-4xl text-carbono mb-2">{n.valor}</strong>
                  <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">{n.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Parceiros Dinâmicos (Banco de Dados) ── */}
      {dbParceiros.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="text-dourado font-bold text-xs uppercase tracking-widest mb-3 block">REDE DE APOIO</span>
              <h2 className="font-serif text-3xl md:text-4xl">Nossos Parceiros Oficiais</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {dbParceiros.map(p => (
                <div key={p.id} className="bg-gray-50 border border-gray-100 rounded-3xl p-6 flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-2 transition-all duration-300">
                  <div className="h-24 flex items-center justify-center mb-4 w-full bg-white rounded-xl">
                    {p.logo_url ? (
                      <img src={p.logo_url} alt={p.name} className="max-h-full max-w-full object-contain p-2" />
                    ) : (
                      <div className="text-4xl">🤝</div>
                    )}
                  </div>
                  <h3 className="font-bold text-carbono text-lg mb-1">{p.name}</h3>
                  {p.responsavel && <p className="text-xs text-gray-500 mb-4">{p.responsavel}</p>}
                  
                  <div className="mt-auto flex gap-3">
                    {p.website && (
                      <a href={p.website} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors" title="Website">
                        🌐
                      </a>
                    )}
                    {p.instagram && (
                      <a href={`https://instagram.com/${p.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center hover:bg-pink-100 transition-colors" title="Instagram">
                        📸
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Parceiros por Categoria ─────────────── */}
      <section className="py-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-dourado font-bold text-xs uppercase tracking-widest mb-3 block">NOSSA REDE</span>
            <h2 className="font-serif text-3xl md:text-4xl">Parceiros por categoria</h2>
          </div>

          <div className="space-y-12">
            {tiposParceiros.map((grupo) => (
              <div key={grupo.tipo}>
                {/* Categoria header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${grupo.iconeBg}`}>
                    {grupo.icone}
                  </div>
                  <h3 className="font-bold text-lg text-carbono">{grupo.tipo}</h3>
                  <div className="flex-1 h-px bg-gray-200 ml-2" />
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {grupo.parceiros.map((p) => (
                    <div
                      key={p.nome}
                      className={`${grupo.cor} border rounded-2xl p-7 hover:-translate-y-1 hover:shadow-md transition-all duration-300`}
                    >
                      <div className={`inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 ${grupo.iconeBg}`}>
                        {p.sigla}
                      </div>
                      <h4 className="font-bold text-carbono mb-2">{p.nome}</h4>
                      <p className="text-sm text-gray-500 leading-relaxed">{p.descricao}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Seja um Parceiro CTA ─────────────────── */}
      <section id="seja-parceiro" className="py-20 bg-carbono text-marfim">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <span className="text-dourado font-bold text-xs uppercase tracking-widest mb-4 block">FAÇA PARTE</span>
            <h2 className="font-serif text-4xl md:text-5xl mb-6">Seja um parceiro do Instituto MCS</h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              Sua empresa ou organização pode fazer parte dessa rede de transformação social. Entre em contato e descubra como podemos construir um impacto ainda maior juntos.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-14">
            {[
              { icone: '💼', titulo: 'Patrocínio', descricao: 'Associe a marca da sua empresa a projetos de alto impacto social e visibilidade.' },
              { icone: '🤝', titulo: 'Parceria Técnica', descricao: 'Contribua com expertise, tecnologia ou serviços para potencializar nossos projetos.' },
              { icone: '❤️', titulo: 'Doação', descricao: 'Apoie financeiramente iniciativas que transformam vidas em comunidades vulneráveis.' },
            ].map((item) => (
              <div key={item.titulo} className="bg-white/10 rounded-2xl p-8 text-center hover:bg-white/15 transition-colors">
                <div className="text-4xl mb-4">{item.icone}</div>
                <h3 className="font-bold text-marfim mb-3">{item.titulo}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.descricao}</p>
              </div>
            ))}
          </div>

          {/* Formulário simplificado */}
          <div className="max-w-xl mx-auto bg-white/10 rounded-[2rem] p-10">
            <h3 className="font-serif text-2xl text-center mb-8">Quero ser parceiro</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nome / Organização"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-4 text-sm text-marfim placeholder-gray-400 focus:outline-none focus:border-dourado"
              />
              <input
                type="email"
                placeholder="E-mail de contato"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-4 text-sm text-marfim placeholder-gray-400 focus:outline-none focus:border-dourado"
              />
              <select className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-4 text-sm text-gray-300 focus:outline-none focus:border-dourado">
                <option value="" className="text-carbono">Tipo de parceria</option>
                <option value="patrocinio" className="text-carbono">Patrocínio</option>
                <option value="tecnica" className="text-carbono">Parceria Técnica</option>
                <option value="doacao" className="text-carbono">Doação</option>
                <option value="outro" className="text-carbono">Outro</option>
              </select>
              <textarea
                rows={4}
                placeholder="Como gostaria de contribuir?"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-4 text-sm text-marfim placeholder-gray-400 focus:outline-none focus:border-dourado resize-none"
              />
              <button className="w-full bg-dourado text-carbono py-4 rounded-full font-bold hover:bg-yellow-500 transition-colors uppercase tracking-widest text-sm">
                ENVIAR PROPOSTA
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
