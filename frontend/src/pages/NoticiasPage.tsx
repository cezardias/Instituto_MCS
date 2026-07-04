import { useState, useEffect } from 'react'

interface NewsItem {
  id: number
  title: string
  category: string
  content: string
  image_url: string | null
  created_at: string
}

const CATEGORIES = ['Todas as notícias', 'Projetos', 'Educação', 'Eventos', 'Parcerias', 'Institucional']
const TENANT_ID = 'instituto-mcs'

const CATEGORY_COLORS: Record<string, string> = {
  'Educação':      'bg-blue-500',
  'Esporte':       'bg-green-500',
  'Cultura':       'bg-purple-500',
  'Saúde':         'bg-teal-500',
  'Meio Ambiente': 'bg-emerald-600',
  'Parcerias':     'bg-orange-500',
  'Eventos':       'bg-pink-500',
  'Institucional': 'bg-gray-600',
  'Projetos':      'bg-dourado',
}

// Static seed news for when no data is in the DB yet
const SEED_NEWS: NewsItem[] = [
  {
    id: 1,
    title: 'Oficinas pedagógicas fortalecem aprendizagem em Alto Paraíso de Goiás',
    category: 'Educação',
    content: 'Atividades lúdicas e personalizadas ajudam crianças a desenvolverem todo o seu potencial.',
    image_url: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=600&q=80',
    created_at: '2024-05-10T00:00:00Z',
  },
  {
    id: 2,
    title: 'Projeto Mãos em Movimento incentiva jovens por meio do esporte',
    category: 'Esporte',
    content: 'Iniciativa promove inclusão, disciplina e saúde para adolescentes da comunidade.',
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80',
    created_at: '2024-05-10T00:00:00Z',
  },
  {
    id: 3,
    title: 'Sons que inspiram: música que transforma realidades',
    category: 'Cultura',
    content: 'Aulas de música despertam talentos e aumentam a autoestima de crianças e jovens.',
    image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80',
    created_at: '2024-05-02T00:00:00Z',
  },
  {
    id: 4,
    title: 'Saúde Para Todos realiza mais de 200 atendimentos no mês de abril',
    category: 'Saúde',
    content: 'Ações de prevenção e orientação garantem mais qualidade de vida para a população.',
    image_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&q=80',
    created_at: '2024-04-25T00:00:00Z',
  },
  {
    id: 5,
    title: 'Educação ambiental: pequenas ações, grandes mudanças',
    category: 'Meio Ambiente',
    content: 'Alunos participam de atividades que incentivam o cuidado com o meio ambiente.',
    image_url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80',
    created_at: '2024-04-18T00:00:00Z',
  },
  {
    id: 6,
    title: 'Nova parceria fortalece projetos de educação e cultura',
    category: 'Parcerias',
    content: 'Instituto MCS e empresas parceiras unem forças para ampliar o impacto social.',
    image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80',
    created_at: '2024-04-18T00:00:00Z',
  },
  {
    id: 7,
    title: 'MCS promove encontro sobre impacto social e cidadania',
    category: 'Eventos',
    content: 'Evento reúne especialistas e comunidade para debater soluções para o futuro.',
    image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
    created_at: '2024-04-05T00:00:00Z',
  },
  {
    id: 8,
    title: 'Relatório Anual 2023 já está disponível!',
    category: 'Institucional',
    content: 'Confira os resultados, conquistas e desafios do Instituto MCS no último ano.',
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
    created_at: '2024-03-28T00:00:00Z',
  },
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
}

function CategoryBadge({ category }: { category: string }) {
  const color = CATEGORY_COLORS[category] || 'bg-gray-500'
  return (
    <span className={`${color} text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full`}>
      {category}
    </span>
  )
}

