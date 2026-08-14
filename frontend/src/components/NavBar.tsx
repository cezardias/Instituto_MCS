import { NavLink, Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

const links = [
  { label: 'PROPÓSITO', to: '/' },
  { label: 'NOSSA ESSÊNCIA', to: '/quem-somos' },
  { label: 'ECOSSISTEMA DE ATUAÇÃO', to: '/projetos' },
  { label: 'ASSOCIADOS', to: '/associados' },
  { label: 'CONTATO', to: '/contato' },
  { label: 'RIFA MCS', to: '/rifa' },
]

export default function NavBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ subject: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const location = useLocation()

  const isHomePage = location.pathname === '/'

  const submitDenuncia = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/denuncias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: 'instituto-mcs', subject: form.subject, message: form.message })
      })
      if (!res.ok) throw new Error('Erro ao enviar')
      setStatus('success')
      setForm({ subject: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  return (
    <>
      <header className={`absolute w-full z-50 transition-all duration-300 ${
        isHomePage 
          ? 'bg-[#0a0d14]/85 backdrop-blur-md border-b border-white/10 text-white' 
          : 'bg-marfim/95 backdrop-blur-sm border-b border-gray-200 text-carbono'
      }`}>
        <div className="max-w-[1600px] mx-auto px-4 xl:px-8 h-24 flex items-center justify-between">

          {/* Logo - Enlarged and adapted to dark background with transparent background */}
          <Link to="/" className="shrink-0 flex items-center">
            <img
              src="/logo.png"
              alt="Instituto MCS"
              className={`h-12 xl:h-16 w-auto transition-all ${
                isHomePage 
                  ? 'filter invert brightness-125 mix-blend-screen' 
                  : 'mix-blend-multiply'
              }`}
            />
          </Link>

          {/* ── Desktop Nav (xl+) ────────────────────── */}
          <nav className="hidden xl:flex items-center gap-1.5 text-[0.72rem] font-bold tracking-[0.14em]">
            {links.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                className={({ isActive }) =>
                  `px-3 py-2 transition-colors whitespace-nowrap ${
                    isHomePage
                      ? isActive
                        ? 'text-amber-400 font-black'
                        : 'text-gray-200 hover:text-amber-300'
                      : isActive
                        ? 'text-dourado font-black'
                        : 'text-carbono hover:text-dourado'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* ── CTA Buttons ──────────────────────────── */}
          <div className="hidden xl:flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowModal(true)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[0.65rem] font-bold transition-colors ${
                isHomePage
                  ? 'border border-red-500/80 text-red-400 hover:bg-red-600 hover:text-white'
                  : 'border border-red-500 text-red-600 hover:bg-red-500 hover:text-white'
              }`}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              DENÚNCIA
            </button>
            <Link
              to="/login"
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[0.65rem] font-bold transition-colors ${
                isHomePage
                  ? 'border border-white/30 text-white hover:bg-white/10'
                  : 'border border-carbono text-carbono hover:bg-carbono hover:text-marfim'
              }`}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              ENTRAR
            </Link>
            <Link
              to="/doe"
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full text-[0.65rem] font-bold transition-transform transform hover:scale-105 shadow-md"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              DOE AGORA
            </Link>
          </div>

          {/* ── Hamburger (< xl) ─────────────────────── */}
          <button
            className={`xl:hidden p-2 ${isHomePage ? 'text-white' : 'text-carbono'}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Abrir menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* ── Mobile / Tablet Dropdown ─────────────── */}
        {isMobileMenuOpen && (
          <div className={`xl:hidden shadow-2xl absolute w-full left-0 border-t ${
            isHomePage ? 'bg-slate-900 border-slate-800 text-white' : 'bg-marfim border-gray-100 text-carbono'
          }`}>
            <nav className="flex flex-col divide-y divide-white/10">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `px-6 py-4 text-xs font-bold tracking-widest hover:bg-white/5 transition-colors ${
                      isActive ? 'text-amber-400 font-extrabold' : isHomePage ? 'text-gray-200' : 'text-carbono'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <div className="px-6 py-5 flex flex-col gap-3 border-t border-white/10">
              <button
                onClick={() => { setIsMobileMenuOpen(false); setShowModal(true) }}
                className="w-full flex items-center justify-center gap-2 border border-red-500 text-red-500 py-3 rounded-full text-xs font-bold tracking-widest hover:bg-red-500 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                CANAL DE DENÚNCIA
              </button>
              <Link
                to="/login"
                className="w-full flex items-center justify-center gap-2 border border-white/30 text-white py-3 rounded-full text-xs font-bold tracking-widest hover:bg-white/10 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                ENTRAR NO PAINEL
              </Link>
              <Link
                to="/doe"
                className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-full text-xs font-bold tracking-widest hover:bg-red-700 transition-colors shadow-md"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                DOE AGORA
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Modal Canal de Denúncias ─────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 relative text-carbono">
            <button onClick={() => {setShowModal(false); setStatus('idle'); setForm({subject:'', message:''})}} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="font-serif text-2xl text-carbono mb-2">Canal de Denúncias</h3>
            <p className="text-sm text-gray-500 mb-6">Este é um canal seguro e sigiloso. Sua mensagem será enviada diretamente à diretoria e equipe de compliance.</p>
            
            {status === 'success' ? (
              <div className="bg-green-50 border border-green-200 text-green-700 p-6 rounded-2xl text-center">
                <p className="font-bold text-lg mb-2">Mensagem Enviada!</p>
                <p className="text-sm">Agradecemos por nos ajudar a manter a transparência e integridade do Instituto MCS.</p>
                <button onClick={() => {setShowModal(false); setStatus('idle')}} className="mt-4 bg-green-600 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-green-700">Fechar</button>
              </div>
            ) : (
              <form onSubmit={submitDenuncia} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Assunto</label>
                  <input required value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-carbono px-4 py-3 rounded-xl outline-none focus:border-dourado focus:ring-1 focus:ring-dourado transition-all" placeholder="Ex: Suspeita de irregularidade, Assédio, etc." />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Sua Mensagem</label>
                  <textarea required value={form.message} onChange={e=>setForm({...form,message:e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-carbono px-4 py-3 rounded-xl outline-none focus:border-dourado focus:ring-1 focus:ring-dourado transition-all h-32 resize-none" placeholder="Descreva os fatos com o máximo de detalhes possível. O relato é 100% anônimo." />
                </div>
                {status === 'error' && <p className="text-red-500 text-sm font-bold">Ocorreu um erro ao enviar. Tente novamente.</p>}
                <button type="submit" disabled={status === 'loading'} className="w-full bg-red-600 text-white py-3.5 rounded-full text-sm font-bold tracking-widest hover:bg-red-700 transition-colors disabled:opacity-60">
                  {status === 'loading' ? 'ENVIANDO...' : 'ENVIAR DENÚNCIA SIGILOSA'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}

