import { Link } from 'react-router-dom';

export default function RifaPage() {
  return (
    <div className="bg-marfim min-h-screen pt-24 pb-20">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        
        {/* Hero Banner */}
        <div className="relative rounded-[2rem] overflow-hidden bg-dourado text-carbono flex flex-col md:flex-row items-center min-h-[400px] mb-12 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-dourado via-dourado to-yellow-300"></div>
          <div className="relative z-10 p-10 lg:p-16 md:w-2/3">
            <span className="font-bold tracking-widest text-xs uppercase mb-4 block opacity-80">Apoie a Nossa Causa —</span>
            <h1 className="font-serif text-5xl lg:text-7xl leading-tight mb-6">
              Rifa Solidária MCS
            </h1>
            <p className="text-carbono text-lg lg:text-xl font-medium leading-relaxed max-w-xl">
              Participe da nossa rifa e ajude a financiar nossos projetos de educação, esporte, cultura e tecnologia para as crianças e jovens da Chapada dos Veadeiros.
            </p>
          </div>
          <div className="relative z-10 p-10 lg:p-16 md:w-1/3 flex justify-center md:justify-end">
            <div className="bg-white/20 backdrop-blur-md rounded-full p-8 border border-white/30 shadow-2xl animate-pulse">
              <svg className="w-24 h-24 text-carbono" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <span className="text-4xl mb-6">🎁</span>
          <h2 className="font-serif text-3xl lg:text-4xl text-carbono mb-4">Prêmios Especiais!</h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl">
            Estamos organizando itens incríveis que serão sorteados em nossa rifa. Os prêmios serão definidos e divulgados em breve. Fique atento às nossas atualizações!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-12">
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <div className="text-dourado text-3xl mb-3">1</div>
              <h4 className="font-bold text-carbono mb-2">Compre seu bilhete</h4>
              <p className="text-sm text-gray-500">Em breve disponibilizaremos a plataforma para aquisição online dos números da sorte.</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <div className="text-dourado text-3xl mb-3">2</div>
              <h4 className="font-bold text-carbono mb-2">Apoie os projetos</h4>
              <p className="text-sm text-gray-500">100% da arrecadação será destinada à manutenção e ampliação dos projetos do Instituto.</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <div className="text-dourado text-3xl mb-3">3</div>
              <h4 className="font-bold text-carbono mb-2">Acompanhe o sorteio</h4>
              <p className="text-sm text-gray-500">O sorteio será transmitido ao vivo pelas nossas redes sociais. Boa sorte!</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-left">
              <h3 className="font-bold text-yellow-800 text-xl mb-1">Quer ser o primeiro a saber?</h3>
              <p className="text-yellow-700 text-sm">Deixe uma mensagem e avisaremos quando as vendas abrirem.</p>
            </div>
            <Link to="/contato" className="bg-yellow-600 text-white font-bold py-3 px-8 rounded-full hover:bg-yellow-700 transition-colors whitespace-nowrap shadow-md">
              TENHO INTERESSE
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
