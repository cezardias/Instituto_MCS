import { NavLink, Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

const links = [
  { label: 'INÍCIO', to: '/' },
  { label: 'QUEM SOMOS', to: '/quem-somos' },
  { label: 'PROJETOS', to: '/projetos' },
  { label: 'TRANSPARÊNCIA', to: '/transparencia' },
  { label: 'COMPLIANCE', to: '/compliance' },
  { label: 'BANCO DE PROJETOS', to: '/banco-de-projetos' },
  { label: 'NOTÍCIAS', to: '/noticias' },
  { label: 'PARCEIROS', to: '/parceiros' },
  { label: 'CONTATO', to: '/contato' },
]

export default function NavBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  return (
    <header className="absolute w-full z-50 bg-marfim/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-[1600px] mx-auto px-4 xl:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="shrink-0">
          <img
            src="/logo.png"
            alt="Instituto MCS"
            className="h-10 xl:h-12 w-auto mix-blend-multiply"
          />
        </Link>

        {/* ── Desktop Nav (xl+) ────────────────────── */}
        <nav className="hidden xl:flex items-center gap-0 text-[0.6rem] font-bold tracking-[0.12em] text-carbono">
          {links.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              className={({ isActive }) =>
                `px-3 py-2 transition-colors whitespace-nowrap hover:text-dourado ${
                  isActive ? 'text-dourado border-b-2 border-dourado' : ''
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* ── CTA Buttons ──────────────────────────── */}
        <div className="hidden xl:flex items-center gap-2 shrink-0">
          <Link
            to="/login"
            className="flex items-center gap-1.5 border border-carbono text-carbono px-4 py-2 rounded-full text-[0.6rem] font-bold hover:bg-carbono hover:text-marfim transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            ENTRAR
          </Link>
          <Link
            to="/doe"
            className="flex items-center gap-1.5 bg-dourado text-carbono px-4 py-2 rounded-full text-[0.6rem] font-bold hover:bg-yellow-500 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            DOE AGORA
          </Link>
        </div>

        {/* ── Hamburger (< xl) ─────────────────────── */}
        <button
          className="xl:hidden p-2 text-carbono"
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
        <div className="xl:hidden bg-marfim border-t border-gray-100 shadow-xl absolute w-full left-0">
          <nav className="flex flex-col divide-y divide-gray-100">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-6 py-4 text-xs font-bold tracking-widest hover:bg-gray-50 transition-colors ${
                    isActive ? 'text-dourado' : 'text-carbono'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="px-6 py-5 flex flex-col gap-3 border-t border-gray-100">
            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 border border-carbono text-carbono py-3 rounded-full text-xs font-bold tracking-widest hover:bg-carbono hover:text-marfim transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              ENTRAR NO PAINEL
            </Link>
            <Link
              to="/doe"
              className="w-full flex items-center justify-center gap-2 bg-dourado text-carbono py-3 rounded-full text-xs font-bold tracking-widest hover:bg-yellow-500 transition-colors"
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
  )
}
