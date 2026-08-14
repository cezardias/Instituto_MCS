import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/projects?tenant_id=instituto-mcs')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProjects(data);
      })
      .catch(console.error);
  }, []);

  const pMovimento = projects.find(p => p.title.toLowerCase().includes('movimento'));
  const pDigital = projects.find(p => p.title.toLowerCase().includes('digital'));
  const pFamilia = projects.find(p => p.title.toLowerCase().includes('família') || p.title.toLowerCase().includes('familia'));
  const pRima = projects.find(p => p.title.toLowerCase().includes('rima'));

  const knownIds = [pMovimento?.id, pDigital?.id, pFamilia?.id, pRima?.id].filter(Boolean);
  const otherProjects = projects.filter(p => !knownIds.includes(p.id));

  const getImg = (p: any, fallback: string) => {
    if (!p.image_url || p.image_url === '/hero.png' || p.image_url === '/hero_instituto_mcs.png') return fallback;
    return p.image_url;
  };

  const renderProgramDetails = (p: any, fallbackDetails: { periodo?: string; dias?: string; horarios?: string; publico?: string; apoio?: string }) => {
    const loc = p?.location || 'Polo UAB Alto Paraíso de Goiás';
    const per = p?.periodo || fallbackDetails.periodo || 'Agosto a Dezembro';
    const dias = p?.dias || fallbackDetails.dias || 'Terças e Quintas-feiras';
    const hor = p?.horarios || fallbackDetails.horarios || 'Manhã (09h às 10h) | Tarde (15h às 16h)';
    const pub = p?.publico || fallbackDetails.publico || 'Crianças assistidas pela rede';
    const apo = p?.apoio || fallbackDetails.apoio || 'Sec. de Assistência Social / Sec. de Educação';

    return (
      <div className="bg-gray-50/80 rounded-2xl p-6 border border-gray-100 mb-8 backdrop-blur-sm">
        <h3 className="font-medium text-base text-carbono mb-3 tracking-wide">Detalhes do Programa</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 font-normal">
          <div>
            <p className="mb-2"><strong className="font-medium text-carbono">Local:</strong> {loc}</p>
            <p className="mb-2"><strong className="font-medium text-carbono">Período:</strong> {per}</p>
            <p className="mb-2"><strong className="font-medium text-carbono">Dias:</strong> {dias}</p>
          </div>
          <div>
            <p className="mb-2"><strong className="font-medium text-carbono">Horários:</strong> {hor}</p>
            <p className="mb-2"><strong className="font-medium text-carbono">Público:</strong> {pub}</p>
            <p className="mb-2"><strong className="font-medium text-carbono">Apoio:</strong> {apo}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-marfim min-h-screen pt-24 pb-20 font-sans">
      {/* Hero Banner — Com texto em destaque sobre a imagem do mural */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 mb-12">
        <div className="relative rounded-[2.5rem] overflow-hidden bg-[#0c0f17] text-marfim flex items-center min-h-[360px] lg:min-h-[420px] shadow-2xl border border-gray-800 group">
          {/* Background Image across entire banner */}
          <div className="absolute inset-0 z-0">
            <img 
              src="/hero_projetos.jpg" 
              alt="Jovens pintando mural do Instituto MCS" 
              className="w-full h-full object-cover object-[center_30%] transform group-hover:scale-105 transition-transform duration-1000" 
            />
            {/* Elegant dark gradient so text is crisp and readable */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0c0f17] via-[#0c0f17]/85 sm:via-[#0c0f17]/70 to-[#0c0f17]/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f17]/90 via-transparent to-transparent" />
          </div>

          {/* Hero Content Overlay */}
          <div className="relative z-10 p-8 sm:p-12 lg:p-16 max-w-2xl">
            <span className="text-dourado font-bold tracking-widest text-xs uppercase mb-3 block flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-dourado animate-pulse"></span>
              Nossos Projetos —
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-tight mb-6 text-white drop-shadow-md">
              Iniciativas que transformam realidades.
            </h1>
            <p className="text-gray-200 text-base sm:text-lg leading-relaxed max-w-xl font-normal drop-shadow">
              Conheça os projetos apoiados e realizados pelo Instituto MCS. Explore as causas que constroem um futuro mais justo e consciente no nosso território.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        
        {/* Project 4: Conexão Rima */}
        {pRima && (
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col lg:flex-row-reverse mb-12">
            <div className="lg:w-5/12 relative min-h-[360px] sm:min-h-[440px] lg:min-h-[560px] bg-slate-900 overflow-hidden">
              <img 
                src={getImg(pRima, "/projeto_rima.png")} 
                alt={pRima.title} 
                className="w-full h-full object-cover object-[center_25%] transform hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
              <div className={`absolute top-6 right-6 z-20 px-4 py-1.5 text-xs font-semibold tracking-wider rounded-full border shadow-md backdrop-blur-md ${
                pRima.active === 1 ? 'bg-green-100/90 text-green-800 border-green-200' : 'bg-gray-100/90 text-gray-600 border-gray-200'
              }`}>
                {pRima.active === 1 ? '🟢 PROJETO ATIVO' : '⚪ EM BREVE'}
              </div>
            </div>
            
            <div className="lg:w-7/12 p-8 lg:p-12 flex flex-col justify-between">
              <div>
                <h2 className="font-serif text-3xl lg:text-4xl font-normal text-carbono mb-4 leading-tight">
                  Contraturno Conexão Rima
                </h2>
                <p className="text-gray-600 text-lg mb-8 leading-relaxed font-normal">
                  <strong className="font-medium text-carbono">Linguagem, Respeito e Expressão Cultural.</strong> Uma iniciativa focada no desenvolvimento psicossocial, cidadania ativa e comunicação de forma criativa e acolhedora para crianças e jovens da comunidade.
                </p>

                <h3 className="font-medium text-xl text-carbono mb-4 tracking-wide">Benefícios e Aprendizados</h3>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex gap-4">
                    <span className="text-dourado text-xl mt-1">📚</span>
                    <div>
                      <strong className="text-carbono font-medium block mb-1">Comunicação e Expressão</strong>
                      <span className="text-gray-600 text-sm font-normal">Melhora da leitura, escrita e comunicação oral. Desenvolvimento da criatividade e expressão corporal.</span>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-dourado text-xl mt-1">🌟</span>
                    <div>
                      <strong className="text-carbono font-medium block mb-1">Protagonismo e Confiança</strong>
                      <span className="text-gray-600 text-sm font-normal">Fortalecimento da autoestima e da confiança através do protagonismo juvenil.</span>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-dourado text-xl mt-1">🤝</span>
                    <div>
                      <strong className="text-carbono font-medium block mb-1">Respeito e Cooperação</strong>
                      <span className="text-gray-600 text-sm font-normal">Respeito e cooperação através da comunicação não violenta. Valorização da cultura brasileira, indígena, afro-brasileira e quilombola.</span>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-dourado text-xl mt-1">🌿</span>
                    <div>
                      <strong className="text-carbono font-medium block mb-1">Consciência Ambiental</strong>
                      <span className="text-gray-600 text-sm font-normal">Conscientização ambiental sobre a importância das águas e do cerrado.</span>
                    </div>
                  </li>
                </ul>

                {renderProgramDetails(pRima, {
                  periodo: 'Agosto a Dezembro',
                  dias: 'Terças e Quintas-feiras',
                  horarios: 'Manhã (09h às 10h) | Tarde (15h às 16h)',
                  publico: 'Crianças assistidas pela rede (Foco: 4º e 5º ano, Escolas Ana Aguiar e Zeca de Faria)',
                  apoio: 'Sec. de Assistência Social / Sec. de Educação'
                })}

                <p className="text-carbono font-normal text-lg mb-8 italic border-l-4 border-dourado pl-4 py-2">
                  Seu filho vai aprender a usar as palavras para construir conhecimento, respeito e confiança.
                </p>
              </div>

              {pRima.active === 1 && (
                <Link to={`/pre-cadastro?projeto=${pRima.id}`} className="bg-carbono text-marfim font-medium py-3.5 px-8 rounded-full hover:bg-gray-800 transition-colors inline-flex items-center gap-2 text-sm tracking-wider uppercase shadow-lg self-start">
                  Garanta Vaga do Seu Filho
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Project 1: MCS em Movimento */}
        {pMovimento && (
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col lg:flex-row mb-12">
            <div className="lg:w-5/12 relative min-h-[360px] sm:min-h-[440px] lg:min-h-[560px] bg-slate-900 overflow-hidden">
              <img 
                src={getImg(pMovimento, "/projeto_movimento.png")} 
                alt={pMovimento.title} 
                className="w-full h-full object-cover object-[center_25%] transform hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
              <div className={`absolute top-6 left-6 z-20 px-4 py-1.5 text-xs font-semibold tracking-wider rounded-full border shadow-md backdrop-blur-md ${
                pMovimento.active === 1 ? 'bg-green-100/90 text-green-800 border-green-200' : 'bg-gray-100/90 text-gray-600 border-gray-200'
              }`}>
                {pMovimento.active === 1 ? '🟢 PROJETO ATIVO' : '⚪ EM BREVE'}
              </div>
            </div>
            
            <div className="lg:w-7/12 p-8 lg:p-12 flex flex-col justify-between">
              <div>
                <h2 className="font-serif text-3xl lg:text-4xl font-normal text-carbono mb-4 leading-tight">
                  {pMovimento.title}
                </h2>
                <p className="text-gray-600 text-lg mb-8 leading-relaxed font-normal whitespace-pre-line">
                  {pMovimento.description || 'Uma iniciativa transformadora de assistência continuada e desenvolvimento integral para crianças e jovens da comunidade.'}
                </p>

                <h3 className="font-medium text-xl text-carbono mb-4 tracking-wide">Por que o MCS em Movimento é essencial?</h3>
                <p className="text-gray-600 mb-6 leading-relaxed font-normal">
                  Mais do que uma atividade física, o MCS em Movimento é um ambiente de desenvolvimento integral. Aqui, cada criança e jovem é incentivado a desenvolver competências para a vida toda:
                </p>

                <ul className="space-y-4 mb-8">
                  <li className="flex gap-4">
                    <span className="text-dourado text-xl mt-1">⚽</span>
                    <div>
                      <strong className="text-carbono font-medium block mb-1">Saúde e Vitalidade</strong>
                      <span className="text-gray-600 text-sm font-normal">Focamos na melhoria do condicionamento físico, da coordenação motora e da consciência corporal, garantindo uma base sólida para o bem-estar.</span>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-dourado text-xl mt-1">🤸</span>
                    <div>
                      <strong className="text-carbono font-medium block mb-1">Protagonismo e Confiança</strong>
                      <span className="text-gray-600 text-sm font-normal">Através da prática de Danças Urbanas e Capoeira, seu filho fortalecerá a autoestima, a disciplina e a autoconfiança, assumindo seu lugar como protagonista de sua própria história.</span>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-dourado text-xl mt-1">🤝</span>
                    <div>
                      <strong className="text-carbono font-medium block mb-1">Valores que Transformam</strong>
                      <span className="text-gray-600 text-sm font-normal font-normal">Promovemos o respeito mútuo e a coletividade, ensinando os jovens a trabalhar em equipe, valorizar a união e superar desafios juntos.</span>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-dourado text-xl mt-1">🌱</span>
                    <div>
                      <strong className="text-carbono font-medium block mb-1">Consciência e Identidade</strong>
                      <span className="text-gray-600 text-sm font-normal">Conectamos os alunos com suas raízes através da valorização da cultura corporal, da ancestralidade e das tradições do nosso Cerrado.</span>
                    </div>
                  </li>
                </ul>

                {renderProgramDetails(pMovimento, {
                  periodo: 'Anual',
                  dias: 'Encontros semanais estruturados de convivência',
                  horarios: 'Contraturno Escolar',
                  publico: 'Crianças e Jovens da comunidade',
                  apoio: 'Polos de Assistência e Cultura de Alto Paraíso de Goiás'
                })}

                <p className="text-carbono font-normal text-lg mb-8 italic border-l-4 border-dourado pl-4 py-2">
                  Seu filho vai aprender a usar o corpo, o ritmo e a disciplina para construir um futuro com mais saúde, respeito e confiança.
                </p>
              </div>

              {pMovimento.active === 1 && (
                <Link to={`/pre-cadastro?projeto=${pMovimento.id}`} className="bg-carbono text-marfim font-medium py-3.5 px-8 rounded-full hover:bg-gray-800 transition-colors inline-flex items-center gap-2 text-sm tracking-wider uppercase shadow-lg self-start">
                  Garanta Vaga do Seu Filho
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Project 2: MCS Digital */}
        {pDigital && (
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col lg:flex-row-reverse mb-12">
            <div className="lg:w-5/12 relative min-h-[360px] sm:min-h-[440px] lg:min-h-[560px] bg-slate-900 overflow-hidden">
              <img 
                src={getImg(pDigital, "/projeto_digital.png")} 
                alt={pDigital.title} 
                className="w-full h-full object-cover object-[center_25%] transform hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
              <div className={`absolute top-6 right-6 z-20 px-4 py-1.5 text-xs font-semibold tracking-wider rounded-full border shadow-md backdrop-blur-md ${
                pDigital.active === 1 ? 'bg-green-100/90 text-green-800 border-green-200' : 'bg-gray-100/90 text-gray-600 border-gray-200'
              }`}>
                {pDigital.active === 1 ? '🟢 PROJETO ATIVO' : '⚪ EM BREVE'}
              </div>
            </div>
            
            <div className="lg:w-7/12 p-8 lg:p-12 flex flex-col justify-between">
              <div>
                <h2 className="font-serif text-3xl lg:text-4xl font-normal text-carbono mb-4 leading-tight">
                  {pDigital.title}
                </h2>
                <p className="text-gray-600 text-lg mb-8 leading-relaxed font-normal whitespace-pre-line">
                  {pDigital.description || 'Uma iniciativa pioneira para democratizar o acesso à tecnologia e formar a nova geração de criadores e empreendedores.'}
                </p>

                <h3 className="font-medium text-xl text-carbono mb-4 tracking-wide">Por que o MCS Digital é essencial?</h3>
                <p className="text-gray-600 mb-6 leading-relaxed font-normal">
                  Em um mundo em rápida transformação, o acesso à tecnologia não pode ser um privilégio. O MCS Digital prepara os jovens para não apenas consumirem, mas pensarem e produzirem com ferramentas digitais:
                </p>

                <ul className="space-y-4 mb-8">
                  <li className="flex gap-4">
                    <span className="text-dourado text-xl mt-1">💻</span>
                    <div>
                      <strong className="text-carbono font-medium block mb-1">Letramento e Inovação</strong>
                      <span className="text-gray-600 text-sm font-normal">Introduzimos conceitos de Inteligência Artificial, pensamento computacional e prompt engineering de forma lúdica e prática para crianças e jovens.</span>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-dourado text-xl mt-1">🚀</span>
                    <div>
                      <strong className="text-carbono font-medium block mb-1">Protagonismo e Empreendedorismo</strong>
                      <span className="text-gray-600 text-sm font-normal">Através de trilhas divididas por idade (Exploradores Digitais e Criadores do Futuro), seu filho aprende a criar conteúdos reais, como guias turísticos, podcasts e bancos de imagens.</span>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-dourado text-xl mt-1">🛡️</span>
                    <div>
                      <strong className="text-carbono font-medium block mb-1">Valores e Ética Digital</strong>
                      <span className="text-gray-600 text-sm font-normal">Promovemos o pensamento crítico e o uso responsável da tecnologia, combatendo fake news e ensinando sobre privacidade e cidadania digital.</span>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-dourado text-xl mt-1">📍</span>
                    <div>
                      <strong className="text-carbono font-medium block mb-1">Conexão com o Território</strong>
                      <span className="text-gray-600 text-sm font-normal">Unimos a tecnologia à realidade local, aplicando o aprendizado ao turismo, à gastronomia e à valorização da nossa Chapada dos Veadeiros.</span>
                    </div>
                  </li>
                </ul>

                {renderProgramDetails(pDigital, {
                  periodo: 'Ciclos contínuos de aprendizado prático',
                  dias: 'Turmas organizadas por faixa etária',
                  horarios: 'Horários dos polos de atendimento',
                  publico: 'Estudantes e jovens da comunidade',
                  apoio: 'Polos de Atendimento MCS Digital'
                })}

                <p className="text-carbono font-normal text-lg mb-8 italic border-l-4 border-dourado pl-4 py-2">
                  Seu filho vai aprender a usar a Inteligência Artificial e a inovação para construir conhecimento, autonomia e novas oportunidades profissionais.
                </p>
              </div>

              {pDigital.active === 1 && (
                <Link to={`/pre-cadastro?projeto=${pDigital.id}`} className="bg-carbono text-marfim font-medium py-3.5 px-8 rounded-full hover:bg-gray-800 transition-colors inline-flex items-center gap-2 text-sm tracking-wider uppercase shadow-lg self-start">
                  Garanta Vaga do Seu Filho
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Project 3: MCS Família */}
        {pFamilia && (
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col lg:flex-row mb-12">
            <div className="lg:w-5/12 relative min-h-[360px] sm:min-h-[440px] lg:min-h-[560px] bg-slate-900 overflow-hidden">
              <img 
                src={getImg(pFamilia, "/projeto_familia.png")} 
                alt={pFamilia.title} 
                className="w-full h-full object-cover object-[center_25%] transform hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
              <div className={`absolute top-6 left-6 z-20 px-4 py-1.5 text-xs font-semibold tracking-wider rounded-full border shadow-md backdrop-blur-md ${
                pFamilia.active === 1 ? 'bg-green-100/90 text-green-800 border-green-200' : 'bg-gray-100/90 text-gray-600 border-gray-200'
              }`}>
                {pFamilia.active === 1 ? '🟢 PROJETO ATIVO' : '⚪ EM BREVE'}
              </div>
            </div>
            
            <div className="lg:w-7/12 p-8 lg:p-12 flex flex-col justify-between">
              <div>
                <h2 className="font-serif text-3xl lg:text-4xl font-normal text-carbono mb-4 leading-tight">
                  {pFamilia.title}
                </h2>
                <p className="text-gray-600 text-lg mb-8 leading-relaxed font-normal whitespace-pre-line">
                  {pFamilia.description || 'A base de sustentação do nosso ecossistema de desenvolvimento.'}
                </p>

                <h3 className="font-medium text-xl text-carbono mb-4 tracking-wide">Por que o MCS Família é essencial?</h3>
                <p className="text-gray-600 mb-6 leading-relaxed font-normal">
                  Acreditamos que o desenvolvimento de uma criança ou jovem só é completo quando a sua rede de apoio familiar também é fortalecida. O MCS Família atua lado a lado com os outros projetos do Instituto para garantir:
                </p>

                <ul className="space-y-4 mb-8">
                  <li className="flex gap-4">
                    <span className="text-dourado text-xl mt-1">⚖️</span>
                    <div>
                      <strong className="text-carbono font-medium block mb-1">Segurança e Cuidado</strong>
                      <span className="text-gray-600 text-sm font-normal">Oferecemos atendimento psicossocial e orientação jurídica estruturada para dar tranquilidade e amparo aos lares.</span>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-dourado text-xl mt-1">💼</span>
                    <div>
                      <strong className="text-carbono font-medium block mb-1">Geração de Renda e Autonomia</strong>
                      <span className="text-gray-600 text-sm font-normal">Capacitamos pais, responsáveis e jovens por meio de trilhas profissionalizantes alinhadas às reais demandas das cadeias produtivas locais, como o turismo e a economia criativa.</span>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-dourado text-xl mt-1">👪</span>
                    <div>
                      <strong className="text-carbono font-medium block mb-1">Integração Comunitária</strong>
                      <span className="text-gray-600 text-sm font-normal">Criamos pontes entre a família e as inovações tecnológicas e culturais oferecidas pelo Instituto, unindo gerações em prol do bem comum.</span>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-dourado text-xl mt-1">🏡</span>
                    <div>
                      <strong className="text-carbono font-medium block mb-1">Dignidade e Bem-Estar</strong>
                      <span className="text-gray-600 text-sm font-normal">Promovemos um ambiente onde o crescimento econômico e turístico de Alto Paraíso se converte em qualidade de vida concreta para cada família.</span>
                    </div>
                  </li>
                </ul>

                {renderProgramDetails(pFamilia, {
                  periodo: 'Acompanhamento contínuo',
                  dias: 'Trilhas formativas e mentorias',
                  horarios: 'Horário comercial',
                  publico: 'Pais, responsáveis e comunidade local',
                  apoio: 'Rede multidisciplinar de suporte familiar'
                })}

                <p className="text-carbono font-normal text-lg mb-8 italic border-l-4 border-dourado pl-4 py-2">
                  Sua família vai encontrar o suporte necessário para transformar desafios em oportunidades e construir um futuro mais próspero.
                </p>
              </div>

              {pFamilia.active === 1 && (
                <Link to={`/pre-cadastro?projeto=${pFamilia.id}`} className="bg-carbono text-marfim font-medium py-3.5 px-8 rounded-full hover:bg-gray-800 transition-colors inline-flex items-center gap-2 text-sm tracking-wider uppercase shadow-lg self-start">
                  Garanta Vaga do Seu Filho
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Outros Projetos Cadastrados no Dashboard */}
        {otherProjects.length > 0 && (
          <>
            <div className="my-16 flex items-center gap-6">
              <div className="h-px bg-gray-200 flex-1"></div>
              <h2 className="font-serif text-3xl text-carbono">Mais Projetos do Instituto</h2>
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {otherProjects.map(p => (
                <div key={p.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="relative h-64 bg-gray-200 overflow-hidden">
                    <img src={p.image_url || '/hero_instituto_mcs.png'} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className={`absolute top-4 left-4 z-20 px-3 py-1 text-[10px] font-bold tracking-wider rounded-full border shadow-sm uppercase backdrop-blur-sm ${
                      p.active === 1 ? 'bg-green-100/90 text-green-800 border-green-200' : 'bg-gray-100/90 text-gray-600 border-gray-200'
                    }`}>
                      {p.active === 1 ? '🟢 ATIVO' : '⚪ EM BREVE'}
                    </div>
                  </div>
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="text-dourado text-sm font-bold tracking-widest uppercase mb-2">{p.area}</div>
                    <h3 className="font-serif text-2xl text-carbono mb-4 leading-tight group-hover:text-dourado transition-colors">{p.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-1 whitespace-pre-line line-clamp-4">
                      {p.description}
                    </p>

                    {renderProgramDetails(p, {
                      periodo: 'A definir',
                      dias: 'A definir',
                      horarios: 'A definir',
                      publico: 'Comunidade geral',
                      apoio: 'Instituto MCS'
                    })}

                    {p.active === 1 && (
                      <Link to={`/pre-cadastro?projeto=${p.id}`} className="inline-flex items-center gap-2 text-carbono font-bold text-sm uppercase tracking-wide hover:text-dourado transition-colors mt-auto">
                        Garanta Vaga do Seu Filho <span className="text-xl">→</span>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
