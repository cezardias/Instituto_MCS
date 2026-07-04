import { NavLink, Link } from 'react-router-dom'

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
  return (
    <header className="absolute top-0 left-0 w-full z-50">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-6 flex items-center justify-between border-b border-gray-800/30">
        <div className="flex items-center gap-2 text-marfim">
          <Link to="/">
            <img src="/logo.png" alt="Instituto MCS" className="h-16 object-contain" />
          </Link>
        </div>
        
        <nav className="hidden lg:flex items-center gap-6 text-[0.65rem] font-bold tracking-widest text-marfim">
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
      </div>
    </header>
  )
}
