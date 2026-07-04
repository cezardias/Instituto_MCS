import { NavLink, Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

const links = [
  { label: 'INÍCIO', to: '/' },
  { label: 'QUEM SOMOS', to: '/quem-somos' },
  { label: 'PROJETOS', to: '/projetos' },
  { label: 'TRANSPARÊNCIA', to: '/transparencia' },
  { label: 'COMPLIANCE', to: '/compliance' },
  { label: 'NOTÍCIAS', to: '/noticias' },
  { label: 'PARCEIROS', to: '/parceiros' },
  { label: 'CONTATO', to: '/contato' }
]

export default function NavBar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fecha o menu mobile quando a rota mudar
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Se a rota for a inicial (/), usamos fundo escuro e texto claro, senão fundo claro e texto escuro
  const isHomePage = location.pathname === '/';
  const navTextColor = isHomePage ? 'text-marfim' : 'text-carbono';
  const borderColor = isHomePage ? 'border-gray-800/30' : 'border-gray-200';

  return (
    <header className="absolute top-0 left-0 w-full z-50">
      <div className={`max-w-[1400px] mx-auto px-6 lg:px-8 py-6 flex items-center justify-between border-b ${borderColor}`}>
        <div className="flex items-center gap-2">
          <Link to="/">
            <img 
              src="/logo.png" 
              alt="Instituto MCS" 
              className={`h-16 object-contain ${!isHomePage ? 'mix-blend-multiply' : ''}`} 
            />
          </Link>
        </div>
        
        {/* Menu Desktop */}
        <nav className={`hidden lg:flex items-center gap-6 text-[0.65rem] font-bold tracking-widest ${navTextColor}`}>
          {links.map((link) => (
            <NavLink 
              key={link.to} 
              to={link.to}
              className={({ isActive }) => `hover:text-dourado transition-colors ${isActive ? 'text-dourado' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
          <NavLink 
            to="/" 
            className="ml-4 bg-dourado text-carbono px-6 py-2 rounded-full font-bold hover:bg-yellow-500 transition-colors flex items-center gap-2"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            DOE AGORA
          </NavLink>
        </nav>

        {/* Hamburger Menu Button (Mobile) */}
        <button 
          className={`lg:hidden p-2 ${navTextColor}`}
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
        <nav className="lg:hidden bg-carbono text-marfim w-full flex flex-col border-b border-gray-800 absolute top-full left-0 shadow-2xl">
          {links.map((link) => (
            <NavLink 
              key={link.to} 
              to={link.to}
              className={({ isActive }) => `px-6 py-4 text-xs font-bold tracking-widest border-b border-gray-800/50 hover:bg-gray-800 transition-colors ${isActive ? 'text-dourado' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
          <div className="p-6">
            <NavLink 
              to="/" 
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
