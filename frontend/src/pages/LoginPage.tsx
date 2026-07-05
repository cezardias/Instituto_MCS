import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [mustChangePassword, setMustChangePassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Credenciais inválidas')
      } else {
        localStorage.setItem('mcs_token', data.token)
        localStorage.setItem('mcs_user', JSON.stringify(data.user || { email }))
        
        if (data.user?.must_change_password) {
          setMustChangePassword(true)
        } else {
          navigate(data.user?.role === 'aluno' ? '/jornada' : '/dashboard')
        }
      }
    } catch {
      setError('Erro de conexão com o servidor. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('mcs_token')
      const user = JSON.parse(localStorage.getItem('mcs_user') || '{}')
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ new_password: newPassword })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erro ao alterar senha')
      } else {
        navigate(user.role === 'aluno' ? '/jornada' : '/dashboard')
      }
    } catch {
      setError('Erro de conexão com o servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-marfim flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <img src="/logo.png" alt="Instituto MCS" className="h-20 mx-auto mb-6 mix-blend-multiply" />
          <h1 className="font-serif text-3xl text-carbono">Acesso Administrativo</h1>
          <p className="text-gray-500 text-sm mt-2">Painel exclusivo para gestores do Instituto MCS</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-10">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm flex items-center gap-3">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}

          {mustChangePassword ? (
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl px-5 py-4 text-sm">
                <strong>Atenção LGPD:</strong> Este é o seu primeiro acesso. Por motivos de segurança, você deve criar uma nova senha agora.
              </div>
              <div>
                <label htmlFor="new_password" className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Nova Senha
                </label>
                <input
                  id="new_password"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-5 py-4 text-sm text-carbono focus:outline-none focus:ring-2 focus:ring-dourado/40 focus:border-dourado transition-all"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <button
                type="submit"
                disabled={loading || newPassword.length < 6}
                className="w-full bg-carbono text-marfim py-4 rounded-full font-bold hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? 'Atualizando...' : 'ATUALIZAR SENHA E ENTRAR'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  E-mail Institucional
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-5 py-4 text-sm text-carbono focus:outline-none focus:ring-2 focus:ring-dourado/40 focus:border-dourado transition-all"
                  placeholder="seu.nome@institutomcs.org.br"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Senha
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-5 py-4 text-sm text-carbono focus:outline-none focus:ring-2 focus:ring-dourado/40 focus:border-dourado transition-all"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-carbono text-marfim py-4 rounded-full font-bold hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Acessando...
                  </>
                ) : (
                  'ACESSAR PAINEL'
                )}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} Instituto MCS — Acesso restrito
        </p>
      </div>
    </div>
  )
}
