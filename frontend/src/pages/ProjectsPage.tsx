import { Link } from 'react-router-dom';

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
            <span className="text-dourado font-bold tracking-widest text-xs uppercase mb-4 block">Nossos Projetos —</span>
            <h1 className="font-serif text-4xl lg:text-5xl leading-tight mb-6">
              Iniciativas que transformam realidades.
            </h1>
            <p className="text-gray-300 text-sm leading-relaxed max-w-md">
              Conheça os projetos apoiados e realizados pelo Instituto MCS. Explore as causas que constroem um futuro mais justo e consciente no nosso território.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        
        {/* Project 1: MCS em Movimento */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col lg:flex-row mb-12">
          <div className="lg:w-2/5 relative min-h-[300px] bg-gray-200">
            <img src="/hero.png" alt="MCS em Movimento" className="w-full h-full object-cover absolute inset-0" />
            <div className="absolute top-6 left-6 z-20 px-4 py-1.5 text-xs font-bold tracking-wider rounded-full border bg-green-100 text-green-800 border-green-200 shadow-sm">
              EM ANDAMENTO
            </div>
          </div>
          
          <div className="lg:w-3/5 p-8 lg:p-12">
            <h2 className="font-serif text-3xl lg:text-4xl text-carbono mb-4 leading-tight">
              Transforme o Futuro do Seu Filho com o Projeto MCS em Movimento!
            </h2>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              Você já imaginou um espaço onde a energia, o ritmo e o esporte se unem para construir disciplina, saúde e um futuro brilhante para o seu filho? Apresentamos o <strong>MCS em Movimento</strong>, uma iniciativa transformadora desenvolvida para elevar o potencial físico, mental e social dos estudantes no contraturno escolar.
            </p>

            <h3 className="font-bold text-xl text-carbono mb-4">Por que o MCS em Movimento é essencial?</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Mais do que uma atividade física, o MCS em Movimento é um ambiente de desenvolvimento integral. Aqui, cada criança e jovem é incentivado a desenvolver competências para a vida toda:
            </p>

            <ul className="space-y-4 mb-8">
              <li className="flex gap-4">
                <span className="text-dourado text-xl mt-1">⚽</span>
                <div>
                  <strong className="text-carbono block mb-1">Saúde e Vitalidade</strong>
                  <span className="text-gray-600 text-sm">Focamos na melhoria do condicionamento físico, da coordenação motora e da consciência corporal, garantindo uma base sólida para o bem-estar.</span>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-dourado text-xl mt-1">🤸</span>
                <div>
                  <strong className="text-carbono block mb-1">Protagonismo e Confiança</strong>
                  <span className="text-gray-600 text-sm">Através da prática de Danças Urbanas e Capoeira, seu filho fortalecerá a autoestima, a disciplina e a autoconfiança, assumindo seu lugar como protagonista de sua própria história.</span>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-dourado text-xl mt-1">🤝</span>
                <div>
                  <strong className="text-carbono block mb-1">Valores que Transformam</strong>
                  <span className="text-gray-600 text-sm">Promovemos o respeito mútuo e a coletividade, ensinando os jovens a trabalhar em equipe, valorizar a união e superar desafios juntos.</span>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-dourado text-xl mt-1">🌱</span>
                <div>
                  <strong className="text-carbono block mb-1">Consciência e Identidade</strong>
                  <span className="text-gray-600 text-sm">Conectamos os alunos com suas raízes através da valorização da cultura corporal, da ancestralidade e das tradições do nosso Cerrado.</span>
                </div>
              </li>
            </ul>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8">
              <h3 className="font-bold text-lg text-carbono mb-3">Detalhes do Programa</h3>
              <p className="text-gray-600 text-sm mb-2"><strong>Local:</strong> O MCS em Movimento acontece em um ambiente seguro e acolhedor nos Polos de Alto Paraíso de Goiás e região.</p>
              <p className="text-gray-600 text-sm"><strong>Dias:</strong> Encontros semanais estruturados para o contraturno.</p>
            </div>

            <p className="text-carbono font-medium text-lg mb-8 italic border-l-4 border-dourado pl-4 py-2">
              Seu filho vai aprender a usar o corpo, o ritmo e a disciplina para construir um futuro com mais saúde, respeito e confiança.
            </p>

            <Link to="/contato" className="bg-carbono text-marfim font-bold py-4 px-8 rounded-full hover:bg-gray-800 transition-colors inline-flex items-center gap-2 text-sm uppercase tracking-wider">
              Garanta a Vaga do Seu Filho
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