export default function NoticiasPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [activeCategory, setActiveCategory] = useState('Todas as notícias')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const PER_PAGE = 8

  useEffect(() => {
    fetch(`/api/news?tenant_id=${TENANT_ID}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setNews(data)
        else setNews(SEED_NEWS)
      })
      .catch(() => setNews(SEED_NEWS))
  }, [])

  const filtered = news.filter((n) => {
    const matchCat = activeCategory === 'Todas as notícias' || n.category === activeCategory
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const destaques = news.slice(0, 3)

  return (
    <div className="bg-marfim text-carbono min-h-screen">
      {/* ── Hero ────────────────────────────────────── */}
      <section className="pt-28 pb-0">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
            <a href="/" className="hover:text-dourado transition-colors">🏠</a>
            <span>›</span>
            <span className="text-carbono font-semibold">Notícias</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 items-center pb-16 border-b border-gray-200">
            <div>
              <span className="inline-flex items-center gap-2 text-dourado font-bold text-xs uppercase tracking-widest mb-6">
                <span className="w-5 h-5 bg-dourado/10 rounded flex items-center justify-center">📰</span>
                NOTÍCIAS
              </span>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-tight mb-6">
                Informação que conecta, ações que transformam
              </h1>
              <p className="text-gray-500 leading-relaxed max-w-lg">
                Acompanhe as novidades, histórias e conquistas do Instituto MCS. Cada notícia é um passo a mais rumo a uma sociedade mais justa, inclusiva e consciente.
              </p>
            </div>
            <div className="relative rounded-2xl overflow-hidden aspect-[16/9] lg:aspect-[4/3] shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=80"
                alt="Notícias Instituto MCS"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-carbono/60 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Content ─────────────────────────────────── */}
      <section className="py-12">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="flex gap-10 xl:gap-16">
            {/* ── Main Column ─────────────────────── */}
            <div className="flex-1 min-w-0">
              {/* Filter bar */}
              <div className="flex flex-wrap items-center gap-3 mb-8">
                <div className="flex flex-wrap gap-2 flex-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setActiveCategory(cat); setPage(1) }}
                      className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                        activeCategory === cat
                          ? 'bg-carbono text-marfim'
                          : 'bg-white text-gray-600 border border-gray-200 hover:border-carbono'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                {/* Search */}
                <div className="relative">
                  <input
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                    placeholder="Buscar notícias..."
                    className="border border-gray-200 rounded-full px-5 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-dourado/30 focus:border-dourado w-44 bg-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                </div>
              </div>

              <p className="text-xs text-gray-400 mb-6 font-semibold uppercase tracking-widest">
                Mostrando {filtered.length} {filtered.length === 1 ? 'notícia' : 'notícias'}
              </p>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
                {paginated.map((item) => (
                  <article
                    key={item.id}
                    className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col group"
                  >
                    <div className="relative overflow-hidden aspect-[4/3]">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-4xl">📰</div>
                      )}
                      <div className="absolute top-3 left-3">
                        <CategoryBadge category={item.category} />
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      <p className="text-[10px] text-gray-400 font-semibold tracking-widest mb-2">
                        {formatDate(item.created_at)}
                      </p>
                      <h3 className="font-bold text-carbono text-sm leading-snug mb-3 flex-1 line-clamp-3">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">
                        {item.content}
                      </p>
                      <button className="flex items-center gap-2 text-xs font-bold text-carbono hover:text-dourado transition-colors uppercase tracking-widest group/btn">
                        LER MAIS
                        <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-sm text-gray-500 hover:border-carbono hover:text-carbono disabled:opacity-30 transition-colors"
                  >
                    ‹
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const p = i + 1
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 rounded-full text-sm font-bold transition-all ${
                          page === p ? 'bg-carbono text-marfim' : 'border border-gray-200 text-gray-500 hover:border-carbono hover:text-carbono'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  })}
                  {totalPages > 5 && <span className="text-gray-400 text-sm">…</span>}
                  {totalPages > 5 && (
                    <button
                      onClick={() => setPage(totalPages)}
                      className="w-9 h-9 rounded-full border border-gray-200 text-sm font-bold text-gray-500 hover:border-carbono hover:text-carbono transition-colors"
                    >
                      {totalPages}
                    </button>
                  )}
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-sm text-gray-500 hover:border-carbono hover:text-carbono disabled:opacity-30 transition-colors"
                  >
                    ›
                  </button>
                </div>
              )}
            </div>

            {/* ── Sidebar ──────────────────────────── */}
            <aside className="w-72 xl:w-80 shrink-0 hidden lg:block space-y-8">
              {/* Destaques */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-carbono text-sm uppercase tracking-widest mb-5">Destaques</h3>
                <div className="space-y-5">
                  {destaques.map((item) => (
                    <div key={item.id} className="flex gap-3 group cursor-pointer">
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-2xl">📰</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs text-carbono leading-snug mb-1 line-clamp-2 group-hover:text-dourado transition-colors">
                          {item.title}
                        </p>
                        <p className="text-[10px] text-gray-400 font-semibold">{formatDate(item.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-6 w-full flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-dourado border border-dourado rounded-full py-2 hover:bg-dourado hover:text-carbono transition-colors">
                  VER TODOS OS DESTAQUES →
                </button>
              </div>

              {/* Newsletter */}
              <div className="bg-carbono text-marfim rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">✉️</span>
                  <div>
                    <h3 className="font-bold text-sm leading-tight">Receba nossas novidades</h3>
                    <p className="text-gray-400 text-xs mt-0.5">Cadastre-se e receba em primeira mão nossas notícias, eventos e histórias de impacto.</p>
                  </div>
                </div>
                <div className="space-y-3 mt-5">
                  <input
                    type="email"
                    placeholder="Seu e-mail"
                    className="w-full bg-gray-800 text-marfim placeholder-gray-500 text-sm px-4 py-3 rounded-xl border border-gray-700 focus:outline-none focus:border-dourado"
                  />
                  <button className="w-full bg-dourado text-carbono font-bold text-xs uppercase tracking-widest py-3 rounded-xl hover:bg-yellow-500 transition-colors">
                    CADASTRAR
                  </button>
                </div>
                <p className="text-gray-500 text-[10px] mt-3 text-center">Prometemos não enviar spam. Você pode cancelar quando quiser.</p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}
