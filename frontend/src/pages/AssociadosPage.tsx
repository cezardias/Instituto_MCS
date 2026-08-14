import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function AssociadosPage() {
  const [dbAssociados, setDbAssociados] = useState<any[]>([])
  
  // Ficha de Associação Form State
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    cpf_cnpj: '',
    tipo: '',
    aceitou_termos: false
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  useEffect(() => {
    fetch('/api/associados?tenant_id=instituto-mcs')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Filtra apenas os ativos, exibidos no site e aprovados
          const aprovados = data.filter(a => a.active === 1 && a.exibir_site === 1 && a.status_aprovacao === 'aprovado')
          setDbAssociados(aprovados)
        }
      })
      .catch(err => console.error(err))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.aceitou_termos) {
      setMsg({ type: 'error', text: 'Você deve aceitar o estatuto e regulamento interno para continuar.' })
      return
    }
    setSaving(true)
    setMsg({ type: '', text: '' })
    
    try {
      const res = await fetch('/api/associados/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tenant_id: 'instituto-mcs' })
      })
      if (!res.ok) throw new Error('Falha ao enviar Ficha de Associação.')
      
      setMsg({ type: 'success', text: 'Sua ficha de associação foi enviada com sucesso! Ela passará por aprovação da diretoria.' })
      setForm({ name: '', email: '', phone: '', cpf_cnpj: '', tipo: '', aceitou_termos: false })
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message })
    }
    setSaving(false)
  }

  return (
    <div className="bg-marfim text-carbono min-h-screen">
      {/* ── Hero ──────────────────────────────────── */}
      <section className="pt-28 pb-16 border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
            <Link to="/" className="hover:text-dourado transition-colors">🏠</Link>
            <span>›</span>
            <span className="text-carbono font-semibold">Associados</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-dourado font-bold text-xs uppercase tracking-widest mb-4 block">
                REDE DE ASSOCIADOS
              </span>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-tight mb-6">
                Juntos transformamos realidades
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-lg">
                O Instituto MCS acredita no poder da união para multiplicar o impacto social. Cada associado é um elo fundamental na corrente que transforma vidas.
              </p>
              <a
                href="#seja-associado"
                className="inline-flex items-center gap-2 bg-dourado text-carbono px-8 py-4 rounded-full font-bold hover:bg-yellow-500 transition-colors"
              >
                SEJA UM ASSOCIADO
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            {/* Números */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { valor: dbAssociados.length.toString(), label: 'Associados Ativos' },
                { valor: '1', label: 'Município focado' },
                { valor: '+100', label: 'Famílias apoiadas' },
                { valor: '100%', label: 'Transparência' },
              ].map((n) => (
                <div key={n.label} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center hover:shadow-md transition-shadow">
                  <strong className="block font-serif text-4xl text-carbono mb-2">{n.valor}</strong>
                  <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">{n.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Associados Dinâmicos (Banco de Dados) ── */}
      {dbAssociados.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="text-dourado font-bold text-xs uppercase tracking-widest mb-3 block">REDE DE APOIO</span>
              <h2 className="font-serif text-3xl md:text-4xl">Nossos Associados</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {dbAssociados.map(a => (
                <div key={a.id} className="bg-gray-50 border border-gray-100 rounded-3xl p-6 flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-2 transition-all duration-300">
                  <div className="flex items-center justify-center mb-4 w-full">
                    {a.logo_url ? (
                      <img src={a.logo_url.startsWith('http') ? a.logo_url : `/api${a.logo_url}`} alt={a.name} className="w-20 h-20 rounded-full object-cover border-2 border-dourado/40 shadow-sm" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-2xl shadow-sm">
                        {a.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-carbono text-lg mb-1">{a.name}</h3>
                  <p className="text-xs text-dourado font-bold mb-4">{a.tipo}</p>
                  
                  <div className="mt-auto flex gap-3">
                    {a.website && (
                      <a href={a.website} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors" title="Website">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                      </a>
                    )}
                    {a.instagram && (
                      <a href={`https://instagram.com/${a.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center hover:bg-pink-100 transition-colors" title="Instagram">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Ficha de Associação ─────────────────── */}
      <section id="seja-associado" className="py-20 bg-carbono text-marfim">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <span className="text-dourado font-bold text-xs uppercase tracking-widest mb-4 block">FAÇA PARTE</span>
            <h2 className="font-serif text-4xl md:text-5xl mb-6">Seja um Associado do Instituto MCS</h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              Você pode fazer parte dessa rede de transformação social. Preencha a ficha de associação abaixo e junte-se a nós para construirmos um impacto ainda maior.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
            {[
              { titulo: 'Efetivos', descricao: 'Pessoas que participam da vida da instituição, com direito a voto.' },
              { titulo: 'Contribuintes', descricao: 'Fazem contribuições financeiras periódicas para apoiar o instituto.' },
              { titulo: 'Voluntários', descricao: 'Colaboram com atividades, podendo ou não ter direito a voto.' },
              { titulo: 'Beneméritos', descricao: 'Pessoas reconhecidas por relevantes serviços ou doações.' },
            ].map((item) => (
              <div key={item.titulo} className="bg-white/10 rounded-2xl p-6 text-center hover:bg-white/15 transition-colors">
                <h3 className="font-bold text-marfim mb-3">{item.titulo}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.descricao}</p>
              </div>
            ))}
          </div>

          <div className="max-w-2xl mx-auto bg-white/10 rounded-[2rem] p-10">
            <h3 className="font-serif text-2xl text-center mb-8">Ficha de Associação</h3>
            
            {msg.text && (
              <div className={`mb-6 p-4 rounded-xl text-center text-sm font-bold ${msg.type === 'error' ? 'bg-red-500/20 text-red-200' : 'bg-green-500/20 text-green-200'}`}>
                {msg.text}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                required
                type="text"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                placeholder="Nome Completo / Organização"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-4 text-sm text-marfim placeholder-gray-400 focus:outline-none focus:border-dourado"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  placeholder="E-mail de contato"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-4 text-sm text-marfim placeholder-gray-400 focus:outline-none focus:border-dourado"
                />
                <input
                  required
                  type="text"
                  value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})}
                  placeholder="Telefone / WhatsApp"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-4 text-sm text-marfim placeholder-gray-400 focus:outline-none focus:border-dourado"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  required
                  type="text"
                  value={form.cpf_cnpj}
                  onChange={e => setForm({...form, cpf_cnpj: e.target.value})}
                  placeholder="CPF ou CNPJ"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-4 text-sm text-marfim placeholder-gray-400 focus:outline-none focus:border-dourado"
                />
                <select 
                  required
                  value={form.tipo}
                  onChange={e => setForm({...form, tipo: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-4 text-sm text-gray-300 focus:outline-none focus:border-dourado [&>option]:text-carbono"
                >
                  <option value="" disabled>Qual seu interesse?</option>
                  <option value="Efetivo">Associado Efetivo</option>
                  <option value="Contribuinte">Associado Contribuinte</option>
                  <option value="Voluntário">Associado Voluntário</option>
                  <option value="Benemérito ou Honorário">Associado Benemérito</option>
                </select>
              </div>
              
              <label className="flex items-start gap-3 mt-6 cursor-pointer">
                <input 
                  type="checkbox" 
                  required
                  checked={form.aceitou_termos}
                  onChange={e => setForm({...form, aceitou_termos: e.target.checked})}
                  className="mt-1 w-5 h-5 accent-dourado rounded" 
                />
                <span className="text-sm text-gray-400 leading-relaxed">
                  Declaro que li e aceito integralmente o <a href="#" className="text-dourado underline">Estatuto e Regulamento Interno</a> do Instituto MCS, e concordo com os termos de adesão.
                </span>
              </label>

              <button 
                type="submit" 
                disabled={saving}
                className="w-full mt-6 bg-dourado text-carbono py-4 rounded-full font-bold hover:bg-yellow-500 transition-colors uppercase tracking-widest text-sm disabled:opacity-50"
              >
                {saving ? 'ENVIANDO...' : 'ENVIAR FICHA DE ASSOCIAÇÃO'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
