import { Link } from 'react-router-dom';

export default function QuemSomos() {
  return (
    <div className="bg-marfim text-carbono min-h-screen">
      {/* Hero Section */}
      <section className="pt-24 lg:pt-32 pb-12 lg:pb-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="text-center lg:text-left">
            <span className="text-dourado font-semibold tracking-wider text-[10px] md:text-xs uppercase mb-4 block">
              NOSSA ESSÊNCIA
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-tight mb-6 lg:mb-8">
              Nossa essência é o encontro
            </h1>
            <div className="space-y-4 md:space-y-6 text-base md:text-lg text-gray-700 leading-relaxed text-left">
              <p>
                Nascemos em Alto Paraíso de Goiás para ser o elo entre a tradição que nos fundamenta e a inovação que nos impulsiona.
              </p>
              <p>
                Mais do que um instituto, somos um território de possibilidades onde transformamos emoção em expressão e conflito em consciência.
              </p>
              <p className="font-bold text-carbono">
                Acreditamos que a cultura e a tecnologia são motores da mudança.
              </p>
            </div>
            <div className="w-12 h-[1px] bg-dourado mt-8 lg:mt-10 mx-auto lg:mx-0"></div>
          </div>
          
          <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[4/3]">
            <img 
              src="/quemsomos.png" 
              alt="Jovens participando de atividades do Instituto MCS" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Ecossistema de Atuação */}
      <section className="py-12 lg:py-20 bg-gray-50 border-t border-gray-200">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl">Nosso Ecossistema</h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Por isso, nossa atuação é estruturada em um ecossistema vivo, multisetorial e integrado:
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-yellow-50 text-dourado flex items-center justify-center mb-6 text-xl">🎤</div>
              <h3 className="font-bold mb-3 text-lg">Corpo, Ritmo e Tradição (Conexão Rima)</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Valorizamos a ancestralidade e a cultura urbana, utilizando o movimento, a rima e a arte como linguagens para a preservação de nossa identidade e a conexão com a Chapada dos Veadeiros.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-yellow-50 text-dourado flex items-center justify-center mb-6 text-xl">⚽</div>
              <h3 className="font-bold mb-3 text-lg">Esporte e Bem-Estar (MCS em Movimento)</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Promovemos a saúde física e mental, incentivando a integração e a disciplina através da prática esportiva.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-yellow-50 text-dourado flex items-center justify-center mb-6 text-xl">💻</div>
              <h3 className="font-bold mb-3 text-lg">Tecnologia e Inovação (MCS Digital)</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Democratizamos o acesso à Inteligência Artificial e às ferramentas digitais para crianças e jovens, formando criadores, empreendedores e protagonistas da economia digital no Cerrado.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-yellow-50 text-dourado flex items-center justify-center mb-6 text-xl">🤝</div>
              <h3 className="font-bold mb-3 text-lg">Rede de Cuidado, Cidadania e Renda (MCS Família)</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Acreditamos que a dignidade humana é um pilar estruturante. Oferecemos trilhas profissionalizantes, assistência e capacitação que abrem caminhos reais para a autonomia financeira.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Por que o MCS */}
      <section className="py-12 lg:py-20 border-t border-gray-200">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <span className="text-dourado font-semibold tracking-wider text-[10px] md:text-xs uppercase mb-2 block">
              NOSSA FORÇA
            </span>
            <h2 className="font-serif text-3xl mb-6">Por que o MCS é a sua melhor parceria?</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Porque não acreditamos em soluções isoladas. O Instituto MCS entende que a transformação social acontece na intersecção entre o desenvolvimento humano, a sustentabilidade ambiental, a economia criativa e o letramento digital.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              Somos a ponte que une o saber comunitário a oportunidades reais de futuro, garantindo que a inovação e o bem-estar caminhem juntos em nosso território.
            </p>
          </div>
          
          <div className="bg-carbono text-marfim p-8 lg:p-12 rounded-3xl shadow-2xl relative">
            <div className="absolute top-8 left-8 text-dourado/20 text-6xl font-serif">"</div>
            <div className="relative z-10">
              <p className="font-serif text-2xl md:text-3xl leading-relaxed text-dourado mb-6">
                Mais que um projeto, somos um movimento.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed">
                Conectamos cultura, esporte, tecnologia e oportunidades para transformar o presente e construir o futuro de Alto Paraíso.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
