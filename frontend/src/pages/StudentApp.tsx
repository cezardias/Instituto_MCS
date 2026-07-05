import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function StudentApp() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('jornada')

  const handleLogout = () => {
    localStorage.removeItem('mcs_token')
    localStorage.removeItem('mcs_user')
    navigate('/login')
  }

  useEffect(() => {
    const token = localStorage.getItem('mcs_token')
    if (!token) {
      navigate('/login')
      return
    }
    
    // Fetch user info to get latest streak and coins
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` }})
      .then(res => res.json())
      .then(data => {
        if (data.error) navigate('/login')
        else setUser(data)
      })
      .catch(() => {
         // Fallback to localstorage if me endpoint doesn't exist
         const stored = JSON.parse(localStorage.getItem('mcs_user') || '{}')
         setUser(stored)
      })
  }, [navigate])

  if (!user) return <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">Carregando...</div>

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f0] font-sans pb-20">
      
      {/* Top HUD */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 h-16 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg
              ${user.league === 'Ouro' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 
                user.league === 'Prata' ? 'bg-gradient-to-r from-gray-300 to-gray-500' : 
                'bg-gradient-to-r from-orange-400 to-red-500'}`}
            >
              {user.name?.[0] || 'A'}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
              <span className="text-[10px] bg-gray-900 text-white px-1.5 py-0.5 rounded-full font-bold">{user.league?.[0] || 'B'}</span>
            </div>
          </div>
          <div>
            <h1 className="font-bold text-sm text-carbono leading-tight">{user.name}</h1>
            <p className="text-[10px] text-gray-500">Liga {user.league || 'Bronze'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-orange-500 font-bold bg-orange-50 px-2.5 py-1.5 rounded-full shadow-sm">
            <span className="text-lg drop-shadow-sm">🔥</span>
            <span>{user.streak || 0}</span>
          </div>
          <div className="flex items-center gap-1.5 text-yellow-600 font-bold bg-yellow-50 px-2.5 py-1.5 rounded-full shadow-sm">
            <span className="text-lg drop-shadow-sm">💰</span>
            <span>{user.coins || 0}</span>
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 ml-1 transition-colors" title="Sair">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'jornada' && <JornadaTab />}
        {activeTab === 'passaporte' && <PassaporteTab user={user} />}
        {activeTab === 'eventos' && <EventosTab />}
        {activeTab === 'loja' && <div className="p-6 text-center text-gray-500 mt-10">Loja em breve</div>}
      </main>

      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-100 flex items-center justify-around h-16 z-50 px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <NavItem icon="🗺️" label="Jornada" active={activeTab === 'jornada'} onClick={() => setActiveTab('jornada')} />
        <NavItem icon="🏅" label="Passaporte" active={activeTab === 'passaporte'} onClick={() => setActiveTab('passaporte')} />
        <NavItem icon="📅" label="Eventos" active={activeTab === 'eventos'} onClick={() => setActiveTab('eventos')} />
        <NavItem icon="🛒" label="Loja" active={activeTab === 'loja'} onClick={() => setActiveTab('loja')} />
      </nav>
    </div>
  )
}

