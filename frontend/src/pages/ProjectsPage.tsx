import { Link } from 'react-router-dom';

const projects = [
  { 
    title: 'Educação que gera futuro', 
    status: 'EM ANDAMENTO', 
    description: 'Reforço escolar e desenvolvimento socioemocional para crianças e adolescentes em situação de vulnerabilidade.',
    impact: '1.200 beneficiados', 
    location: 'Goiânia - GO',
    statusColor: 'bg-green-100 text-green-800 border-green-200'
  },
  { 
    title: 'Saúde para transformar vidas', 
    status: 'EM ANDAMENTO', 
    description: 'Atendimentos médicos, prevenção e promoção da saúde para comunidades com acesso limitado.',
    impact: '800 beneficiados', 
    location: 'Aparecida de Goiânia - GO',
    statusColor: 'bg-green-100 text-green-800 border-green-200'
  },
  { 
    title: 'Esporte que inspira', 
    status: 'EM ANDAMENTO', 
    description: 'Incentivo ao esporte como ferramenta de inclusão, disciplina e sonhos para jovens da comunidade.',
    impact: '650 beneficiados', 
    location: 'Trindade - GO',
    statusColor: 'bg-green-100 text-green-800 border-green-200'
  },
  { 
    title: 'Sustentabilidade que conecta', 
    status: 'PLANEJAMENTO', 
    description: 'Educação ambiental e ações práticas para promover consciência e preservação do meio ambiente.',
    impact: '500 beneficiados', 
    location: 'Goiânia - GO',
    statusColor: 'bg-blue-100 text-blue-800 border-blue-200'
  }
];

export default function ProjectsPage() {
  return (
    <div className="bg-marfim min-h-screen pt-24 pb-20">
      {/* Hero Banner */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 mb-12">
        <div className="relative rounded-[2rem] overflow-hidden bg-carbono text-marfim flex flex-col md:flex-row items-center min-h-[360px]">
          <div className="absolute inset-0">
            <img src="/hero.png" alt="Crianças" className="w-full h-full object-cover opacity-40 mix-blend-overlay" />
          </div>
          <div className="relative z-10 p-10 lg:p-16 md:w-1/2">
            <span className="text-dourado font-bold tracking-widest text-xs uppercase mb-4 block">Banco de Projetos —</span>
            <h1 className="font-serif text-4xl lg:text-5xl leading-tight mb-6">
              Conheça iniciativas que transformam realidades.
            </h1>
            <p className="text-gray-300 text-sm leading-relaxed max-w-md">
              Aqui você encontra os projetos apoiados pelo Instituto MCS. Explore, conheça e compartilhe causas que constroem um futuro mais justo e consciente.
            </p>
          </div>
          <div className="relative z-10 p-10 lg:p-16 md:w-1/2 flex justify-end">
            <div className="bg-carbono/80 backdrop-blur-md p-8 rounded-2xl border border-gray-700/50 max-w-sm">
              <svg className="w-8 h-8 text-dourado mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              <h3 className="font-serif text-2xl mb-3">Cada projeto é um passo para um mundo melhor.</h3>
              <p className="text-sm text-gray-400">Apoie, compartilhe e faça parte dessa rede de transformação.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-4 gap-10">
        
        {/* Sidebar / Filters */}
        <aside className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-carbono mb-6 text-lg">Filtros</h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Área de atuação</label>
                <select className="w-full bg-gray-50 border border-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-dourado transition-colors appearance-none cursor-pointer">
                  <option>Todas as áreas</option>
                  <option>Educação</option>
                  <option>Saúde</option>
                  <option>Esporte</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Localização</label>
                <select className="w-full bg-gray-50 border border-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-dourado transition-colors appearance-none cursor-pointer">
                  <option>Todos os estados</option>
                  <option>Goiás - GO</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Público beneficiado</label>
                <select className="w-full bg-gray-50 border border-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-dourado transition-colors appearance-none cursor-pointer">
                  <option>Todos os públicos</option>
                  <option>Crianças e adolescentes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Situação do projeto</label>
                <select className="w-full bg-gray-50 border border-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-dourado transition-colors appearance-none cursor-pointer">
                  <option>Todos os status</option>
                  <option>Em andamento</option>
                  <option>Planejamento</option>
                </select>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <button className="w-full bg-dourado text-carbono font-bold py-3 rounded-lg hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  FILTRAR PROJETOS
                </button>
                <button className="w-full text-gray-500 font-semibold py-2 text-sm hover:text-carbono transition-colors">
                  LIMPAR FILTROS
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Project List */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-500 text-sm">Mostrando 24 projetos</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm">Ordenar por:</span>
              <select className="bg-transparent text-sm font-semibold text-carbono border-none focus:ring-0 cursor-pointer outline-none">
                <option>Mais recentes</option>
                <option>A-Z</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col group hover:shadow-md transition-shadow">
                <div className="relative h-48 overflow-hidden bg-gray-200">
                  <div className="absolute inset-0 bg-carbono/10 group-hover:bg-transparent transition-colors z-10"></div>
                  <img src="/hero.png" alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className={`absolute bottom-4 left-4 z-20 px-3 py-1 text-[0.65rem] font-bold tracking-wider rounded-full border ${project.statusColor} bg-white/90 backdrop-blur-sm`}>
                    {project.status}
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <h4 className="font-serif text-xl font-bold text-carbono mb-2 leading-tight">{project.title}</h4>
                  <p className="text-sm text-gray-500 mb-6 flex-grow leading-relaxed">{project.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-6 border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-dourado" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                      {project.impact}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-dourado" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {project.location}
                    </div>
                  </div>

                  <Link to="/projetos" className="block text-center w-full py-2.5 rounded-lg border border-dourado text-dourado font-bold text-xs hover:bg-dourado hover:text-carbono transition-colors">
                    SAIBA MAIS
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-2 mt-12">
            <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-carbono transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button className="w-8 h-8 rounded-md bg-dourado text-carbono font-bold text-sm flex items-center justify-center">1</button>
            <button className="w-8 h-8 rounded-md text-gray-500 hover:bg-gray-100 font-medium text-sm flex items-center justify-center transition-colors">2</button>
            <button className="w-8 h-8 rounded-md text-gray-500 hover:bg-gray-100 font-medium text-sm flex items-center justify-center transition-colors">3</button>
            <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-carbono transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
