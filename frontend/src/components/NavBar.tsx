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
  { label: 'CONTATO', to: '/contato' }
]

export default function NavBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  
  // Como a página inicial agora também é clara, sempre usaremos o tema claro.
  const isDarkHome = false

  // Fecha o menu mobile quando muda de página
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  const textColor = 'text-carbono'
  const hoverColor = 'hover:text-dourado'
  const borderColor = 'border-gray-200'
  const bgMobileMenu = 'bg-marfim'

  return (
    <header className="absolute w-full z-50">
      <div className={`max-w-[1400px] mx-auto px-6 lg:px-8 py-4 md:py-6 flex items-center justify-between border-b ${borderColor}`}>
        <div className="flex items-center gap-2">
          <Link to="/">
            <img 
              src="/logo.png" 
              alt="Instituto MCS Logo" 
              className="h-12 md:h-16 w-auto mix-blend-multiply"
            />
          </Link>
        </div>

        {/* Desktop Menu */}
        <nav className={`hidden lg:flex items-center gap-6 text-[0.65rem] font-bold tracking-[0.2em] ${textColor}`}>
          {links.map((link) => (
            <NavLink 
              key={link.label} 
              to={link.to} 
              className={({ isActive }) => 
                `transition-colors ${isActive ? 'text-dourado border-b border-dourado pb-1' : hoverColor}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <Link 
            to="/login" 
            className="ml-2 border border-carbono text-carbono px-4 py-2 rounded-full text-[0.65rem] font-bold hover:bg-carbono hover:text-marfim transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            ENTRAR
          </Link>
          <NavLink 
            to="/doe" 
            className="ml-1 bg-dourado text-carbono px-5 py-2 rounded-full text-[0.65rem] font-bold hover:bg-yellow-500 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            DOE AGORA
          </NavLink>
        </nav>

        {/* Hamburger Menu Button (Mobile) */}
        <button 
          className={`lg:hidden p-2 ${textColor}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <nav className={`lg:hidden ${bgMobileMenu} ${textColor} w-full flex flex-col border-b border-gray-200 absolute top-full left-0 shadow-2xl`}>
          {links.map((link) => (
            <NavLink 
              key={link.to} 
              to={link.to}
              className={({ isActive }) => `px-6 py-4 text-xs font-bold tracking-widest border-b border-gray-100 hover:bg-gray-50 transition-colors ${isActive ? 'text-dourado' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
          <div className="p-4 flex flex-col gap-3">
            <Link 
              to="/login" 
              className="border border-carbono text-carbono w-full px-6 py-3 rounded-full font-bold hover:bg-carbono hover:text-marfim transition-colors flex items-center justify-center gap-2 text-xs tracking-widest"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              ENTRAR NO PAINEL
            </Link>
            <NavLink 
              to="/doe" 
              className="bg-dourado text-carbono w-full px-6 py-3 rounded-full font-bold hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2 text-xs tracking-widest"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              DOE AGORA
            </NavLink>
          </div>
        </nav>
      )}
    </header>
  )
}
