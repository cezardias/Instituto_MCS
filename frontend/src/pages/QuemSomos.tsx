import { Link } from 'react-router-dom';

export default function QuemSomos() {
  return (
    <div className="bg-marfim text-carbono min-h-screen">
      {/* Hero Section */}
      <section className="pt-24 lg:pt-32 pb-12 lg:pb-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="text-center lg:text-left">
            <span className="text-dourado font-semibold tracking-wider text-[10px] md:text-xs uppercase mb-4 block">
              CONHEÇA O INSTITUTO MCS
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-7xl leading-tight mb-6 lg:mb-8">
              Quem somos
            </h1>
            <div className="space-y-4 md:space-y-6 text-base md:text-lg text-gray-700 leading-relaxed text-left">
              <p>
                O Instituto Movimento de Cultura Social (MCS) nasce do compromisso com o desenvolvimento humano e social por meio da cultura, educação, esporte, saúde e cidadania.
              </p>
              <p>
                Atuamos em Alto Paraíso de Goiás e região, promovendo oportunidades, fortalecendo comunidades e transformando realidades.
              </p>
            </div>
            <div className="w-12 h-[1px] bg-dourado mt-8 lg:mt-10 mx-auto lg:mx-0"></div>
          </div>
          
          <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[4/3]">
            <img 
              src="/quemsomos.png" 
              alt="Crianças aprendendo e sorrindo" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Missão Visão Valores & Diretoria */}
      <section className="py-12 lg:py-20 border-t border-gray-200">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 grid lg:grid-cols-3 gap-12 lg:gap-16">
          <div className="lg:col-span-2">
            <span className="text-dourado font-semibold tracking-wider text-[10px] md:text-xs uppercase mb-2 block">
              NOSSOS PRINCÍPIOS
            </span>
            <h2 className="font-serif text-3xl mb-8 lg:mb-12">Missão, Visão e Valores</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <div className="w-10 h-10 rounded-full border border-dourado flex items-center justify-center text-dourado mb-4 lg:mb-6">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h3 className="font-bold mb-2 lg:mb-3">Missão</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Promover o desenvolvimento integral de pessoas e comunidades por meio de ações socioeducativas e culturais, contribuindo para uma sociedade mais justa, inclusiva e consciente.
                </p>
              </div>
              <div>
                <div className="w-10 h-10 rounded-full border border-dourado flex items-center justify-center text-dourado mb-4 lg:mb-6">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </div>
                <h3 className="font-bold mb-2 lg:mb-3">Visão</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Ser referência em transformação social, reconhecido pela excelência na gestão de projetos e pelo impacto positivo e sustentável nas comunidades onde atuamos.
                </p>
              </div>
              <div>
                <div className="w-10 h-10 rounded-full border border-dourado flex items-center justify-center text-dourado mb-4 lg:mb-6">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </div>
                <h3 className="font-bold mb-2 lg:mb-3">Valores</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Ética, transparência, respeito à diversidade, responsabilidade social, colaboração, excelência, inovação e compromisso com as futuras gerações.
                </p>
              </div>
            </div>
          </div>
          
          <div className="pt-8 lg:pt-0 lg:border-l lg:border-gray-200 border-t border-gray-200 lg:border-t-0 lg:pl-16">
            <span className="text-dourado font-semibold tracking-wider text-[10px] md:text-xs uppercase mb-2 block">
              DIRETORIA
            </span>
            <h2 className="font-serif text-3xl mb-8">Diretoria Atual</h2>
            
            <div className="space-y-6 mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden shrink-0"></div>
                <div>
                  <h4 className="font-bold text-sm">João Marcos Alves</h4>
                  <p className="text-xs text-gray-500">Presidente</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden shrink-0"></div>
                <div>
                  <h4 className="font-bold text-sm">Patrícia Nunes Oliveira</h4>
                  <p className="text-xs text-gray-500">Vice-Presidente</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden shrink-0"></div>
                <div>
                  <h4 className="font-bold text-sm">Lucas Ferreira Rocha</h4>
                  <p className="text-xs text-gray-500">Diretor Administrativo</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden shrink-0"></div>
                <div>
                  <h4 className="font-bold text-sm">Amanda Reis Souza</h4>
                  <p className="text-xs text-gray-500">Diretora Financeira</p>
                </div>
              </div>
            </div>
            
            <Link to="/equipe" className="inline-flex items-center gap-2 border border-dourado text-dourado hover:bg-dourado hover:text-carbono transition-colors px-6 py-2 rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase text-center w-full justify-center lg:w-auto">
              CONHEÇA TODA A EQUIPE <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Impact Stats (Dark Bar) */}
      <section className="bg-[url('https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center relative">
        <div className="absolute inset-0 bg-carbono/90 mix-blend-multiply"></div>
        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-8 py-16 lg:py-20 text-marfim">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12 items-center">
            <div className="col-span-2 text-center lg:text-left mb-4 lg:mb-0">
              <span className="text-dourado font-semibold tracking-wider text-[10px] md:text-xs uppercase mb-2 block">
                NOSSO IMPACTO
              </span>
              <h2 className="font-serif text-3xl md:text-4xl">Números que movem mudanças</h2>
            </div>
            
            <div className="text-center">
              <div className="text-dourado mb-3 lg:mb-4 flex justify-center">
                <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <p className="font-serif text-2xl md:text-3xl mb-1">+ 3.200</p>
              <p className="text-[10px] md:text-xs text-gray-400">Pessoas impactadas</p>
            </div>
            <div className="text-center">
              <div className="text-dourado mb-3 lg:mb-4 flex justify-center">
                <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <p className="font-serif text-2xl md:text-3xl mb-1">12</p>
              <p className="text-[10px] md:text-xs text-gray-400">Projetos em execução</p>
            </div>
            <div className="text-center col-span-2 md:col-span-1">
              <div className="text-dourado mb-3 lg:mb-4 flex justify-center">
                <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <p className="font-serif text-2xl md:text-3xl mb-1">07</p>
              <p className="text-[10px] md:text-xs text-gray-400">Municípios atendidos</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
