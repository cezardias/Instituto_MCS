import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="bg-marfim text-carbono min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          
          <div className="z-10 text-center lg:text-left mt-8 md:mt-0">
            <span className="text-dourado font-semibold tracking-wider text-xs md:text-sm uppercase mb-4 block">
              | Instituto Movimento de Cultura Social
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-7xl leading-tight mb-6">
              Transformamos realidades através da cultura, educação e oportunidades.
            </h1>
            <p className="text-gray-600 text-base md:text-lg max-w-lg mx-auto lg:mx-0 mb-10 leading-relaxed">
              Promovemos o desenvolvimento humano e social por meio de projetos que geram impacto positivo e constroem um futuro mais justo e consciente.
            </p>
            <div className="flex justify-center lg:justify-start gap-4">
              <Link to="/projetos" className="bg-dourado text-carbono text-sm md:text-base font-semibold py-4 px-6 md:px-8 rounded-full hover:bg-yellow-500 transition-colors inline-flex items-center gap-2 w-full sm:w-auto justify-center">
                CONHEÇA NOSSOS PROJETOS <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>

          <div className="relative z-0 mt-8 lg:mt-0">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] lg:aspect-[3/4] xl:aspect-[4/3]">
              <img 
                src="/hero.png" 
                alt="Criança sorrindo em projeto educacional" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-carbono/60 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
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
              <p className="text-sm text-gray-600">Parceiros institucionais</p>
            </div>

            <div className="col-span-2 lg:col-span-1 pl-0 lg:pl-8 lg:border-l border-gray-200 flex flex-col justify-center">
              <span className="text-dourado text-4xl leading-none font-serif block mb-2">&ldquo;</span>
              <p className="text-gray-600 italic text-sm mb-4">
                Acreditamos no poder da cultura e da educação como caminhos para transformar vidas e construir uma sociedade mais consciente.
              </p>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Instituto MCS</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
