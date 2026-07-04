import { NavLink } from 'react-router-dom'

const links = [
  { label: 'Início', to: '/' },
  { label: 'Projetos', to: '/projetos' },
  { label: 'Transparência', to: '/transparencia' },
  { label: 'Compliance', to: '/compliance' },
  { label: 'Admin', to: '/dashboard' }
]

export default function NavBar() {
  return (
    <header className="navbar">
      <div className="nav-inner">
        <div className="nav-logo">MCS</div>
        <nav className="nav-links">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to}>{link.label}</NavLink>
          ))}
          <NavLink to="/" className="action">Doe Agora</NavLink>
        </nav>
      </div>
    </header>
  )
}
