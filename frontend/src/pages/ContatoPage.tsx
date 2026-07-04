import { Link } from 'react-router-dom'

export default function ContatoPage() {
  return (
    <div className="bg-marfim text-carbono min-h-screen">
      {/* ── Hero ──────────────────────────────────── */}
      <section className="pt-28 pb-16 border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
            <Link to="/" className="hover:text-dourado transition-colors">🏠</Link>
            <span>›</span>
            <span className="text-carbono font-semibold">Contato</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-dourado font-bold text-xs uppercase tracking-widest mb-4 block">
                FALE CONOSCO
              </span>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-tight mb-6">
                Como podemos ajudar?
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed max-w-lg">
                Seja para tirar dúvidas, propor parcerias ou conhecer mais sobre os nossos projetos, nossa equipe está pronta para conversar com você.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact Info & Form ──────────────────── */}
      <section className="py-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            
            {/* Informações de contato */}
            <div className="space-y-12">
              <div>
                <h3 className="font-serif text-3xl mb-8">Informações de Contato</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-dourado/10 text-dourado flex items-center justify-center text-2xl shrink-0">
                      📍
                    </div>
                    <div>
                      <h4 className="font-bold text-carbono">Sede Principal</h4>
                      <p className="text-gray-500 mt-1">Rua da Cultura, 123 - Centro<br/>São Paulo - SP, 01000-000</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-dourado/10 text-dourado flex items-center justify-center text-2xl shrink-0">
                      📞
                    </div>
                    <div>
                      <h4 className="font-bold text-carbono">Telefone</h4>
                      <p className="text-gray-500 mt-1">+55 (11) 99999-9999<br/>Seg a Sex, das 9h às 18h</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-dourado/10 text-dourado flex items-center justify-center text-2xl shrink-0">
                      ✉️
                    </div>
                    <div>
                      <h4 className="font-bold text-carbono">E-mail</h4>
                      <p className="text-gray-500 mt-1">contato@institutomcs.org.br<br/>parcerias@institutomcs.org.br</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Redes Sociais */}
              <div>
                <h4 className="font-bold text-carbono mb-4">Siga nossas redes</h4>
                <div className="flex gap-4">
                  {['📸 Instagram', '📘 Facebook', '💼 LinkedIn', '▶️ YouTube'].map(social => (
                    <a key={social} href="#" className="px-4 py-2 rounded-full border border-gray-200 text-sm font-semibold text-gray-600 hover:border-dourado hover:text-dourado transition-colors">
                      {social}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Formulário */}
            <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-gray-100 shadow-sm">
              <h3 className="font-serif text-2xl mb-2">Envie uma mensagem</h3>
              <p className="text-gray-500 mb-8 text-sm">Preencha o formulário abaixo e retornaremos o mais breve possível.</p>
              
              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Nome completo *</label>
                    <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-dourado focus:ring-1 focus:ring-dourado/30 transition-all" placeholder="Seu nome" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Telefone</label>
                    <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-dourado focus:ring-1 focus:ring-dourado/30 transition-all" placeholder="(00) 00000-0000" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">E-mail *</label>
                  <input type="email" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-dourado focus:ring-1 focus:ring-dourado/30 transition-all" placeholder="seu@email.com" />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Assunto *</label>
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-dourado focus:ring-1 focus:ring-dourado/30 transition-all">
                    <option>Dúvida Geral</option>
                    <option>Quero ser Voluntário</option>
                    <option>Parcerias e Patrocínios</option>
                    <option>Imprensa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Mensagem *</label>
                  <textarea rows={5} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-dourado focus:ring-1 focus:ring-dourado/30 transition-all resize-none" placeholder="Como podemos te ajudar?"></textarea>
                </div>

                <button className="w-full bg-carbono text-marfim py-4 rounded-full font-bold hover:bg-gray-800 transition-colors uppercase tracking-widest text-sm">
                  ENVIAR MENSAGEM
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* ── Mapa Placeholder ─────────────────────── */}
      <section className="h-96 bg-gray-200 w-full relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <span className="text-4xl">🗺️</span>
            <p className="text-gray-500 mt-2 font-semibold">Mapa de localização</p>
          </div>
        </div>
      </section>
    </div>
  )
}
