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

        {/* Project 2: MCS Digital */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col lg:flex-row-reverse mb-12">
          <div className="lg:w-2/5 relative min-h-[300px] bg-gray-200">
            <img src="/hero.png" alt="MCS Digital" className="w-full h-full object-cover absolute inset-0" />
            <div className="absolute top-6 right-6 z-20 px-4 py-1.5 text-xs font-bold tracking-wider rounded-full border bg-blue-100 text-blue-800 border-blue-200 shadow-sm">
              EM ANDAMENTO
            </div>
          </div>
          
          <div className="lg:w-3/5 p-8 lg:p-12">
            <h2 className="font-serif text-3xl lg:text-4xl text-carbono mb-4 leading-tight">
              Prepare Seu Filho para a Era Digital com o Projeto MCS Digital!
            </h2>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              Você já imaginou um ecossistema onde a tecnologia de ponta e a Inteligência Artificial entram na sala de aula para transformar a curiosidade do seu filho na ferramenta mais poderosa para o futuro? Apresentamos o <strong>MCS Digital</strong>, uma iniciativa pioneira para democratizar o acesso à tecnologia e formar a nova geração de criadores e empreendedores do Cerrado.
            </p>

            <h3 className="font-bold text-xl text-carbono mb-4">Por que o MCS Digital é essencial?</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Em um mundo em rápida transformação, o acesso à tecnologia não pode ser um privilégio. O MCS Digital prepara os jovens para não apenas consumirem, mas pensarem e produzirem com ferramentas digitais:
            </p>

            <ul className="space-y-4 mb-8">
              <li className="flex gap-4">
                <span className="text-dourado text-xl mt-1">💻</span>
                <div>
                  <strong className="text-carbono block mb-1">Letramento e Inovação</strong>
                  <span className="text-gray-600 text-sm">Introduzimos conceitos de Inteligência Artificial, pensamento computacional e prompt engineering de forma lúdica e prática para crianças e jovens.</span>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-dourado text-xl mt-1">🚀</span>
                <div>
                  <strong className="text-carbono block mb-1">Protagonismo e Empreendedorismo</strong>
                  <span className="text-gray-600 text-sm">Através de trilhas divididas por idade (Exploradores Digitais e Criadores do Futuro), seu filho aprende a criar conteúdos reais, como guias turísticos, podcasts e bancos de imagens.</span>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-dourado text-xl mt-1">🛡️</span>
                <div>
                  <strong className="text-carbono block mb-1">Valores e Ética Digital</strong>
                  <span className="text-gray-600 text-sm">Promovemos o pensamento crítico e o uso responsável da tecnologia, combatendo fake news e ensinando sobre privacidade e cidadania digital.</span>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-dourado text-xl mt-1">📍</span>
                <div>
                  <strong className="text-carbono block mb-1">Conexão com o Território</strong>
                  <span className="text-gray-600 text-sm">Unimos a tecnologia à realidade local, aplicando o aprendizado ao turismo, à gastronomia e à valorização da nossa Chapada dos Veadeiros.</span>
                </div>
              </li>
            </ul>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8">
              <h3 className="font-bold text-lg text-carbono mb-3">Detalhes do Programa</h3>
              <p className="text-gray-600 text-sm mb-2"><strong>Local:</strong> O MCS Digital acontece em um ambiente estruturado e conectado nos polos de atendimento.</p>
              <p className="text-gray-600 text-sm mb-2"><strong>Período:</strong> Ciclos contínuos de aprendizado prático ao longo do ano.</p>
              <p className="text-gray-600 text-sm"><strong>Estrutura:</strong> Turmas organizadas por faixa etária com foco em projetos reais.</p>
            </div>

            <p className="text-carbono font-medium text-lg mb-8 italic border-l-4 border-dourado pl-4 py-2">
              Seu filho vai aprender a usar a Inteligência Artificial e a inovação para construir conhecimento, autonomia e novas oportunidades profissionais.
            </p>

            <Link to="/contato" className="bg-carbono text-marfim font-bold py-4 px-8 rounded-full hover:bg-gray-800 transition-colors inline-flex items-center gap-2 text-sm uppercase tracking-wider">
              Garanta a Vaga do Seu Filho
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>
          </div>
        </div>

        {/* Project 3: MCS Família */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col lg:flex-row mb-12">
          <div className="lg:w-2/5 relative min-h-[300px] bg-gray-200">
            <img src="/hero.png" alt="MCS Família" className="w-full h-full object-cover absolute inset-0" />
            <div className="absolute top-6 left-6 z-20 px-4 py-1.5 text-xs font-bold tracking-wider rounded-full border bg-yellow-100 text-yellow-800 border-yellow-200 shadow-sm">
              EM ANDAMENTO
            </div>
          </div>
          
          <div className="lg:w-3/5 p-8 lg:p-12">
            <h2 className="font-serif text-3xl lg:text-4xl text-carbono mb-4 leading-tight">
              Fortaleça Toda a Família com o Projeto MCS Família!
            </h2>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              Você já imaginou um espaço de acolhimento onde a comunidade encontra suporte jurídico, apoio psicossocial e trilhas de capacitação para transformar o potencial da nossa região em conquistas reais para dentro de casa? Apresentamos o <strong>MCS Família</strong>, a base de sustentação do nosso ecossistema de desenvolvimento.
            </p>

            <h3 className="font-bold text-xl text-carbono mb-4">Por que o MCS Família é essencial?</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Acreditamos que o desenvolvimento de uma criança ou jovem só é completo quando a sua rede de apoio familiar também é fortalecida. O MCS Família atua lado a lado com os outros projetos do Instituto para garantir:
            </p>

            <ul className="space-y-4 mb-8">
              <li className="flex gap-4">
                <span className="text-dourado text-xl mt-1">⚖️</span>
                <div>
                  <strong className="text-carbono block mb-1">Segurança e Cuidado</strong>
                  <span className="text-gray-600 text-sm">Oferecemos atendimento psicossocial e orientação jurídica estruturada para dar tranquilidade e amparo aos lares.</span>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-dourado text-xl mt-1">💼</span>
                <div>
                  <strong className="text-carbono block mb-1">Geração de Renda e Autonomia</strong>
                  <span className="text-gray-600 text-sm">Capacitamos pais, responsáveis e jovens por meio de trilhas profissionalizantes alinhadas às reais demandas das cadeias produtivas locais, como o turismo e a economia criativa.</span>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-dourado text-xl mt-1">👪</span>
                <div>
                  <strong className="text-carbono block mb-1">Integração Comunitária</strong>
                  <span className="text-gray-600 text-sm">Criamos pontes entre a família e as inovações tecnológicas e culturais oferecidas pelo Instituto, unindo gerações em prol do bem comum.</span>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-dourado text-xl mt-1">🏡</span>
                <div>
                  <strong className="text-carbono block mb-1">Dignidade e Bem-Estar</strong>
                  <span className="text-gray-600 text-sm">Promovemos um ambiente onde o crescimento econômico e turístico de Alto Paraíso se converte em qualidade de vida concreta para cada família.</span>
                </div>
              </li>
            </ul>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8">
              <h3 className="font-bold text-lg text-carbono mb-3">Detalhes do Programa</h3>
              <p className="text-gray-600 text-sm mb-2"><strong>O MCS Família:</strong> Funciona como um ponto de apoio contínuo para a comunidade.</p>
              <p className="text-gray-600 text-sm mb-2"><strong>Acompanhamento:</strong> Trilhas formativas, mentorias e suporte integrado.</p>
              <p className="text-gray-600 text-sm"><strong>Foco:</strong> Desenvolvimento humano, sustentabilidade e autonomia financeira.</p>
            </div>

            <p className="text-carbono font-medium text-lg mb-8 italic border-l-4 border-dourado pl-4 py-2">
              Sua família vai encontrar o suporte necessário para transformar desafios em oportunidades e construir um futuro mais próspero.
            </p>

            <Link to="/contato" className="bg-carbono text-marfim font-bold py-4 px-8 rounded-full hover:bg-gray-800 transition-colors inline-flex items-center gap-2 text-sm uppercase tracking-wider">
              Faça Parte Deste Movimento!
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>
          </div>
        </div>

        {/* Project 4: Conexão Rima */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col lg:flex-row-reverse mb-12">
          <div className="lg:w-2/5 relative min-h-[300px] bg-gray-200">
            <img src="/conexao-rima.png" alt="Conexão Rima" className="w-full h-full object-cover absolute inset-0" onError={(e) => e.currentTarget.src = '/hero.png'} />
            <div className="absolute top-6 right-6 z-20 px-4 py-1.5 text-xs font-bold tracking-wider rounded-full border bg-purple-100 text-purple-800 border-purple-200 shadow-sm">
              EM ANDAMENTO
            </div>
          </div>
          
          <div className="lg:w-3/5 p-8 lg:p-12">
            <h2 className="font-serif text-3xl lg:text-4xl text-carbono mb-4 leading-tight">
              Contraturno Conexão Rima
            </h2>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              <strong>Linguagem, Respeito e Expressão Cultural.</strong> Uma iniciativa focada no desenvolvimento da leitura, escrita e comunicação de forma criativa e cidadã para alunos do 4º e 5º ano do Ensino Fundamental.
            </p>

            <h3 className="font-bold text-xl text-carbono mb-4">Benefícios e Aprendizados</h3>
            
            <ul className="space-y-4 mb-8">
              <li className="flex gap-4">
                <span className="text-dourado text-xl mt-1">📚</span>
                <div>
                  <strong className="text-carbono block mb-1">Comunicação e Expressão</strong>
                  <span className="text-gray-600 text-sm">Melhora da leitura, escrita e comunicação oral. Desenvolvimento da criatividade e expressão corporal.</span>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-dourado text-xl mt-1">🌟</span>
                <div>
                  <strong className="text-carbono block mb-1">Protagonismo e Confiança</strong>
                  <span className="text-gray-600 text-sm">Fortalecimento da autoestima e da confiança através do protagonismo juvenil.</span>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-dourado text-xl mt-1">🤝</span>
                <div>
                  <strong className="text-carbono block mb-1">Respeito e Cooperação</strong>
                  <span className="text-gray-600 text-sm">Respeito e cooperação através da comunicação não violenta. Valorização da cultura brasileira, indígena, afro-brasileira e quilombola.</span>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-dourado text-xl mt-1">🌿</span>
                <div>
                  <strong className="text-carbono block mb-1">Consciência Ambiental</strong>
                  <span className="text-gray-600 text-sm">Conscientização ambiental sobre a importância das águas e do cerrado.</span>
                </div>
              </li>
            </ul>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8">
              <h3 className="font-bold text-lg text-carbono mb-3">Detalhes do Programa</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm mb-2"><strong>Local:</strong> Polo UAB Alto Paraíso de Goiás</p>
                  <p className="text-gray-600 text-sm mb-2"><strong>Período:</strong> Agosto a Dezembro</p>
                  <p className="text-gray-600 text-sm"><strong>Dias:</strong> Terças e Quintas-feiras</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-2"><strong>Horários:</strong> Manhã (09h às 10h) | Tarde (15h às 16h)</p>
                  <p className="text-gray-600 text-sm mb-2"><strong>Público:</strong> Alunos do 4º e 5º ano (Escolas Ana Aguiar e Zeca de Faria)</p>
                  <p className="text-gray-600 text-sm"><strong>Apoio:</strong> Sec. Municipal de Educação</p>
                </div>
              </div>
            </div>

            <p className="text-carbono font-medium text-lg mb-8 italic border-l-4 border-dourado pl-4 py-2">
              Seu filho vai aprender a usar as palavras para construir conhecimento, respeito e confiança.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
