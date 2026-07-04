import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// ─── types ──────────────────────────────────────────────
interface NewsItem {
  id: number
  title: string
  category: string
  content: string
  image_url: string | null
  created_at: string
}

interface User {
  id: number
  name: string
  email: string
  role: string
  created_at: string
}

// ─── sidebar links ───────────────────────────────────────
const navItems = [
  { id: 'overview', label: 'Visão Geral', icon: '📊' },
  { id: 'news', label: 'Notícias', icon: '📰' },
  { id: 'users', label: 'Usuários', icon: '👥' },
]

// ─── helpers ─────────────────────────────────────────────
function getToken() { return localStorage.getItem('mcs_token') || '' }
function getUser() {
  try { return JSON.parse(localStorage.getItem('mcs_user') || '{}') } catch { return {} }
}

const CATEGORIES = ['Projetos', 'Educação', 'Eventos', 'Parcerias', 'Institucional', 'Saúde', 'Esporte', 'Cultura']
const TENANT_ID = 'instituto-mcs'

// ───────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const user = getUser()

  // redirect if no token
  useEffect(() => {
    if (!getToken()) navigate('/login')
  }, [navigate])

  const logout = () => {
    localStorage.removeItem('mcs_token')
    localStorage.removeItem('mcs_user')
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────── */}
      <aside
        className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-carbono text-marfim flex flex-col transition-all duration-300 shrink-0`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-6 border-b border-gray-700">
          <img src="/logo.png" alt="MCS" className="h-10 w-10 object-contain rounded-full bg-white p-1" />
          {sidebarOpen && (
            <div>
              <p className="font-bold text-sm leading-tight">Instituto MCS</p>
              <p className="text-gray-400 text-[10px] uppercase tracking-widest">Admin</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                ${activeTab === item.id ? 'bg-dourado text-carbono' : 'text-gray-300 hover:bg-gray-700/50'}`}
            >
              <span className="text-xl shrink-0">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-6 space-y-2 border-t border-gray-700 pt-4">
          <div className={`flex items-center gap-3 px-4 py-2 ${sidebarOpen ? '' : 'justify-center'}`}>
            <div className="w-8 h-8 rounded-full bg-dourado flex items-center justify-center text-carbono font-bold text-sm shrink-0">
              {user.name?.[0] || 'A'}
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-xs font-bold truncate">{user.name || 'Admin'}</p>
                <p className="text-gray-400 text-[10px] truncate">{user.email || ''}</p>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors ${!sidebarOpen ? 'justify-center' : ''}`}
          >
            <span className="text-lg">🚪</span>
            {sidebarOpen && 'Sair'}
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {navItems.find((n) => n.id === activeTab)?.icon}{' '}
              <strong>{navItems.find((n) => n.id === activeTab)?.label}</strong>
            </span>
          </div>
          <a
            href="/"
            target="_blank"
            className="text-xs font-bold text-dourado border border-dourado px-4 py-2 rounded-full hover:bg-dourado hover:text-carbono transition-colors"
          >
            VER SITE →
          </a>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'news' && <NewsTab />}
          {activeTab === 'users' && <UsersTab />}
        </main>
      </div>
    </div>
  )
}

// ─── Overview Tab ────────────────────────────────────────
function OverviewTab() {
  return (
    <div>
      <h2 className="font-serif text-2xl text-carbono mb-6">Visão Geral</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Pessoas Impactadas', value: '15.000+', icon: '👥', color: 'bg-blue-50 text-blue-600' },
          { label: 'Notícias Publicadas', value: '—', icon: '📰', color: 'bg-yellow-50 text-yellow-600' },
          { label: 'Projetos Ativos', value: '12', icon: '🚀', color: 'bg-green-50 text-green-600' },
          { label: 'Municípios', value: '07', icon: '📍', color: 'bg-purple-50 text-purple-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 text-2xl ${stat.color}`}>
              {stat.icon}
            </div>
            <p className="font-serif text-3xl font-bold text-carbono">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
        <h3 className="font-bold text-carbono mb-4">Bem-vindo ao Painel</h3>
        <p className="text-gray-500 text-sm leading-relaxed">
          Use o menu lateral para gerenciar as <strong>Notícias</strong> do site (criar, editar, excluir, upload de imagens)
          e para administrar os <strong>Usuários</strong> do painel. Clique em "VER SITE →" para abrir o site público em uma nova aba.
        </p>
      </div>
    </div>
  )
}

