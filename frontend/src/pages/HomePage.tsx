import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import OficineiroRegistrationModal from '../components/OficineiroRegistrationModal';

export default function HomePage() {
  const [showOficineiroModal, setShowOficineiroModal] = useState(false);
  const [recentNews, setRecentNews] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/news?tenant_id=instituto-mcs')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRecentNews(data.slice(0, 3));
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="bg-marfim text-carbono min-h-screen">
      {/* Hero Section — Full Bleed Widescreen Background Photo under Header */}
      <section className="relative min-h-[85vh] lg:min-h-[90vh] pt-32 pb-16 flex flex-col justify-center overflow-hidden bg-[#06080d] text-white">
        {/* Full-bleed Widescreen Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero_bg.jpg" 
            alt="Crianças aprendendo no Instituto MCS" 
            className="w-full h-full object-cover object-center filter contrast-[1.03] brightness-[0.98]"
          />
          {/* Subtle dark gradient overlay on left so text is readable while keeping all 3 kids visible */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#06080d]/95 via-[#06080d]/60 sm:via-[#06080d]/40 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#06080d]/80 via-[#06080d]/30 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#06080d] via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Hero Text Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full pt-6 pb-4 flex-1 flex items-center">
          <div className="max-w-xl text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.18] mb-5 text-white font-sans drop-shadow-md">
              Transformamos realidades através da{' '}
              <span className="text-amber-400 font-extrabold block mt-1">
                cultura, educação e oportunidades.
              </span>
            </h1>

            <p className="text-gray-200 text-sm sm:text-base leading-relaxed mb-8 font-normal max-w-md drop-shadow">
              Promovemos o desenvolvimento humano e social por meio de projetos que geram impacto positivo e constroem um futuro mais justo e consciente.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link 
                to="/projetos" 
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold py-3.5 px-7 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 shadow-xl flex items-center gap-2.5 text-xs sm:text-sm tracking-wider uppercase"
              >
                CONHEÇA NOSSOS PROJETOS <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Rifa MCS Highlight Banner */}
      <section className="bg-white py-12 border-t border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="bg-gradient-to-r from-yellow-50 to-white border border-yellow-100 rounded-3xl p-8 lg:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-2/3">
              <span className="text-yellow-600 font-bold tracking-widest text-xs uppercase mb-2 block flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                Campanha Solidária
              </span>
              <h2 className="font-serif text-3xl lg:text-4xl text-carbono mb-4">
                Participe da <span className="text-dourado">Rifa MCS</span>
              </h2>
              <p className="text-gray-600 text-lg">
                Ajude a financiar projetos de transformação social, esporte e cultura para famílias em Alto Paraíso. Itens exclusivos serão sorteados em breve!
              </p>
            </div>
            <div className="md:w-1/3 flex justify-center md:justify-end shrink-0">
              <Link to="/rifa" className="bg-dourado text-carbono font-bold py-4 px-10 rounded-full hover:bg-yellow-500 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2">
                SAIBA MAIS E PARTICIPE
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Últimas Notícias (Matérias do Dashboard) */}
      {recentNews.length > 0 && (
        <section className="py-20 bg-gray-50 border-t border-gray-100">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <span className="text-dourado font-bold tracking-widest text-xs uppercase mb-3 block">Fique por dentro</span>
                <h2 className="font-serif text-4xl text-carbono">Últimas Notícias</h2>
              </div>
              <Link to="/noticias" className="hidden md:inline-flex items-center gap-2 text-carbono font-bold hover:text-dourado transition-colors">
                VER TODAS AS MATÉRIAS <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {recentNews.map(news => (
                <Link to="/noticias" key={news.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                  <div className="h-48 bg-gray-200 overflow-hidden relative">
                    {news.image_url ? (
                      <img src={news.image_url} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                    )}
                    <div className="absolute top-4 left-4 z-20 px-3 py-1 text-[10px] font-bold tracking-wider rounded-full bg-dourado text-carbono uppercase shadow-sm">
                      {news.category}
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <p className="text-gray-400 text-xs font-semibold mb-3">
                      {new Date(news.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                    </p>
                    <h3 className="font-serif text-xl text-carbono mb-3 leading-tight group-hover:text-dourado transition-colors line-clamp-2">
                      {news.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-6">
                      {news.content.replace(/<[^>]+>/g, '')}
                    </p>
                    <div className="mt-auto text-carbono font-bold text-xs uppercase tracking-widest flex items-center gap-2 group-hover:text-dourado transition-colors">
                      Ler matéria completa
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="mt-10 md:hidden text-center">
              <Link to="/noticias" className="inline-flex items-center gap-2 bg-carbono text-white font-bold py-3 px-8 rounded-full hover:bg-gray-800 transition-colors uppercase text-sm tracking-wider">
                TODAS AS MATÉRIAS
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Stats Section 
      <section className="border-t border-gray-200 bg-white pb-20 pt-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
            <div className="text-center">
              <div className="text-dourado mb-4 flex justify-center">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <p className="font-serif text-4xl mb-2 text-carbono">+ 3.200</p>
              <p className="text-sm text-gray-600">Pessoas impactadas</p>
            </div>
            
            <div className="text-center">
              <div className="text-dourado mb-4 flex justify-center">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <p className="font-serif text-4xl mb-2 text-carbono">12</p>
              <p className="text-sm text-gray-600">Projetos em execução</p>
            </div>

            <div className="text-center">
              <div className="text-dourado mb-4 flex justify-center">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <p className="font-serif text-4xl mb-2 text-carbono">07</p>
              <p className="text-sm text-gray-600">Municípios atendidos</p>
            </div>

            <div className="text-center">
              <div className="text-dourado mb-4 flex justify-center">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <p className="font-serif text-4xl mb-2 text-carbono">23</p>
              <p className="text-sm text-gray-600">Rede de associados institucionais</p>
            </div>

            <div className="col-span-2 lg:col-span-1 pl-0 lg:pl-8 lg:border-l border-gray-200 flex flex-col justify-center">
              <span className="text-dourado text-4xl leading-none font-serif block mb-2">&ldquo;</span>
              <p className="text-gray-600 italic text-sm mb-4">
                Acreditamos no poder do acolhimento social, da educação e da cultura como caminhos para transformar realidades e construir uma comunidade mais unida e forte.
              </p>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Instituto MCS</span>
            </div>
          </div>
        </div>
      </section>
      */}
      {/* Oficineiro Registration Modal */}
      {showOficineiroModal && (
        <OficineiroRegistrationModal onClose={() => setShowOficineiroModal(false)} />
      )}
    </div>
  )
}
