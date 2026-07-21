import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import QuemSomos from './pages/QuemSomos'
import ProjectsPage from './pages/ProjectsPage'
import TransparencyPage from './pages/TransparencyPage'
import CompliancePage from './pages/CompliancePage'
import AdminDashboard from './pages/AdminDashboard'
import StudentApp from './pages/StudentApp'
import LoginPage from './pages/LoginPage'
import NoticiasPage from './pages/NoticiasPage'
import ParceirosPage from './pages/ParceirosPage'
import ContatoPage from './pages/ContatoPage'
import RifaPage from './pages/RifaPage'

// Layout wrapper com NavBar + Footer (site público)
function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <Routes>
      {/* Rotas do painel administrativo (sem NavBar/Footer) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<AdminDashboard />} />
      <Route path="/jornada" element={<StudentApp />} />

      {/* Rotas públicas (com NavBar + Footer) */}
      <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
      <Route path="/quem-somos" element={<PublicLayout><QuemSomos /></PublicLayout>} />
      <Route path="/projetos" element={<PublicLayout><ProjectsPage /></PublicLayout>} />
      <Route path="/banco-de-projetos" element={<PublicLayout><ProjectsPage /></PublicLayout>} />
      <Route path="/transparencia" element={<PublicLayout><TransparencyPage /></PublicLayout>} />
      <Route path="/compliance" element={<PublicLayout><CompliancePage /></PublicLayout>} />
      <Route path="/noticias" element={<PublicLayout><NoticiasPage /></PublicLayout>} />
      <Route path="/parceiros" element={<PublicLayout><ParceirosPage /></PublicLayout>} />
      <Route path="/contato" element={<PublicLayout><ContatoPage /></PublicLayout>} />
      <Route path="/rifa" element={<PublicLayout><RifaPage /></PublicLayout>} />
    </Routes>
  )
}

export default App

