import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-carbono border-t border-gray-800 text-gray-400 py-16">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-1">
          <div className="text-3xl font-serif font-bold tracking-tighter text-marfim mb-4">M<span className="text-dourado">C</span>S</div>
          <p className="text-sm leading-relaxed mb-6">
            Promovemos transformação social por meio da educação, cultura, esporte, saúde e cidadania. Juntos, construímos um futuro mais justo, inclusivo e consciente.
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-dourado transition-colors">Instagram</a>
            <a href="#" className="hover:text-dourado transition-colors">LinkedIn</a>
          </div>
        </div>

        <div>
          <h4 className="text-marfim font-semibold uppercase tracking-widest text-xs mb-6">Links Rápidos</h4>
          <ul className="space-y-3 text-sm">
            <li><Link to="/" className="hover:text-dourado transition-colors">Início</Link></li>
            <li><Link to="/quem-somos" className="hover:text-dourado transition-colors">Quem Somos</Link></li>
            <li><Link to="/projetos" className="hover:text-dourado transition-colors">Projetos</Link></li>
            <li><Link to="/transparencia" className="hover:text-dourado transition-colors">Transparência</Link></li>
            <li><Link to="/compliance" className="hover:text-dourado transition-colors">Governança</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-marfim font-semibold uppercase tracking-widest text-xs mb-6">Links Rápidos</h4>
          <ul className="space-y-3 text-sm">
            <li><Link to="/projetos" className="hover:text-dourado transition-colors">Banco de Projetos</Link></li>
            <li><Link to="/noticias" className="hover:text-dourado transition-colors">Notícias</Link></li>
            <li><Link to="/parceiros" className="hover:text-dourado transition-colors">Parceiros</Link></li>
            <li><Link to="/contato" className="hover:text-dourado transition-colors">Contato</Link></li>
            <li><Link to="/transparencia" className="hover:text-dourado transition-colors">Relatórios Anuais</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-marfim font-semibold uppercase tracking-widest text-xs mb-6">Fale Conosco</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 shrink-0 text-dourado" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span>Setor Bueno, Goiânia - GO<br/>CEP 74230-010</span>
            </li>
            <li className="flex items-center gap-3">
              <svg className="w-5 h-5 shrink-0 text-dourado" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              <span>(62) 99999-9999</span>
            </li>
            <li className="flex items-center gap-3">
              <svg className="w-5 h-5 shrink-0 text-dourado" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              <span>contato@institutomcs.org.br</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
        <p>&copy; {new Date().getFullYear()} Instituto Movimento de Cultura Social - MCS. Todos os direitos reservados.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-marfim transition-colors">Política de Privacidade</a>
          <a href="#" className="hover:text-marfim transition-colors">Termos de Uso</a>
          <a href="#" className="hover:text-marfim transition-colors">Política de Cookies</a>
        </div>
      </div>
    </footer>
  )
}