// ─── News Tab ────────────────────────────────────────────
function NewsTab() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<NewsItem | null>(null)
  const [form, setForm] = useState({ title: '', category: 'Projetos', content: '', image_url: '' })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadNews = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/news?tenant_id=${TENANT_ID}`)
      const data = await res.json()
      setNews(Array.isArray(data) ? data : [])
    } catch { setNews([]) }
    setLoading(false)
  }

  useEffect(() => { loadNews() }, [])

  const openNew = () => {
    setEditing(null)
    setForm({ title: '', category: 'Projetos', content: '', image_url: '' })
    setImageFile(null)
    setShowForm(true)
    setError('')
  }

  const openEdit = (item: NewsItem) => {
    setEditing(item)
    setForm({ title: item.title, category: item.category, content: item.content, image_url: item.image_url || '' })
    setImageFile(null)
    setShowForm(true)
    setError('')
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja excluir esta notícia?')) return
    await fetch(`/api/news/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    loadNews()
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    let imageUrl = form.image_url

    // Upload image if selected
    if (imageFile) {
      const fd = new FormData()
      fd.append('image', imageFile)
      try {
        const upRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${getToken()}` },
          body: fd
        })
        const upData = await upRes.json()
        if (upData.url) imageUrl = upData.url
      } catch { setError('Falha no upload da imagem.'); setSaving(false); return }
    }

    const payload = { ...form, image_url: imageUrl }
    const method = editing ? 'PUT' : 'POST'
    const url = editing ? `/api/news/${editing.id}` : '/api/news'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(payload)
      })
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Erro ao salvar.') }
      else { setShowForm(false); loadNews() }
    } catch { setError('Erro de conexão.') }

    setSaving(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl text-carbono">Gerenciar Notícias</h2>
        <button
          onClick={openNew}
          className="bg-carbono text-marfim px-6 py-3 rounded-full text-sm font-bold hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <span className="text-lg">+</span> Nova Notícia
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl text-carbono">{editing ? 'Editar Notícia' : 'Nova Notícia'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>

            {error && <div className="mb-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Título *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-dourado/40 focus:border-dourado"
                  placeholder="Título da notícia"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Categoria *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-dourado/40 focus:border-dourado"
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Conteúdo *</label>
                <textarea
                  required
                  rows={5}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-dourado/40 focus:border-dourado resize-none"
                  placeholder="Texto da notícia..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Imagem</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-carbono file:text-marfim hover:file:bg-gray-700 cursor-pointer"
                />
                {(form.image_url || imageFile) && (
                  <p className="text-xs text-green-600 mt-1">
                    {imageFile ? `📎 ${imageFile.name}` : `✅ Imagem atual: ${form.image_url}`}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-full text-sm font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-carbono text-marfim py-3 rounded-full text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-60"
                >
                  {saving ? 'Salvando...' : editing ? 'Salvar Alterações' : 'Publicar Notícia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Carregando...</div>
      ) : news.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
          <p className="text-4xl mb-4">📰</p>
          <p className="text-gray-500 font-semibold mb-2">Nenhuma notícia publicada</p>
          <p className="text-gray-400 text-sm mb-6">Clique em "Nova Notícia" para começar</p>
          <button onClick={openNew} className="bg-carbono text-marfim px-6 py-3 rounded-full text-sm font-bold hover:bg-gray-800 transition-colors">
            Criar primeira notícia
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {news.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 flex items-center gap-5"
            >
              {item.image_url && (
                <img src={item.image_url} alt={item.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
              )}
              <div className="flex-1 overflow-hidden">
                <span className="inline-block text-[10px] font-bold uppercase tracking-widest bg-dourado/10 text-dourado px-2 py-1 rounded-full mb-1">
                  {item.category}
                </span>
                <p className="font-bold text-carbono truncate">{item.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(item.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openEdit(item)}
                  className="px-4 py-2 border border-gray-200 rounded-full text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="px-4 py-2 border border-red-200 rounded-full text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Users Tab ───────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      const data = await res.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch { setUsers([]) }
    setLoading(false)
  }

  useEffect(() => { loadUsers() }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(form)
      })
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Erro ao criar usuário.') }
      else { setShowForm(false); setForm({ name: '', email: '', password: '', role: 'user' }); loadUsers() }
    } catch { setError('Erro de conexão.') }
    setSaving(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja excluir este usuário?')) return
    await fetch(`/api/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    loadUsers()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl text-carbono">Gerenciar Usuários</h2>
        <button
          onClick={() => { setShowForm(true); setError('') }}
          className="bg-carbono text-marfim px-6 py-3 rounded-full text-sm font-bold hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <span className="text-lg">+</span> Novo Usuário
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl text-carbono">Novo Usuário</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>

            {error && <div className="mb-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Nome *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-dourado/40 focus:border-dourado"
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">E-mail *</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-dourado/40 focus:border-dourado"
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Senha *</label>
                <input
                  required
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-dourado/40 focus:border-dourado"
                  placeholder="Senha segura"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Perfil</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-dourado/40 focus:border-dourado"
                >
                  <option value="user">Editor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-full text-sm font-bold hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="flex-1 bg-carbono text-marfim py-3 rounded-full text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-60">
                  {saving ? 'Criando...' : 'Criar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Carregando...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-400 font-semibold">Nome</th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-400 font-semibold">E-mail</th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-400 font-semibold">Perfil</th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-400 font-semibold">Criado em</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-carbono text-marfim flex items-center justify-center font-bold text-sm shrink-0">
                        {u.name[0]}
                      </div>
                      <span className="font-semibold text-carbono">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${u.role === 'admin' ? 'bg-carbono text-marfim' : 'bg-gray-100 text-gray-600'}`}>
                      {u.role === 'admin' ? 'Admin' : 'Editor'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">{new Date(u.created_at).toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">Nenhum usuário cadastrado</div>
          )}
        </div>
      )}
    </div>
  )
}
