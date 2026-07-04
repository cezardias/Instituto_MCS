import { Link } from 'react-router-dom';

export default function QuemSomos() {
  return (
    <div className="bg-marfim text-carbono min-h-screen">
      {/* Hero Section */}
      <section className="pt-24 lg:pt-32 pb-12 lg:pb-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="text-center lg:text-left">
            <span className="text-dourado font-semibold tracking-wider text-[10px] md:text-xs uppercase mb-4 block">
              INSTITUTO MCS: VOZ CONSCIENTE
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-tight mb-6 lg:mb-8">
              Transformando Emoção em Expressão
            </h1>
            <div className="space-y-4 md:space-y-6 text-base md:text-lg text-gray-700 leading-relaxed text-left">
              <p>
                O Instituto Movimento de Cultura Social (MCS), ou simplesmente <strong>Voz Consciente</strong>, não é uma instituição comum. Nascemos da convicção de que a periferia e as ruas são espaços de potência intelectual e artística.
              </p>
              <p>
                Com sede em Alto Paraíso de Goiás, operamos na intersecção entre a cultura urbana e a tecnologia social para redefinir o que significa aprender e se desenvolver.
              </p>
            </div>
            <div className="w-12 h-[1px] bg-dourado mt-8 lg:mt-10 mx-auto lg:mx-0"></div>
          </div>
          
          <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[4/3]">
            <img 
              src="/quemsomos.png" 
              alt="Jovens participando de atividades culturais" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Nossa Missão e Voz Consciente */}
      <section className="py-12 lg:py-20 border-t border-gray-200">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16">
          <div>
            <span className="text-dourado font-semibold tracking-wider text-[10px] md:text-xs uppercase mb-2 block">
              NOSSO PROPÓSITO
            </span>
            <h2 className="font-serif text-3xl mb-6">Nossa Missão</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Não estamos aqui apenas para ensinar; estamos aqui para <strong>transformar emoção em expressão e conflito em consciência</strong>. Acreditamos que o pensamento crítico, a inteligência emocional e a profissionalização são as chaves para que jovens e adultos ocupem seu lugar no mundo com autonomia e dignidade.
            </p>
          </div>
          <div>
            <span className="text-dourado font-semibold tracking-wider text-[10px] md:text-xs uppercase mb-2 block">
              NOSSA IDENTIDADE
            </span>
            <h2 className="font-serif text-3xl mb-6">Por que "Voz Consciente"?</h2>
            <p className="text-gray-600 leading-relaxed">
              Porque acreditamos que a voz de cada jovem é um instrumento de mudança. Através da cultura urbana, das rimas, do grafite e do audiovisual, combatemos o racismo estrutural, promovemos a cultura de paz e defendemos a equidade. 
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              Não apenas observamos o território; nós o regeneramos. Seja integrando a preservação do Cerrado e da Chapada dos Veadeiros em nossa formação cidadã, seja criando pontes entre a comunidade e novas oportunidades de trabalho, o MCS é a ferramenta para quem quer construir um futuro autêntico.
            </p>
          </div>
        </div>
      </section>

      {/* O Que nos Move */}
      <section className="py-12 lg:py-20 bg-gray-50 border-t border-gray-200">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl">O Que nos Move</h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">Somos uma associação sem fins lucrativos que respira cultura e vive de resultados sociais concretos. Aqui, a rima é o começo, mas a transformação é o nosso objetivo final.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-yellow-50 text-dourado flex items-center justify-center mb-6 text-xl">🎤</div>
              <h3 className="font-bold mb-3 text-lg">Protagonismo na Prática</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Não ditamos caminhos; mediamos descobertas. Nossos jovens são os MCs, os jurados e os produtores da sua própria realidade.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-yellow-50 text-dourado flex items-center justify-center mb-6 text-xl">🧠</div>
              <h3 className="font-bold mb-3 text-lg">Tecnologia Social</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Nossa metodologia, o <strong>Conexão Rima</strong>, é a nossa prova de que é possível unir rigor pedagógico com a energia das batalhas de rap, transformando a escola em um lugar de pertencimento, não de exclusão.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-yellow-50 text-dourado flex items-center justify-center mb-6 text-xl">🌱</div>
              <h3 className="font-bold mb-3 text-lg">Território e Sustentabilidade</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Valorizamos nossa identidade local. Unimos a arte urbana com a preservação ambiental, entendendo que cuidar do nosso chão é um ato político e educativo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* O Projeto: Conexão Rima */}
      <section className="py-12 lg:py-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-dourado font-semibold tracking-wider text-[10px] md:text-xs uppercase mb-2 block">
                DESTAQUE
              </span>
              <h2 className="font-serif text-3xl md:text-4xl mb-6">O Projeto: Conexão Rima</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                O Conexão Rima é um projeto pedagógico interdisciplinar, desenvolvido e gerido pelo Instituto MCS, que utiliza o Rap — manifestação cultural urbana, periférica e de matriz africana — como linguagem central para o desenvolvimento de competências curriculares e socioemocionais.
              </p>
              
              <h3 className="font-bold text-xl mb-3 mt-8">Por que o Rap?</h3>
              <p className="text-gray-600 leading-relaxed">
                Acreditamos que, quando o aluno se reconhece na cultura trabalhada, ele aprende com mais significado. O Rap articula oralidade, escrita, ritmo, argumentação e identidade, conectando os conteúdos escolares à realidade viva dos estudantes.
              </p>
            </div>
            <div className="bg-carbono text-marfim p-8 lg:p-12 rounded-3xl shadow-2xl">
              <h3 className="font-serif text-2xl mb-6 text-dourado">Como Funciona:</h3>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <span className="text-dourado font-bold mt-1">✓</span>
                  <div>
                    <strong className="block mb-1">Protagonismo Juvenil</strong>
                    <span className="text-sm text-gray-300">Os alunos assumem papéis de MCs, jurados e produção, enquanto o professor atua como mediador.</span>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="text-dourado font-bold mt-1">✓</span>
                  <div>
                    <strong className="block mb-1">Metodologia de 4 Blocos</strong>
                    <span className="text-sm text-gray-300">O projeto é estruturado em blocos que integram pesquisa histórica, oficina de escrita, laboratório de ritmo e a "Arena Educativa" (batalhas de rima).</span>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="text-dourado font-bold mt-1">✓</span>
                  <div>
                    <strong className="block mb-1">Interdisciplinaridade</strong>
                    <span className="text-sm text-gray-300">Articula Língua Portuguesa (produção textual, ortografia), Artes & Cultura (história do Hip-Hop, performance) e competências socioemocionais (comunicação não violenta, empatia e combate ao racismo).</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-16 bg-yellow-50 border border-yellow-100 p-8 lg:p-10 rounded-2xl">
            <h3 className="font-serif text-2xl mb-8 text-center">Impactos Esperados do Conexão Rima</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-4">📚</div>
                <strong className="block mb-2 text-carbono">Estudantes</strong>
                <p className="text-sm text-gray-600">Melhoria na comunicação, autoestima e identidade cultural.</p>
              </div>
              <div className="text-center border-t md:border-t-0 md:border-l border-gray-200 pt-6 md:pt-0">
                <div className="text-4xl mb-4">🏫</div>
                <strong className="block mb-2 text-carbono">Clima Escolar</strong>
                <p className="text-sm text-gray-600">Redução de conflitos e bullying, promovendo um ambiente seguro e inclusivo.</p>
              </div>
              <div className="text-center border-t md:border-t-0 md:border-l border-gray-200 pt-6 md:pt-0">
                <div className="text-4xl mb-4">⚖️</div>
                <strong className="block mb-2 text-carbono">Institucional</strong>
                <p className="text-sm text-gray-600">Cumprimento ativo das Leis 10.639/03 e 11.645/08 (ensino de história e cultura afro-brasileira e indígena) e promoção da equidade.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Áreas de Atuação */}
      <section className="py-12 lg:py-20 bg-carbono text-marfim">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-dourado font-semibold tracking-wider text-[10px] md:text-xs uppercase mb-2 block">
              NOSSAS FRENTES
            </span>
            <h2 className="font-serif text-3xl md:text-4xl">Áreas de Atuação do Instituto</h2>
            <p className="mt-4 text-gray-300 max-w-2xl mx-auto">
              Além da metodologia Conexão Rima, o Instituto MCS atua em diversas frentes para promover o desenvolvimento humano integral.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 hover:border-dourado transition-colors">
              <strong className="text-dourado block mb-2 text-lg">Educação e Tecnologia Social</strong>
              <p className="text-sm text-gray-300 leading-relaxed">Fomento ao pensamento crítico e redução da evasão escolar.</p>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 hover:border-dourado transition-colors">
              <strong className="text-dourado block mb-2 text-lg">Sustentabilidade Socioambiental</strong>
              <p className="text-sm text-gray-300 leading-relaxed">Conscientização sobre a preservação do bioma Cerrado e da Chapada dos Veadeiros.</p>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 hover:border-dourado transition-colors">
              <strong className="text-dourado block mb-2 text-lg">Turismo Responsável</strong>
              <p className="text-sm text-gray-300 leading-relaxed">Apoio a roteiros e eventos que unem cultura urbana, memória local e geração de renda para jovens.</p>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 hover:border-dourado transition-colors">
              <strong className="text-dourado block mb-2 text-lg">Formação Profissional</strong>
              <p className="text-sm text-gray-300 leading-relaxed">Oferta de cursos e oficinas em áreas como produção cultural, audiovisual, comunicação e empreendedorismo.</p>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 hover:border-dourado transition-colors lg:col-span-2">
              <strong className="text-dourado block mb-2 text-lg">Atendimento Social</strong>
              <p className="text-sm text-gray-300 leading-relaxed">Rede de parcerias para viabilizar atendimentos nas áreas jurídica, odontológica e psicossocial para a comunidade.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
