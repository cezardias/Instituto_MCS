import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

// ─── helpers ─────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem('mcs_token') || ''
const getUser = (): any => { try { return JSON.parse(localStorage.getItem('mcs_user') || '{}') } catch { return {} } }
const authH = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` })
const TENANT = 'instituto-mcs'

// ─── types ───────────────────────────────────────────────────────────
interface Stats { alunos_ativos: number; projetos_em_execucao: number; total_noticias: number; total_usuarios: number; pessoas_beneficiadas: number; recursos_captados: number; alunos_por_area: {area:string,count:number}[]; projetos_por_status: {status:string,count:number}[] }
interface News { id:number; title:string; category:string; content:string; image_url:string|null; created_at:string }
interface Project { id:number; title:string; status:string; area:string; location:string; beneficiados:number; budget:number; start_date:string; end_date:string; description:string; created_at:string }
interface Aluno { id:number; name:string; email:string; phone:string; area:string; status:string; birth_date:string; created_at:string }
interface User { id:number; name:string; email:string; role:string; created_at:string }

// ─── sidebar config ───────────────────────────────────────────────────
const SIDEBAR = [
  { group: 'GESTÃO', items: [
    { id:'overview', label:'Dashboard Executivo', icon:'⊞' },
    { id:'projetos', label:'Projetos', icon:'🚀' },
    { id:'alunos', label:'Alunos', icon:'🎓' },
    { id:'news', label:'Notícias', icon:'📰' },
    { id:'parceiros', label:'Parceiros', icon:'🤝' },
  ]},
  { group: 'FINANCEIRO', items: [
    { id:'financeiro', label:'Recursos Recebidos', icon:'💰' },
    { id:'despesas', label:'Despesas', icon:'📉' },
    { id:'prestacao', label:'Prestação de Contas', icon:'📋' },
  ]},
  { group: 'MONITORAMENTO', items: [
    { id:'indicadores', label:'Indicadores', icon:'📊' },
    { id:'relatorios', label:'Relatórios', icon:'📄' },
    { id:'impacto', label:'Impacto Social', icon:'🌱' },
  ]},
  { group: 'GOVERNANÇA', items: [
    { id:'documentos', label:'Documentos', icon:'🗂️' },
    { id:'compliance', label:'Compliance', icon:'✅' },
    { id:'canal', label:'Canal de Denúncias', icon:'🔔' },
  ]},
  { group: 'ADMIN', items: [
    { id:'users', label:'Usuários', icon:'👥' },
    { id:'config', label:'Configurações', icon:'⚙️' },
  ]},
]

const STATUS_LABELS: Record<string,string> = { em_execucao:'Em Execução', em_planejamento:'Em Planejamento', concluido:'Concluído', suspenso:'Suspenso' }
const STATUS_COLORS: Record<string,string> = { em_execucao:'bg-green-100 text-green-700', em_planejamento:'bg-blue-100 text-blue-700', concluido:'bg-gray-100 text-gray-600', suspenso:'bg-red-100 text-red-600' }
const AREAS = ['Educação','Cultura','Esporte','Saúde','Meio Ambiente','Geração de Renda']
const NEWS_CATS = ['Projetos','Educação','Eventos','Parcerias','Institucional','Saúde','Esporte','Cultura']

// ─── Mini-chart helpers (pure SVG) ───────────────────────────────────
function DonutChart({ data, total, colors }: { data:{label:string,value:number}[], total:number, colors:string[] }) {
  let offset = 0
  const r = 36; const cx = 44; const cy = 44; const circ = 2 * Math.PI * r
  const slices = data.map((d,i) => {
    const pct = d.value / total
    const dash = pct * circ
    const slice = <circle key={i} r={r} cx={cx} cy={cy} fill="none" stroke={colors[i % colors.length]} strokeWidth={14} strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-offset * circ} style={{transform:'rotate(-90deg)',transformOrigin:`${cx}px ${cy}px`}} />
    offset += pct
    return slice
  })
  return (
    <svg width={88} height={88} viewBox="0 0 88 88">
      {slices}
      <text x={cx} y={cy+1} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="bold" fill="#1a1a1a">{total}</text>
    </svg>
  )
}

function BarChart({ data }: { data:{label:string,value:number}[] }) {
  const max = Math.max(...data.map(d=>d.value), 1)
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="text-[11px] text-gray-500 w-28 shrink-0 truncate">{d.label}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-2">
            <div className="bg-dourado h-2 rounded-full transition-all" style={{width:`${(d.value/max)*100}%`}} />
          </div>
          <span className="text-[11px] font-bold text-carbono w-8 text-right">{d.value}</span>
        </div>
      ))}
    </div>
  )
}

function Sparkline({ points, color='#C9A84C' }: { points:number[], color?:string }) {
  if (!points.length) return null
  const max = Math.max(...points, 1); const min = Math.min(...points, 0)
  const w = 200; const h = 60
  const xs = points.map((_,i) => (i / (points.length-1)) * w)
  const ys = points.map(p => h - ((p - min) / (max - min || 1)) * h * 0.8 - h * 0.1)
  const path = xs.map((x,i) => `${i===0?'M':'L'}${x},${ys[i]}`).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="w-full">
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')
  const [collapsed, setCollapsed] = useState(false)
  const user = getUser()

  useEffect(() => { if (!getToken()) navigate('/login') }, [navigate])

  const logout = () => { localStorage.removeItem('mcs_token'); localStorage.removeItem('mcs_user'); navigate('/login') }

  const currentLabel = SIDEBAR.flatMap(g=>g.items).find(i=>i.id===tab)?.label || 'Dashboard'

  return (
    <div className="flex h-screen bg-[#f5f5f0] font-sans overflow-hidden">

      {/* ── Sidebar ────────────────────────────────────────────── */}
      <aside className={`${collapsed ? 'w-16' : 'w-60'} bg-[#0f2027] text-white flex flex-col transition-all duration-300 shrink-0 overflow-hidden`}>
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-4 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
          <img src="/logo.png" alt="MCS" className="h-9 w-9 object-contain rounded-lg bg-white p-1 shrink-0" />
          {!collapsed && (
            <div>
              <p className="font-bold text-xs leading-tight">Instituto MCS</p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">Admin</p>
            </div>
          )}
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {SIDEBAR.map(group => (
            <div key={group.group}>
              {!collapsed && <p className="text-[9px] text-white/30 uppercase tracking-widest px-3 pb-1">{group.group}</p>}
              {group.items.map(item => (
                <button key={item.id} onClick={() => setTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all mb-0.5
                    ${tab === item.id ? 'bg-dourado/90 text-[#0f2027]' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="text-base shrink-0">{item.icon}</span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* User + logout */}
        <div className={`border-t border-white/10 p-3 space-y-1`}>
          {!collapsed && (
            <div className="flex items-center gap-2 px-2 py-1">
              <div className="w-7 h-7 rounded-full bg-dourado flex items-center justify-center text-[#0f2027] font-bold text-xs shrink-0">{user.name?.[0] || 'A'}</div>
              <div className="overflow-hidden">
                <p className="text-[11px] font-bold truncate">{user.name || 'Admin'}</p>
                <p className="text-[10px] text-white/40 truncate">{user.role === 'admin' ? 'Administrador' : 'Editor'}</p>
              </div>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/50 hover:text-white hover:bg-white/10 transition-colors">
            <span>{collapsed ? '▶' : '◀'}</span>
            {!collapsed && 'Recolher menu'}
          </button>
          <button onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors">
            <span>🚪</span>
            {!collapsed && 'Sair'}
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-6 h-14 flex items-center justify-between shrink-0">
          <div>
            <h1 className="font-bold text-sm text-carbono">{currentLabel}</h1>
            <p className="text-[10px] text-gray-400">Painel administrativo do Instituto MCS</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">🗓 Jan–Mai / 2025</span>
            <button className="relative p-2 hover:bg-gray-100 rounded-lg">
              <span>🔔</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
              <div className="w-6 h-6 rounded-full bg-dourado flex items-center justify-center text-carbono text-xs font-bold">{user.name?.[0]||'A'}</div>
              <div>
                <p className="text-[11px] font-bold text-carbono">{user.name||'Admin'}</p>
                <p className="text-[9px] text-gray-400">{user.role==='admin'?'Diretor Executivo':'Editor'}</p>
              </div>
            </div>
            <a href="/" target="_blank" className="text-[10px] font-bold border border-dourado text-dourado px-3 py-1.5 rounded-full hover:bg-dourado hover:text-carbono transition-colors">VER SITE →</a>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {tab === 'overview'    && <OverviewTab />}
          {tab === 'projetos'    && <ProjetosTab />}
          {tab === 'alunos'      && <AlunosTab />}
          {tab === 'news'        && <NewsTab />}
          {tab === 'users'       && <UsersTab />}
          {!['overview','projetos','alunos','news','users'].includes(tab) && <ComingSoon label={currentLabel} />}
        </main>
      </div>
    </div>
  )
}

// ─── Coming Soon placeholder ─────────────────────────────────────────
function ComingSoon({ label }: { label:string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="text-5xl mb-4">🚧</div>
      <h3 className="font-bold text-carbono">{label}</h3>
      <p className="text-gray-400 text-sm mt-2">Esta seção está em desenvolvimento.</p>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════════════════════════════════
function OverviewTab() {
  const [stats, setStats] = useState<Stats|null>(null)

  useEffect(() => {
    fetch('/api/stats', { headers: authH() })
      .then(r => r.json()).then(setStats).catch(() => {})
  }, [])

  const kpis = [
    { label:'Pessoas Beneficiadas', value: stats?.pessoas_beneficiadas ? stats.pessoas_beneficiadas.toLocaleString('pt-BR') : '15.000+', delta:'+12,4%', icon:'👥', color:'bg-blue-50 text-blue-600', border:'border-blue-100' },
    { label:'Alunos Ativos', value: stats?.alunos_ativos?.toLocaleString('pt-BR') || '3.842', delta:'+8,7%', icon:'🎓', color:'bg-emerald-50 text-emerald-600', border:'border-emerald-100' },
    { label:'Projetos em Execução', value: stats?.projetos_em_execucao?.toString() || '18', delta:'+2', icon:'🚀', color:'bg-orange-50 text-orange-600', border:'border-orange-100' },
    { label:'Recursos Captados', value: stats?.recursos_captados ? `R$ ${(stats.recursos_captados/1e6).toFixed(2)} mi` : 'R$ 8,75 mi', delta:'+18,6%', icon:'💰', color:'bg-yellow-50 text-yellow-600', border:'border-yellow-100' },
    { label:'Taxa de Execução', value:'78,3%', delta:'+6,2 p.p.', icon:'✅', color:'bg-purple-50 text-purple-600', border:'border-purple-100' },
  ]

  const donutColors = ['#22c55e','#3b82f6','#f59e0b','#ef4444']
  const projStatus = stats?.projetos_por_status || [
    {status:'em_execucao',count:12},{status:'em_planejamento',count:3},{status:'concluido',count:2},{status:'suspenso',count:1}
  ]
  const projTotal = projStatus.reduce((s,p)=>s+p.count,0) || 18

  const areaData = stats?.alunos_por_area?.length
    ? stats.alunos_por_area.map(a=>({label:a.area, value:a.count}))
    : [
        {label:'Educação',value:1682},{label:'Cultura',value:1208},{label:'Esporte',value:642},{label:'Formação Profissional',value:310}
      ]

  const alertas = [
    { icon:'⚠️', text:'3 prestações de contas vencem nos próximos 15 dias', sub:'Acesse para regularizar' },
    { icon:'📋', text:'2 relatórios aguardando aprovação', sub:'Acesse para revisar' },
    { icon:'📅', text:'7 documentos próximos do vencimento', sub:'Acesse para atualizar' },
    { icon:'🔔', text:'1 denúncia em análise', sub:'Acompanhe no Canal de Denúncias' },
  ]

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map(k => (
          <div key={k.label} className={`bg-white rounded-2xl p-5 border ${k.border} shadow-sm`}>
            <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl text-xl mb-3 ${k.color}`}>{k.icon}</div>
            <p className="font-serif text-2xl font-bold text-carbono leading-tight">{k.value}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">{k.label}</p>
            <span className="text-[10px] font-bold text-emerald-500">{k.delta} vs. período anterior</span>
          </div>
        ))}
      </div>

      {/* Row 2: Resumo Financeiro | Donut Recursos | Alunos por Área */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Resumo Financeiro */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-sm text-carbono">Resumo Financeiro</h3>
            <span className="text-[10px] text-gray-400">ⓘ</span>
          </div>
          <div className="flex gap-6 mb-4">
            <div><p className="text-[10px] text-gray-400 uppercase tracking-widest">Receitas</p><p className="font-bold text-emerald-600">R$ 8,75 mi</p><span className="text-[10px] text-emerald-500">+18,5%</span></div>
            <div><p className="text-[10px] text-gray-400 uppercase tracking-widest">Despesas</p><p className="font-bold text-red-500">R$ 6,32 mi</p><span className="text-[10px] text-red-400">+14,3%</span></div>
            <div><p className="text-[10px] text-gray-400 uppercase tracking-widest">Saldo</p><p className="font-bold text-carbono">R$ 2,43 mi</p><span className="text-[10px] text-emerald-500">+25,9%</span></div>
          </div>
          <Sparkline points={[2,3,5,4,6,5,7,8,7,9]} color="#22c55e" />
          <Sparkline points={[1,2,3,3,4,3,5,5,6,7]} color="#ef4444" />
          <p className="text-[10px] text-dourado font-bold mt-2 cursor-pointer hover:underline">VER RELATÓRIO FINANCEIRO →</p>
        </div>

        {/* Distribuição Recursos */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-carbono">Distribuição dos Recursos</h3>
          </div>
          <div className="flex items-center gap-6">
            <DonutChart
              data={[{label:'Públicos',value:4.68},{label:'Privados',value:2.91},{label:'Patrocínio',value:0.94},{label:'Convênios',value:0.22}]}
              total={8.75} colors={donutColors} />
            <div className="space-y-2 flex-1">
              {[
                {label:'Rec. Públicos',valor:'R$ 4,68 mi',pct:'53,4%',cor:'bg-green-500'},
                {label:'Rec. Privados',valor:'R$ 2,91 mi',pct:'33,3%',cor:'bg-blue-500'},
                {label:'Patrocínios',valor:'R$ 0,94 mi',pct:'10,7%',cor:'bg-yellow-400'},
                {label:'Convênios',valor:'R$ 0,22 mi',pct:'2,5%',cor:'bg-red-400'},
              ].map(d => (
                <div key={d.label} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${d.cor}`} />
                  <span className="text-[10px] text-gray-500 flex-1">{d.label}</span>
                  <span className="text-[10px] font-bold text-carbono">{d.pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alunos por Área */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-sm text-carbono mb-4">Alunos por Área de Atuação</h3>
          <BarChart data={areaData} />
          <p className="text-[10px] text-dourado font-bold mt-4 cursor-pointer hover:underline">VER RELATÓRIO DE ALUNOS →</p>
        </div>
      </div>

      {/* Row 3: Impacto Social | Projetos por Status | Alertas */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Impacto Social */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-sm text-carbono mb-3">Evolução de Impacto Social</h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center"><p className="font-bold text-carbono">1.284</p><p className="text-[9px] text-gray-400 uppercase">Empregos Gerados</p></div>
            <div className="text-center"><p className="font-bold text-carbono">R$ 3,21 mi</p><p className="text-[9px] text-gray-400 uppercase">Renda Gerada</p></div>
            <div className="text-center"><p className="font-bold text-carbono">2.193</p><p className="text-[9px] text-gray-400 uppercase">Certif. Emitidos</p></div>
          </div>
          <Sparkline points={[2,2.5,3,3.5,3,4,4.5,4,5,5.5]} color="#C9A84C" />
          <p className="text-[10px] text-dourado font-bold mt-2 cursor-pointer hover:underline">VER RELATÓRIO DE IMPACTO →</p>
        </div>

        {/* Projetos por Status */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-sm text-carbono mb-4">Projetos por Status</h3>
          <div className="flex items-center gap-6">
            <DonutChart
              data={projStatus.map(p=>({label:STATUS_LABELS[p.status]||p.status, value:p.count}))}
              total={projTotal}
              colors={['#22c55e','#3b82f6','#6b7280','#ef4444']}
            />
            <div className="space-y-2 flex-1">
              {projStatus.map((p,i) => (
                <div key={p.status} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full`} style={{backgroundColor:['#22c55e','#3b82f6','#6b7280','#ef4444'][i%4]}} />
                  <span className="text-[10px] text-gray-500 flex-1">{STATUS_LABELS[p.status]||p.status}</span>
                  <span className="text-[10px] font-bold text-carbono">{p.count}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-dourado font-bold mt-4 cursor-pointer hover:underline">VER TODOS OS PROJETOS →</p>
        </div>

        {/* Alertas */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-carbono">Alertas e Pendências</h3>
            <span className="text-[10px] text-dourado font-bold cursor-pointer hover:underline">VER TODOS</span>
          </div>
          <div className="space-y-3">
            {alertas.map((a,i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-yellow-50 transition-colors cursor-pointer">
                <span className="text-lg shrink-0">{a.icon}</span>
                <div>
                  <p className="text-[11px] font-semibold text-carbono leading-tight">{a.text}</p>
                  <p className="text-[10px] text-dourado mt-0.5">{a.sub}</p>
                </div>
                <span className="text-gray-300 ml-auto">›</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom banner */}
      <div className="bg-carbono text-marfim rounded-2xl px-8 py-6 grid grid-cols-2 md:grid-cols-5 gap-6">
        <div className="col-span-2 md:col-span-1">
          <p className="font-bold text-sm mb-1">Nosso propósito em números</p>
          <p className="text-[11px] text-white/50">Impacto consolidado do Instituto MCS</p>
        </div>
        {[{v:'27',l:'Municípios Atendidos'},{v:'03',l:'Estados Atendidos'},{v:'86',l:'Comunidades Impactadas'},{v:'11',l:'Anos de Atuação'}].map(n => (
          <div key={n.l} className="text-center">
            <p className="font-serif text-3xl font-bold text-dourado">{n.v}</p>
            <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1">{n.l}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// PROJETOS TAB
// ═══════════════════════════════════════════════════════════════════
function ProjetosTab() {
  const [items, setItems] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Project|null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const blank = { title:'', status:'em_execucao', area:'Educação', location:'', beneficiados:0, budget:0, start_date:'', end_date:'', description:'' }
  const [form, setForm] = useState<any>(blank)

  const load = useCallback(async () => {
    setLoading(true)
    try { const r = await fetch(`/api/projects?tenant_id=${TENANT}`); setItems(await r.json()) } catch { setItems([]) }
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const openNew = () => { setEditing(null); setForm(blank); setError(''); setShowForm(true) }
  const openEdit = (p: Project) => { setEditing(p); setForm({...p}); setError(''); setShowForm(true) }
  const del = async (id: number) => { if(!confirm('Excluir projeto?')) return; await fetch(`/api/projects/${id}`,{method:'DELETE',headers:authH()}); load() }
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('')
    const method = editing ? 'PUT' : 'POST'
    const url = editing ? `/api/projects/${editing.id}` : '/api/projects'
    try {
      const r = await fetch(url, {method, headers:authH(), body:JSON.stringify(form)})
      if (!r.ok) { const d = await r.json(); setError(d.error || 'Erro'); } else { setShowForm(false); load() }
    } catch { setError('Erro de conexão') }
    setSaving(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl text-carbono">Projetos</h2>
        <button onClick={openNew} className="bg-carbono text-marfim px-5 py-2.5 rounded-full text-sm font-bold hover:bg-gray-800 flex items-center gap-2">+ Novo Projeto</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between mb-6">
              <h3 className="font-serif text-xl text-carbono">{editing ? 'Editar Projeto' : 'Novo Projeto'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 text-2xl">×</button>
            </div>
            {error && <div className="mb-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
            <form onSubmit={save} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label-dash">Título *</label>
                  <input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="input-field" placeholder="Nome do projeto" />
                </div>
                <div>
                  <label className="label-dash">Status</label>
                  <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} className="input-field">
                    {Object.entries(STATUS_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-dash">Área</label>
                  <select value={form.area} onChange={e=>setForm({...form,area:e.target.value})} className="input-field">
                    {AREAS.map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label-dash">Localização *</label>
                  <input required value={form.location} onChange={e=>setForm({...form,location:e.target.value})} className="input-field" placeholder="Cidade / Estado" />
                </div>
                <div>
                  <label className="label-dash">Beneficiados</label>
                  <input type="number" value={form.beneficiados} onChange={e=>setForm({...form,beneficiados:+e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="label-dash">Orçamento (R$)</label>
                  <input type="number" value={form.budget} onChange={e=>setForm({...form,budget:+e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="label-dash">Início</label>
                  <input type="date" value={form.start_date} onChange={e=>setForm({...form,start_date:e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="label-dash">Término</label>
                  <input type="date" value={form.end_date} onChange={e=>setForm({...form,end_date:e.target.value})} className="input-field" />
                </div>
                <div className="col-span-2">
                  <label className="label-dash">Descrição</label>
                  <textarea rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="input-field resize-none" placeholder="Descreva o projeto..." />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-full text-sm font-bold hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 bg-carbono text-marfim py-3 rounded-full text-sm font-bold hover:bg-gray-800 disabled:opacity-60">{saving ? 'Salvando...' : editing ? 'Salvar' : 'Criar Projeto'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <div className="text-center py-20 text-gray-400">Carregando...</div> : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              <th className="th-cell">Título</th><th className="th-cell">Área</th><th className="th-cell">Status</th>
              <th className="th-cell">Localização</th><th className="th-cell">Beneficiados</th><th className="th-cell">Orçamento</th><th className="th-cell" />
            </tr></thead>
            <tbody>
              {items.length === 0 && <tr><td colSpan={7} className="text-center py-12 text-gray-400">Nenhum projeto cadastrado</td></tr>}
              {items.map(p => (
                <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="td-cell font-semibold text-carbono">{p.title}</td>
                  <td className="td-cell text-gray-500">{p.area}</td>
                  <td className="td-cell"><span className={`text-[10px] font-bold px-2 py-1 rounded-full ${STATUS_COLORS[p.status]||'bg-gray-100 text-gray-600'}`}>{STATUS_LABELS[p.status]||p.status}</span></td>
                  <td className="td-cell text-gray-500">{p.location}</td>
                  <td className="td-cell text-gray-500">{p.beneficiados?.toLocaleString('pt-BR') || '—'}</td>
                  <td className="td-cell text-gray-500">{p.budget ? `R$ ${p.budget.toLocaleString('pt-BR')}` : '—'}</td>
                  <td className="td-cell">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="text-xs font-bold border border-gray-200 px-3 py-1.5 rounded-full hover:bg-gray-50">Editar</button>
                      <button onClick={() => del(p.id)} className="text-xs font-bold border border-red-200 text-red-500 px-3 py-1.5 rounded-full hover:bg-red-50">Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// ALUNOS TAB
// ═══════════════════════════════════════════════════════════════════
function AlunosTab() {
  const [items, setItems] = useState<Aluno[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Aluno|null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const blank = { name:'', email:'', phone:'', area:'Educação', status:'ativo', birth_date:'' }
  const [form, setForm] = useState<any>(blank)

  const load = useCallback(async () => {
    setLoading(true)
    try { const r = await fetch('/api/alunos', {headers:authH()}); setItems(await r.json()) } catch { setItems([]) }
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const openNew = () => { setEditing(null); setForm(blank); setError(''); setShowForm(true) }
  const openEdit = (a: Aluno) => { setEditing(a); setForm({...a}); setError(''); setShowForm(true) }
  const del = async (id: number) => { if(!confirm('Excluir aluno?')) return; await fetch(`/api/alunos/${id}`,{method:'DELETE',headers:authH()}); load() }
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('')
    const method = editing ? 'PUT' : 'POST'
    const url = editing ? `/api/alunos/${editing.id}` : '/api/alunos'
    try {
      const r = await fetch(url, {method, headers:authH(), body:JSON.stringify(form)})
      if (!r.ok) { const d = await r.json(); setError(d.error || 'Erro') } else { setShowForm(false); load() }
    } catch { setError('Erro de conexão') }
    setSaving(false)
  }

  const filtered = items.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.area.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl text-carbono">Alunos</h2>
          <p className="text-sm text-gray-400">{items.length} alunos cadastrados</p>
        </div>
        <div className="flex gap-3">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar aluno..." className="border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-dourado w-48" />
          <button onClick={openNew} className="bg-carbono text-marfim px-5 py-2.5 rounded-full text-sm font-bold hover:bg-gray-800 flex items-center gap-2">+ Novo Aluno</button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-lg p-8">
            <div className="flex justify-between mb-6">
              <h3 className="font-serif text-xl text-carbono">{editing ? 'Editar Aluno' : 'Novo Aluno'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 text-2xl">×</button>
            </div>
            {error && <div className="mb-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
            <form onSubmit={save} className="space-y-4">
              <div>
                <label className="label-dash">Nome *</label>
                <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="input-field" placeholder="Nome completo" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-dash">E-mail</label>
                  <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="label-dash">Telefone</label>
                  <input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="label-dash">Área</label>
                  <select value={form.area} onChange={e=>setForm({...form,area:e.target.value})} className="input-field">
                    {AREAS.map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-dash">Status</label>
                  <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} className="input-field">
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                    <option value="formado">Formado</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label-dash">Data de Nascimento</label>
                  <input type="date" value={form.birth_date} onChange={e=>setForm({...form,birth_date:e.target.value})} className="input-field" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-full text-sm font-bold hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 bg-carbono text-marfim py-3 rounded-full text-sm font-bold hover:bg-gray-800 disabled:opacity-60">{saving ? 'Salvando...' : editing ? 'Salvar' : 'Cadastrar Aluno'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <div className="text-center py-20 text-gray-400">Carregando...</div> : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              <th className="th-cell">Nome</th><th className="th-cell">E-mail</th><th className="th-cell">Área</th>
              <th className="th-cell">Status</th><th className="th-cell">Nascimento</th><th className="th-cell" />
            </tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-gray-400">Nenhum aluno encontrado</td></tr>}
              {filtered.map(a => (
                <tr key={a.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="td-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-dourado/20 text-dourado flex items-center justify-center font-bold text-sm shrink-0">{a.name[0]}</div>
                      <span className="font-semibold text-carbono">{a.name}</span>
                    </div>
                  </td>
                  <td className="td-cell text-gray-500">{a.email||'—'}</td>
                  <td className="td-cell text-gray-500">{a.area}</td>
                  <td className="td-cell">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${a.status==='ativo'?'bg-green-100 text-green-700':a.status==='formado'?'bg-blue-100 text-blue-700':'bg-gray-100 text-gray-600'}`}>
                      {a.status.charAt(0).toUpperCase()+a.status.slice(1)}
                    </span>
                  </td>
                  <td className="td-cell text-gray-500">{a.birth_date ? new Date(a.birth_date+'T00:00:00').toLocaleDateString('pt-BR') : '—'}</td>
                  <td className="td-cell">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(a)} className="text-xs font-bold border border-gray-200 px-3 py-1.5 rounded-full hover:bg-gray-50">Editar</button>
                      <button onClick={() => del(a.id)} className="text-xs font-bold border border-red-200 text-red-500 px-3 py-1.5 rounded-full hover:bg-red-50">Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// NEWS TAB
// ═══════════════════════════════════════════════════════════════════
function NewsTab() {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<News|null>(null)
  const [form, setForm] = useState({ title:'', category:'Projetos', content:'', image_url:'' })
  const [imageFile, setImageFile] = useState<File|null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try { const r = await fetch(`/api/news?tenant_id=${TENANT}`); const d = await r.json(); setNews(Array.isArray(d)?d:[]) } catch { setNews([]) }
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const openNew = () => { setEditing(null); setForm({title:'',category:'Projetos',content:'',image_url:''}); setImageFile(null); setError(''); setShowForm(true) }
  const openEdit = (item: News) => { setEditing(item); setForm({title:item.title,category:item.category,content:item.content,image_url:item.image_url||''}); setImageFile(null); setError(''); setShowForm(true) }
  const del = async (id: number) => { if(!confirm('Excluir notícia?')) return; await fetch(`/api/news/${id}`,{method:'DELETE',headers:authH()}); load() }
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('')
    let imageUrl = form.image_url
    if (imageFile) {
      const fd = new FormData(); fd.append('image', imageFile)
      try { const r = await fetch('/api/upload',{method:'POST',headers:{Authorization:`Bearer ${getToken()}`},body:fd}); const d = await r.json(); if(d.url) imageUrl = d.url } catch { setError('Falha no upload'); setSaving(false); return }
    }
    const method = editing ? 'PUT' : 'POST'
    const url = editing ? `/api/news/${editing.id}` : '/api/news'
    try {
      const r = await fetch(url,{method,headers:authH(),body:JSON.stringify({...form,image_url:imageUrl})})
      if (!r.ok) { const d = await r.json(); setError(d.error||'Erro') } else { setShowForm(false); load() }
    } catch { setError('Erro de conexão') }
    setSaving(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="font-serif text-2xl text-carbono">Notícias</h2><p className="text-sm text-gray-400">{news.length} publicadas</p></div>
        <button onClick={openNew} className="bg-carbono text-marfim px-5 py-2.5 rounded-full text-sm font-bold hover:bg-gray-800 flex items-center gap-2">+ Nova Notícia</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between mb-6">
              <h3 className="font-serif text-xl text-carbono">{editing ? 'Editar Notícia' : 'Nova Notícia'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 text-2xl">×</button>
            </div>
            {error && <div className="mb-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
            <form onSubmit={save} className="space-y-4">
              <div><label className="label-dash">Título *</label><input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="input-field" placeholder="Título da notícia" /></div>
              <div><label className="label-dash">Categoria</label><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="input-field">{NEWS_CATS.map(c=><option key={c}>{c}</option>)}</select></div>
              <div><label className="label-dash">Conteúdo *</label><textarea required rows={5} value={form.content} onChange={e=>setForm({...form,content:e.target.value})} className="input-field resize-none" placeholder="Texto da notícia..." /></div>
              <div>
                <label className="label-dash">Imagem</label>
                <input type="file" accept="image/*" onChange={e=>setImageFile(e.target.files?.[0]||null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-carbono file:text-marfim hover:file:bg-gray-700 cursor-pointer" />
                {(form.image_url||imageFile) && <p className="text-xs text-green-600 mt-1">{imageFile ? `📎 ${imageFile.name}` : `✅ Imagem: ${form.image_url}`}</p>}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-full text-sm font-bold">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 bg-carbono text-marfim py-3 rounded-full text-sm font-bold disabled:opacity-60">{saving ? 'Salvando...' : editing ? 'Salvar' : 'Publicar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <div className="text-center py-20 text-gray-400">Carregando...</div> :
      news.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
          <p className="text-4xl mb-4">📰</p>
          <p className="text-gray-500 font-semibold mb-4">Nenhuma notícia publicada</p>
          <button onClick={openNew} className="bg-carbono text-marfim px-6 py-3 rounded-full text-sm font-bold hover:bg-gray-800">Criar primeira notícia</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {news.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {item.image_url && <img src={item.image_url} alt={item.title} className="w-full h-32 object-cover" />}
              <div className="p-5">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-dourado/10 text-dourado px-2 py-1 rounded-full">{item.category}</span>
                <p className="font-bold text-carbono mt-2 text-sm leading-snug">{item.title}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(item.created_at).toLocaleDateString('pt-BR')}</p>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => openEdit(item)} className="flex-1 text-xs font-bold border border-gray-200 py-2 rounded-full hover:bg-gray-50">Editar</button>
                  <button onClick={() => del(item.id)} className="flex-1 text-xs font-bold border border-red-200 text-red-500 py-2 rounded-full hover:bg-red-50">Excluir</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// USERS TAB
// ═══════════════════════════════════════════════════════════════════
function UsersTab() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'user' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try { const r = await fetch('/api/users',{headers:authH()}); const d = await r.json(); setUsers(Array.isArray(d)?d:[]) } catch { setUsers([]) }
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const r = await fetch('/api/users',{method:'POST',headers:authH(),body:JSON.stringify(form)})
      if (!r.ok) { const d = await r.json(); setError(d.error||'Erro') } else { setShowForm(false); setForm({name:'',email:'',password:'',role:'user'}); load() }
    } catch { setError('Erro de conexão') }
    setSaving(false)
  }
  const del = async (id: number) => { if(!confirm('Excluir usuário?')) return; await fetch(`/api/users/${id}`,{method:'DELETE',headers:authH()}); load() }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="font-serif text-2xl text-carbono">Usuários</h2><p className="text-sm text-gray-400">{users.length} cadastrados</p></div>
        <button onClick={() => { setShowForm(true); setError('') }} className="bg-carbono text-marfim px-5 py-2.5 rounded-full text-sm font-bold hover:bg-gray-800 flex items-center gap-2">+ Novo Usuário</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-md p-8">
            <div className="flex justify-between mb-6">
              <h3 className="font-serif text-xl text-carbono">Novo Usuário</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 text-2xl">×</button>
            </div>
            {error && <div className="mb-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
            <form onSubmit={save} className="space-y-4">
              <div><label className="label-dash">Nome *</label><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="input-field" /></div>
              <div><label className="label-dash">E-mail *</label><input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="input-field" /></div>
              <div><label className="label-dash">Senha *</label><input required type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="input-field" /></div>
              <div><label className="label-dash">Perfil</label>
                <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} className="input-field">
                  <option value="user">Editor</option><option value="admin">Administrador</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-full text-sm font-bold">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 bg-carbono text-marfim py-3 rounded-full text-sm font-bold disabled:opacity-60">{saving ? 'Criando...' : 'Criar Usuário'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <div className="text-center py-20 text-gray-400">Carregando...</div> : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              <th className="th-cell">Nome</th><th className="th-cell">E-mail</th><th className="th-cell">Perfil</th><th className="th-cell">Criado em</th><th className="th-cell" />
            </tr></thead>
            <tbody>
              {users.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-gray-400">Nenhum usuário</td></tr>}
              {users.map(u => (
                <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="td-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-carbono text-marfim flex items-center justify-center font-bold text-sm shrink-0">{u.name[0]}</div>
                      <span className="font-semibold text-carbono">{u.name}</span>
                    </div>
                  </td>
                  <td className="td-cell text-gray-500">{u.email}</td>
                  <td className="td-cell">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${u.role==='admin'?'bg-carbono text-marfim':'bg-gray-100 text-gray-600'}`}>{u.role==='admin'?'Admin':'Editor'}</span>
                  </td>
                  <td className="td-cell text-gray-400 text-xs">{new Date(u.created_at).toLocaleDateString('pt-BR')}</td>
                  <td className="td-cell"><button onClick={() => del(u.id)} className="text-xs font-bold text-red-400 hover:text-red-600">Excluir</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
