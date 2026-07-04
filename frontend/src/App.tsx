import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import QuemSomos from './pages/QuemSomos'
import ProjectsPage from './pages/ProjectsPage'
import TransparencyPage from './pages/TransparencyPage'
import CompliancePage from './pages/CompliancePage'
import DashboardPage from './pages/AdminDashboard'

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/quem-somos" element={<QuemSomos />} />
          <Route path="/projetos" element={<ProjectsPage />} />
          <Route path="/transparencia" element={<TransparencyPage />} />
          <Route path="/compliance" element={<CompliancePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