function NavItem({ icon, label, active, onClick }: { icon: string, label: string, active: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${active ? 'text-dourado' : 'text-gray-400'}`}>
      <span className={`text-xl ${active ? 'scale-125 drop-shadow-md' : 'grayscale opacity-50'} transition-transform`}>{icon}</span>
      <span className={`text-[10px] font-bold ${active ? 'text-carbono' : ''}`}>{label}</span>
    </button>
  )
}

function JornadaTab() {
  const [missions, setMissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeLesson, setActiveLesson] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('mcs_token')
    fetch('/api/jornada', { headers: { Authorization: `Bearer ${token}` }})
      .then(res => res.json())
      .then(data => {
        if (!data.error) setMissions(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (activeLesson) {
    return <LessonView mission={activeLesson} onBack={() => setActiveLesson(null)} onComplete={() => window.location.reload()} />
  }

  if (loading) return <div className="p-10 text-center text-gray-500 font-bold">Carregando mapa...</div>

  return (
    <div className="py-8 flex flex-col items-center">
      <h2 className="text-2xl font-black text-center text-carbono mb-10 font-serif w-full px-6">
        Sua Jornada
      </h2>
      
      <div className="flex flex-col items-center gap-6 w-full max-w-sm px-4 relative">
        {/* Lógica de renderizar os nós e conexões */}
        {missions.map((mission, idx) => {
          const isCompleted = mission.status === 'completed'
          const isCurrent = mission.status === 'current'
          const isLocked = mission.status === 'locked'
          
          // Zigue-zague (esquerda, centro, direita, centro)
          const offset = [0, 40, 0, -40][idx % 4]
          
          return (
            <div key={mission.id} className="relative flex flex-col items-center w-full" style={{ paddingLeft: `${offset > 0 ? offset : 0}px`, paddingRight: `${offset < 0 ? -offset : 0}px` }}>
              {/* Linha conectora (menos no último) */}
              {idx < missions.length - 1 && (
                <div className={`absolute top-16 w-2 h-16 -z-10 ${isCompleted ? 'bg-dourado' : 'bg-gray-300'}`} />
              )}
              
              <button 
                onClick={() => (isCurrent || isCompleted) && setActiveLesson(mission)}
                disabled={isLocked}
                className={`w-20 h-20 rounded-full flex items-center justify-center border-4 shadow-xl transition-all
                  ${isCompleted ? 'bg-dourado border-yellow-300 text-carbono' : 
                    isCurrent ? 'bg-orange-500 border-orange-300 text-white scale-110 animate-pulse' : 
                    'bg-gray-300 border-gray-200 text-gray-500 grayscale opacity-60'}
                `}
              >
                <span className="text-3xl">{mission.type === 'questionario' ? '❓' : mission.type === 'atividade_pratica' ? '🎤' : '🌟'}</span>
              </button>
              
              <div className="mt-3 text-center w-40">
                <p className={`font-bold text-sm leading-tight ${isCurrent ? 'text-carbono' : 'text-gray-500'}`}>{mission.title}</p>
              </div>
            </div>
          )
        })}
        {missions.length === 0 && <p className="text-gray-400">Nenhuma missão disponível no momento.</p>}
      </div>
    </div>
  )
}

function LessonView({ mission, onBack, onComplete }: { mission: any, onBack: () => void, onComplete: () => void }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string | number, any>>({})
  const [submitting, setSubmitting] = useState(false)
  const questions = mission.questions || []
  
  const currentQ = questions[step]

  const handleNext = async () => {
    if (step < questions.length - 1) {
      setStep(step + 1)
    } else {
      setSubmitting(true)
      const token = localStorage.getItem('mcs_token')
      await fetch(`/api/assessments/${mission.id}/deliver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ answers })
      })
      onComplete()
    }
  }

  if (questions.length === 0) {
    const isPracticalOrWriting = mission.type === 'pratica' || mission.type === 'redacao'
    return (
      <div className="fixed inset-0 z-[60] bg-white flex flex-col h-[100dvh]">
        <div className="flex items-center p-4 border-b border-gray-100 shrink-0">
          <button onClick={onBack} className="text-gray-400 text-3xl px-2 leading-none pb-1 hover:text-gray-600 transition-colors">×</button>
          <div className="flex-1" />
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col max-w-3xl mx-auto w-full mt-8 md:mt-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{mission.title}</h2>
          <p className="mb-8 text-gray-600">{mission.description}</p>
          
          {isPracticalOrWriting && (
            <textarea
              rows={8}
              className="w-full border-2 border-gray-200 rounded-2xl p-4 focus:outline-none focus:border-dourado resize-none font-medium text-lg text-carbono shadow-sm mb-6 text-left"
              placeholder={mission.type === 'redacao' ? 'Escreva sua redação aqui...' : 'Descreva o que foi feito na atividade prática...'}
              value={answers['main'] || ''}
              onChange={(e) => setAnswers({...answers, main: e.target.value})}
            />
          )}
        </div>
        <div className="p-4 border-t border-gray-100 bg-white shrink-0 w-full">
           <div className="max-w-3xl mx-auto w-full flex justify-between items-center">
             <button 
                onClick={handleNext} 
                disabled={submitting || (isPracticalOrWriting && !answers['main'])}
                className="w-full bg-green-500 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl text-lg uppercase tracking-wider transition-colors">
                {submitting ? 'Enviando...' : 'Finalizar Missão'}
             </button>
           </div>
        </div>
      </div>
    )
  }

  const progress = ((step) / questions.length) * 100

  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col h-[100dvh]">
      {/* Top Bar Progress */}
      <div className="flex items-center gap-4 p-4 border-b border-gray-100 shrink-0">
        <button onClick={onBack} className="text-gray-400 text-3xl px-2 leading-none pb-1 hover:text-gray-600 transition-colors">×</button>
        <div className="flex-1 bg-gray-200 h-3 rounded-full overflow-hidden">
          <div className="bg-green-500 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col max-w-3xl mx-auto w-full mt-8 md:mt-16">
        <h3 className="font-bold text-2xl md:text-3xl text-carbono mb-10 leading-snug">{currentQ.question_text}</h3>
        
        {currentQ.type === 'multiple_choice' && currentQ.options?.map((opt: string, i: number) => (
          <button 
            key={i}
            onClick={() => setAnswers({...answers, [currentQ.id]: opt})}
            className={`w-full text-left p-4 md:p-5 mb-3 rounded-2xl border-2 transition-all font-bold text-lg ${
              answers[currentQ.id] === opt ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-200 text-carbono hover:bg-gray-50'
            }`}
          >
            {opt}
          </button>
        ))}

        {currentQ.type === 'dissertation' && (
          <textarea rows={6} className="w-full border-2 border-gray-200 rounded-2xl p-4 focus:outline-none focus:border-dourado resize-none font-medium text-lg text-carbono shadow-sm"
            placeholder="Sua resposta..."
            value={answers[currentQ.id] || ''}
            onChange={(e) => setAnswers({...answers, [currentQ.id]: e.target.value})}
          />
        )}
      </div>

      {/* Bottom Bar Action */}
      <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-white shrink-0 max-w-3xl mx-auto w-full">
        <button 
          onClick={handleNext}
          disabled={!answers[currentQ.id] || submitting}
          className="w-full bg-green-500 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl text-lg uppercase tracking-wider transition-colors"
        >
          {submitting ? 'Enviando...' : (step === questions.length - 1 ? 'Finalizar Missão' : 'Verificar')}
        </button>
      </div>
    </div>
  )
}

function PassaporteTab({ user }: { user: any }) {
  return (
    <div className="p-6 pb-24 max-w-3xl mx-auto w-full">
      <h2 className="text-2xl font-black text-center text-carbono mb-8 font-serif">Passaporte Cultural</h2>
      
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 opacity-10 text-9xl">🏅</div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl mb-4 backdrop-blur-sm border-2 border-white/30">
            {user.name?.[0] || 'A'}
          </div>
          <h3 className="font-bold text-xl">{user.name}</h3>
          <p className="text-dourado font-bold mt-1 uppercase tracking-widest text-sm">Liga {user.league || 'Bronze'}</p>
        </div>
      </div>

      <h3 className="font-bold text-lg text-carbono mb-4">Seus Selos</h3>
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
        <p className="text-gray-400 text-sm">Você ainda não conquistou nenhum selo. Complete missões para ganhar!</p>
      </div>
    </div>
  )
}

function EventosTab() {
  return (
    <div className="p-6 pb-24 max-w-3xl mx-auto w-full">
      <h2 className="text-2xl font-black text-center text-carbono mb-8 font-serif">Próximos Eventos</h2>
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
        <p className="text-gray-400 text-sm">Nenhum evento programado no momento.</p>
      </div>
    </div>
  )
}
