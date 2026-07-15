import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import AnamnesisModal from '../components/AnamnesisModal'

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
interface Transaction { id:number; tenant_id:string; type:string; category:string; description:string; amount:number; date:string; status:string; receipt_url?:string; expected_date?:string; created_at:string }
interface AccountabilityReport { id:number; tenant_id:string; project_id:number; project_name?:string; title:string; document_url:string; status:string; created_at:string }
interface DocumentItem { id:number; title:string; type:string; document_url:string; created_at:string }
interface Denuncia { id:number; name:string|null; email:string|null; subject:string; message:string; status:string; created_at:string }
interface VideoComment { id:number; user_name:string; comment:string; created_at:string }
interface Video { id:number; title:string; description:string; author:string; youtube_url:string; category:string; likes:number; userLiked:boolean; comments:VideoComment[]; created_at:string }
interface Comunicado { id:number; title:string; message:string; author_name:string; created_at:string }
interface PassaporteItem { id:number; user_name?:string; badge_name:string; description:string; points:number; created_at:string }
interface OficineiroRegistration { id:number; tenant_id:string; name:string; email:string; phone:string; cpf:string; birth_date:string; education:string; experience:string; contribution:string; status:string; created_at:string }

// ─── sidebar config ───────────────────────────────────────────────────
const SIDEBAR = [
  { group: 'GESTÃO', items: [
    { id:'overview', label:'Dashboard Executivo', icon:'⊞', roles:['admin', 'diretoria'] },
    { id:'projetos', label:'Projetos', icon:'🚀', roles:['admin', 'coordenacao', 'oficineiro'] },
    { id:'turmas', label:'Turmas e Frequência', icon:'🏫', roles:['admin', 'diretoria', 'coordenacao', 'oficineiro', 'aluno', 'responsavel'] },
    { id:'alunos', label:'Alunos', icon:'🎓', roles:['admin', 'coordenacao', 'oficineiro', 'responsavel'] },
    { id:'avaliacoes', label:'Avaliações e Atividades', icon:'📝', roles:['admin', 'coordenacao', 'oficineiro', 'diretoria', 'aluno', 'responsavel'] },
    { id:'comunicados', label:'Comunicados', icon:'📢', roles:['admin', 'aluno', 'responsavel', 'oficineiro', 'coordenacao', 'diretoria'] },
    { id:'news', label:'Notícias do Site', icon:'📰', roles:['admin'] },
    { id:'parceiros', label:'Parceiros', icon:'🤝', roles:['admin'] },
  ]},
  { group: 'FINANCEIRO', items: [
    { id:'financeiro', label:'Recursos Recebidos', icon:'💰', roles:['admin', 'diretoria'] },
    { id:'despesas', label:'Despesas', icon:'📉', roles:['admin', 'diretoria', 'oficineiro'] },
    { id:'prestacao', label:'Prestação de Contas', icon:'📋', roles:['admin', 'diretoria'] },
  ]},
  { group: 'MONITORAMENTO', items: [
    { id:'indicadores', label:'Indicadores', icon:'📊', roles:['admin', 'coordenacao'] },
    { id:'relatorios', label:'Relatórios', icon:'📄', roles:['admin', 'oficineiro'] },
    { id:'impacto', label:'Impacto Social', icon:'🌱', roles:['admin', 'coordenacao', 'diretoria'] },
  ]},
  { group: 'GOVERNANÇA', items: [
    { id:'documentos', label:'Documentos Institucionais', icon:'🗂️', roles:['admin', 'diretoria'] },
    { id:'compliance', label:'Compliance', icon:'✅', roles:['admin', 'diretoria'] },
    { id:'canal', label:'Canal de Denúncias', icon:'🔔', roles:['admin', 'diretoria'] },
  ]},
  { group: 'EAD & ALUNOS', items: [
    { id:'turmas', label:'Turmas e Frequência', icon:'📅', roles:['admin', 'diretoria', 'oficineiro', 'aluno', 'responsavel'] },
    { id:'ead', label:'Plataforma de Aulas', icon:'▶️', roles:['admin', 'aluno', 'oficineiro', 'coordenacao', 'diretoria', 'responsavel'] },
    { id:'passaporte', label:'Passaporte Cultural', icon:'🏅', roles:['admin', 'aluno'] },
    { id:'gestao_ead', label:'Gestão de Aulas', icon:'🎬', roles:['admin'] },
  ]},
  { group: 'PORTAL DOS PAIS', items: [
    { id:'autorizacoes', label:'Autorizações Digitais', icon:'✍️', roles:['admin', 'diretoria', 'responsavel'] },
  ]},
  { group: 'ADMIN', items: [
    { id:'users', label:'Usuários e Perfis', icon:'👥', roles:['admin'] },
    { id:'oficineiros_registrations', label:'Inscrições Oficineiros', icon:'🧑‍🏫', roles:['admin', 'diretoria', 'coordenacao'] },
    { id:'config', label:'Configurações', icon:'⚙️', roles:['admin'] },
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
  const user = getUser()
  
  // Find the first tab the user has access to
  const defaultTab = SIDEBAR.flatMap(g=>g.items).find(i => !i.roles || i.roles.includes(user?.role || 'user'))?.id || 'overview'
  const [tab, setTab] = useState(defaultTab)
  
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => { if (!getToken()) navigate('/login') }, [navigate])

  const logout = () => { localStorage.removeItem('mcs_token'); localStorage.removeItem('mcs_user'); navigate('/login') }

  const currentLabel = SIDEBAR.flatMap(g=>g.items).find(i=>i.id===tab)?.label || 'Dashboard'

  return (
    <div className="flex h-screen bg-[#f5f5f0] font-sans overflow-hidden">

      {/* ── Sidebar ────────────────────────────────────────────── */}
      {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 ${collapsed ? 'md:w-16' : 'md:w-60'} w-64 bg-[#0f2027] text-white flex flex-col transition-all duration-300 shrink-0 overflow-hidden`}>
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
              {group.items.filter(item => !item.roles || item.roles.includes(user.role)).map(item => (
                <button key={item.id} onClick={() => { setTab(item.id); setMobileMenuOpen(false) }}
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
          <div className="flex items-center gap-3">
            <button className="md:hidden text-xl text-gray-600 focus:outline-none" onClick={() => setMobileMenuOpen(true)}>
              ☰
            </button>
            <div>
              <h1 className="font-bold text-sm text-carbono">{currentLabel}</h1>
              <p className="text-[10px] text-gray-400 hidden sm:block">Painel administrativo do Instituto MCS</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden md:inline-block">🗓 Jan–Mai / 2025</span>
            <button className="relative p-2 hover:bg-gray-100 rounded-lg">
              <span>🔔</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
              <div className="w-6 h-6 rounded-full bg-dourado flex items-center justify-center text-carbono text-xs font-bold">{user.name?.[0]||'A'}</div>
              <div className="hidden sm:block">
                <p className="text-[11px] font-bold text-carbono">{user.name||'Admin'}</p>
                <p className="text-[9px] text-gray-400">{user.role==='admin'?'Diretor Executivo':'Editor'}</p>
              </div>
            </div>
            <a href="/" target="_blank" className="hidden sm:inline-block text-[10px] font-bold border border-dourado text-dourado px-3 py-1.5 rounded-full hover:bg-dourado hover:text-carbono transition-colors">VER SITE →</a>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {tab === 'overview'    && <OverviewTab />}
          {tab === 'projetos'    && <ProjetosTab />}
          {tab === 'alunos'      && <AlunosTab />}
          {tab === 'news'        && <NewsTab />}
          {tab === 'users'       && <UsersTab />}
          {tab === 'financeiro'  && <FinanceiroTab />}
          {tab === 'despesas'    && <DespesasTab />}
          {tab === 'prestacao'   && <AccountabilityTab />}
          {tab === 'indicadores' && <IndicadoresTab />}
          {tab === 'relatorios'  && <RelatoriosTab />}
          {tab === 'impacto'     && <ImpactoTab />}
          {tab === 'documentos'  && <DocumentosTab />}
          {tab === 'compliance'  && <ComplianceTab />}
          {tab === 'canal'       && <DenunciasTab />}
          {tab === 'ead'         && <EadTab onClose={() => setTab('overview')} />}
          {tab === 'gestao_ead'  && <GestaoEadTab />}
          {tab === 'comunicados' && <ComunicadosTab />}
          {tab === 'passaporte'  && <PassaporteTab />}
          {tab === 'autorizacoes' && <AutorizacoesTab />}
          {tab === 'turmas'      && <TurmasTab />}
          {tab === 'avaliacoes'  && <AvaliacoesTab />}
          {!['overview','projetos','alunos','news','users','financeiro','despesas','prestacao','indicadores','relatorios','impacto','documentos','compliance','canal','ead','gestao_ead','comunicados','passaporte','autorizacoes','turmas','avaliacoes'].includes(tab) && <ComingSoon label={currentLabel} />}
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-1">
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="font-serif text-2xl text-carbono">Projetos</h2>
        <button onClick={openNew} className="bg-carbono text-marfim px-5 py-2.5 rounded-full text-sm font-bold hover:bg-gray-800 flex items-center gap-2">+ Novo Projeto</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
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
  const user = getUser()
  const canEdit = user?.role === 'admin' || user?.role === 'diretoria'
  
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-serif text-2xl text-carbono">Alunos</h2>
          <p className="text-sm text-gray-400">{items.length} alunos cadastrados</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar aluno..." className="border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-dourado w-48" />
          {canEdit && <button onClick={openNew} className="bg-carbono text-marfim px-5 py-2.5 rounded-full text-sm font-bold hover:bg-gray-800 flex items-center gap-2">+ Novo Aluno</button>}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-lg p-8">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
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
                    {canEdit && (
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(a)} className="text-xs font-bold border border-gray-200 px-3 py-1.5 rounded-full hover:bg-gray-50">Editar</button>
                        <button onClick={() => del(a.id)} className="text-xs font-bold border border-red-200 text-red-500 px-3 py-1.5 rounded-full hover:bg-red-50">Excluir</button>
                      </div>
                    )}
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div><h2 className="font-serif text-2xl text-carbono">Notícias</h2><p className="text-sm text-gray-400">{news.length} publicadas</p></div>
        <button onClick={openNew} className="bg-carbono text-marfim px-5 py-2.5 rounded-full text-sm font-bold hover:bg-gray-800 flex items-center gap-2">+ Nova Notícia</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
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
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  
  const [form, setForm] = useState<any>({
    name: '', email: '', password: '', role: 'aluno',
    personal_email: '', cpf: '', rg: '', phone: '', address: '',
    birth_date: '', family_income: '', parents_profession: '', anamnesis_data: null
  })
  const [parentForm, setParentForm] = useState({
    name: '', email: '', personal_email: '', cpf: '', rg: '', phone: '', birth_date: ''
  })
  const [photo, setPhoto] = useState<File | null>(null)
  const [medicalReport, setMedicalReport] = useState<File | null>(null)
  const [anamnesisUser, setAnamnesisUser] = useState<any>(null)
  const [showAnamnesisForm, setShowAnamnesisForm] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try { const r = await fetch('/api/users',{headers:authH()}); const d = await r.json(); setUsers(Array.isArray(d)?d:[]) } catch { setUsers([]) }
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      let photo_url = ''
      if (photo) {
        const fd = new FormData()
        fd.append('image', photo)
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd })
        if (uploadRes.ok) {
          const ud = await uploadRes.json()
          photo_url = ud.url
        }
      }

      let medical_report_url = ''
      if (medicalReport) {
        const fd = new FormData()
        fd.append('image', medicalReport)
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd })
        if (uploadRes.ok) { const ud = await uploadRes.json(); medical_report_url = ud.url }
      }

      const payload = {
        ...form,
        photo_url,
        medical_report_url,
        parent: form.role === 'aluno' ? parentForm : null
      }

      const r = await fetch('/api/users',{method:'POST',headers:authH(),body:JSON.stringify(payload)})
      if (!r.ok) { 
        const d = await r.json(); setError(d.error||'Erro ao criar usuário') 
      } else { 
        setShowForm(false)
        setForm({name:'',email:'',password:'',role:'aluno',personal_email:'',cpf:'',rg:'',phone:'',address:'',birth_date:'',family_income:'',parents_profession:'',anamnesis_data:null})
        setParentForm({name:'',email:'',personal_email:'',cpf:'',rg:'',phone:'',birth_date:''})
        setPhoto(null)
        setMedicalReport(null)
        load() 
      }
    } catch { setError('Erro de conexão') }
    setSaving(false)
  }
  
  const del = async (id: number) => { if(!confirm('Excluir usuário?')) return; await fetch(`/api/users/${id}`,{method:'DELETE',headers:authH()}); load() }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div><h2 className="font-serif text-2xl text-carbono">Gestão de Usuários</h2><p className="text-sm text-gray-400">{users.length} usuários cadastrados no ecossistema</p></div>
        <button onClick={() => { setShowForm(true); setError('') }} className="bg-carbono text-marfim px-5 py-2.5 rounded-full text-sm font-bold hover:bg-gray-800 flex items-center gap-2">+ Novo Cadastro</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto pt-10 pb-20">
          <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-2xl p-8 relative">
            <div className="flex justify-between mb-6 border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-serif text-2xl text-carbono">Novo Cadastro</h3>
                <p className="text-xs text-gray-400">Preencha os dados (o login será gerado automaticamente se não informado)</p>
              </div>
              <button onClick={() => setShowForm(false)} className="text-gray-400 text-2xl hover:text-carbono">×</button>
            </div>
            {error && <div className="mb-6 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">{error}</div>}
            
            <form onSubmit={save} className="space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label-dash block mb-1">Perfil (Qual a função no Instituto?) *</label>
                  <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} className="input-field w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-dourado bg-gray-50">
                    <option value="aluno">Aluno (Cria cadastro do Pai/Mãe junto)</option>
                    <option value="oficineiro">Oficineiro (Gestão de turmas)</option>
                    <option value="coordenacao">Coordenação (Indicadores, Projetos)</option>
                    <option value="diretoria">Diretoria (Financeiro, Compliance)</option>
                    <option value="admin">Administrador (Controle Total)</option>
                  </select>
                </div>

                <div className="col-span-2"><h4 className="font-bold text-gray-600 text-sm border-b pb-2 mt-2">Dados Pessoais do Titular</h4></div>

                <div><label className="label-dash text-xs text-gray-500 font-bold block mb-1">Nome Completo *</label><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-xl text-sm" /></div>
                <div><label className="label-dash text-xs text-gray-500 font-bold block mb-1">E-mail Pessoal</label><input type="email" value={form.personal_email} onChange={e=>setForm({...form,personal_email:e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-xl text-sm" /></div>
                
                <div><label className="label-dash text-xs text-gray-500 font-bold block mb-1">CPF</label><input value={form.cpf} onChange={e=>setForm({...form,cpf:e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-xl text-sm" /></div>
                <div><label className="label-dash text-xs text-gray-500 font-bold block mb-1">RG</label><input value={form.rg} onChange={e=>setForm({...form,rg:e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-xl text-sm" /></div>
                
                <div><label className="label-dash text-xs text-gray-500 font-bold block mb-1">Telefone / WhatsApp</label><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-xl text-sm" /></div>
                <div><label className="label-dash text-xs text-gray-500 font-bold block mb-1">Endereço Completo</label><input value={form.address} onChange={e=>setForm({...form,address:e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-xl text-sm" /></div>

                <div className="col-span-2">
                  <label className="label-dash text-xs text-gray-500 font-bold block mb-1">Foto de Perfil</label>
                  <input type="file" accept="image/*" onChange={e=>setPhoto(e.target.files?.[0] || null)} className="w-full text-sm" />
                </div>
              </div>

              {form.role === 'aluno' && (
                <>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="col-span-2"><h4 className="font-bold text-gray-600 text-sm border-b pb-2">Dados Complementares do Aluno</h4></div>
                    <div><label className="label-dash text-xs text-gray-500 font-bold block mb-1">Data de Nascimento (Aluno) *</label><input type="date" required value={form.birth_date} onChange={e=>setForm({...form,birth_date:e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-xl text-sm" /></div>
                    <div><label className="label-dash text-xs text-gray-500 font-bold block mb-1">Faixa Salarial Família</label>
                      <select value={form.family_income} onChange={e=>setForm({...form,family_income:e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-xl text-sm bg-white">
                        <option value="">Selecione...</option>
                        <option value="Ate 1 salario">Até 1 salário mínimo</option>
                        <option value="1 a 3 salarios">1 a 3 salários mínimos</option>
                        <option value="3 a 5 salarios">3 a 5 salários mínimos</option>
                        <option value="Mais de 5 salarios">Mais de 5 salários mínimos</option>
                      </select>
                    </div>
                    <div><label className="label-dash text-xs text-gray-500 font-bold block mb-1">Profissão dos Pais</label><input value={form.parents_profession} onChange={e=>setForm({...form,parents_profession:e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-xl text-sm" /></div>
                    <div><label className="label-dash text-xs text-gray-500 font-bold block mb-1">Laudo Médico (Anexo)</label><input type="file" accept=".pdf,image/*" onChange={e=>setMedicalReport(e.target.files?.[0] || null)} className="w-full text-sm" /></div>
                    <div className="col-span-2 mt-2">
                      <button type="button" onClick={() => setShowAnamnesisForm(true)} className={`w-full border py-3 rounded-xl text-sm font-bold transition-colors ${form.anamnesis_data ? 'border-dourado bg-yellow-50 text-dourado' : 'border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
                        {form.anamnesis_data ? '✓ Anamnese Preenchida (Clique para editar)' : '+ Preencher Anamnese Clínica (Opcional)'}
                      </button>
                    </div>
                  </div>

                  <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 mt-6 space-y-4">
                    <h4 className="font-bold text-blue-800 text-sm border-b border-blue-200 pb-2">Dados do Responsável (Pai / Mãe)</h4>
                    <p className="text-xs text-blue-600 mb-4">Ao preencher, o sistema criará o usuário do responsável automaticamente.</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="label-dash text-xs text-blue-700 font-bold block mb-1">Nome do Responsável *</label><input required value={parentForm.name} onChange={e=>setParentForm({...parentForm,name:e.target.value})} className="w-full border border-blue-200 p-2.5 rounded-xl text-sm bg-white" /></div>
                      <div><label className="label-dash text-xs text-blue-700 font-bold block mb-1">E-mail Pessoal (Responsável)</label><input type="email" value={parentForm.personal_email} onChange={e=>setParentForm({...parentForm,personal_email:e.target.value})} className="w-full border border-blue-200 p-2.5 rounded-xl text-sm bg-white" /></div>
                      
                      <div><label className="label-dash text-xs text-blue-700 font-bold block mb-1">CPF (Responsável)</label><input value={parentForm.cpf} onChange={e=>setParentForm({...parentForm,cpf:e.target.value})} className="w-full border border-blue-200 p-2.5 rounded-xl text-sm bg-white" /></div>
                      <div><label className="label-dash text-xs text-blue-700 font-bold block mb-1">Telefone (Responsável)</label><input value={parentForm.phone} onChange={e=>setParentForm({...parentForm,phone:e.target.value})} className="w-full border border-blue-200 p-2.5 rounded-xl text-sm bg-white" /></div>
                      
                      <div className="col-span-2"><label className="label-dash text-xs text-blue-700 font-bold block mb-1">Data de Nascimento (Responsável)</label><input type="date" value={parentForm.birth_date} onChange={e=>setParentForm({...parentForm,birth_date:e.target.value})} className="w-full border border-blue-200 p-2.5 rounded-xl text-sm bg-white" /></div>
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-6 border-t border-gray-100 mt-6">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-600 py-3.5 rounded-full text-sm font-bold hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 bg-carbono text-marfim py-3.5 rounded-full text-sm font-bold hover:bg-gray-800 disabled:opacity-60">{saving ? 'Salvando...' : 'FINALIZAR CADASTRO'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <div className="text-center py-20 text-gray-400">Carregando usuários...</div> : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-gray-50/50 text-gray-500 font-bold text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Usuário</th>
                  <th className="px-6 py-4">E-mail (Login)</th>
                  <th className="px-6 py-4">Perfil</th>
                  <th className="px-6 py-4 text-center">CPF</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-gray-400">Nenhum usuário cadastrado.</td></tr>}
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {u.photo_url ? (
                          <img src={u.photo_url} alt={u.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm shrink-0">{u.name[0]?.toUpperCase()}</div>
                        )}
                        <div>
                          <p className="font-bold text-carbono">{u.name}</p>
                          <p className="text-[11px] text-gray-400">{new Date(u.created_at).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider ${
                        u.role==='admin' ? 'bg-red-50 text-red-600' :
                        u.role==='aluno' ? 'bg-blue-50 text-blue-600' :
                        u.role==='responsavel' ? 'bg-purple-50 text-purple-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>{u.role}</span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-400">{u.cpf || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      {u.role === 'aluno' && <button onClick={() => setAnamnesisUser(u)} className="text-xs font-bold text-blue-500 hover:text-blue-700 mr-4">ANAMNESE</button>}
                      <button onClick={() => del(u.id)} className="text-xs font-bold text-red-400 hover:text-red-600">EXCLUIR</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {anamnesisUser && (
        <AnamnesisModal
          user={anamnesisUser}
          onClose={() => setAnamnesisUser(null)}
          onSaved={() => { setAnamnesisUser(null); load(); }}
          authH={authH}
        />
      )}

      {showAnamnesisForm && (
        <AnamnesisModal
          user={{ name: form.name || 'Novo Aluno', anamnesis_data: form.anamnesis_data ? JSON.stringify(form.anamnesis_data) : null }}
          onClose={() => setShowAnamnesisForm(false)}
          onSaved={(data) => { setForm({ ...form, anamnesis_data: data }); setShowAnamnesisForm(false); }}
          authH={authH}
        />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// RECURSOS RECEBIDOS TAB (FINANCEIRO)
// ═══════════════════════════════════════════════════════════════════
function FinanceiroTab() {
  const user = getUser()
  const [items, setItems] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ category:'Doação', description:'', amount:'', date:'', status:'pago', expected_date: '' })
  const [receipt, setReceipt] = useState<File | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try { const r = await fetch('/api/finance?type=receita', {headers:authH()}); setItems(await r.json()) } catch { setItems([]) }
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      let receipt_url = ''
      if (receipt) {
        const fd = new FormData()
        fd.append('image', receipt)
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd })
        if (uploadRes.ok) { const ud = await uploadRes.json(); receipt_url = ud.url }
      }

      const r = await fetch('/api/finance', { method:'POST', headers:authH(), body:JSON.stringify({...form, type:'receita', amount: Number(form.amount), receipt_url}) })
      if (!r.ok) { const d = await r.json(); setError(d.error||'Erro') } else { setShowForm(false); setForm({ category:'Doação', description:'', amount:'', date:'', status:'pago', expected_date: '' }); setReceipt(null); load() }
    } catch { setError('Erro de conexão') }
    setSaving(false)
  }
  const del = async (id: number) => { if(!confirm('Excluir registro?')) return; await fetch(`/api/finance/${id}`,{method:'DELETE',headers:authH()}); load() }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div><h2 className="font-serif text-2xl text-carbono">Recursos Recebidos</h2><p className="text-sm text-gray-400">Entradas financeiras (Receitas)</p></div>
        <button onClick={() => setShowForm(true)} className="bg-emerald-600 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-emerald-700 flex items-center gap-2">+ Nova Receita</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-md p-8">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <h3 className="font-serif text-xl text-carbono">Registrar Receita</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 text-2xl">×</button>
            </div>
            {error && <div className="mb-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
            <form onSubmit={save} className="space-y-4">
              <div><label className="label-dash">Categoria</label><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="input-field"><option>Doação</option><option>Patrocínio</option><option>Edital Governamental</option><option>Convênio</option><option>Eventos</option></select></div>
              <div><label className="label-dash">Descrição *</label><input required value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="input-field" placeholder="Origem do recurso" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label-dash">Status</label><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} className="input-field"><option value="pago">Já foi pago</option><option value="a_receber">A receber</option></select></div>
                <div><label className="label-dash">Valor (R$) *</label><input required type="number" step="0.01" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} className="input-field" placeholder="0.00" /></div>
              </div>
              {form.status === 'pago' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="label-dash">Data do Pagamento *</label><input required type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} className="input-field" /></div>
                  <div><label className="label-dash">Comprovante (Opcional)</label><input type="file" accept=".pdf,image/*" onChange={e=>setReceipt(e.target.files?.[0] || null)} className="w-full text-sm mt-2" /></div>
                </div>
              ) : (
                <div><label className="label-dash">Data a Receber *</label><input required type="date" value={form.expected_date} onChange={e=>{setForm({...form,expected_date:e.target.value,date:e.target.value})}} className="input-field" /></div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-full text-sm font-bold">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 bg-emerald-600 text-white py-3 rounded-full text-sm font-bold disabled:opacity-60">{saving ? 'Salvando...' : 'Registrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <div className="text-center py-20 text-gray-400">Carregando...</div> : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              <th className="th-cell">Data</th><th className="th-cell">Descrição</th><th className="th-cell">Categoria</th><th className="th-cell text-right">Valor</th><th className="th-cell" />
            </tr></thead>
            <tbody>
              {items.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-gray-400">Nenhum registro encontrado</td></tr>}
              {items.map(t => (
                <tr key={t.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="td-cell text-gray-500">
                    {t.status === 'a_receber' && t.expected_date ? (
                      <span className="block text-orange-500 font-bold" title="Data a receber">Prev: {new Date(t.expected_date+'T00:00:00').toLocaleDateString('pt-BR')}</span>
                    ) : (
                      <span className="block" title="Data paga">{new Date(t.date+'T00:00:00').toLocaleDateString('pt-BR')}</span>
                    )}
                  </td>
                  <td className="td-cell font-semibold text-carbono">
                    {t.description}
                    {t.status === 'a_receber' && <span className="ml-2 text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">A RECEBER</span>}
                    {t.status === 'pago' && <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">PAGO</span>}
                  </td>
                  <td className="td-cell text-gray-500">
                    {t.category}
                    {t.receipt_url && <a href={t.receipt_url} target="_blank" rel="noreferrer" className="block mt-1 text-[11px] text-blue-500 hover:underline">📄 Ver Comprovante</a>}
                  </td>
                  <td className="td-cell font-bold text-emerald-600 text-right">R$ {t.amount.toLocaleString('pt-BR', {minimumFractionDigits:2})}</td>
                  <td className="td-cell text-right">
                    {user.role === 'admin' && <button onClick={() => del(t.id)} className="text-xs font-bold text-red-400 hover:text-red-600">Excluir</button>}
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
// DESPESAS TAB
// ═══════════════════════════════════════════════════════════════════
function DespesasTab() {
  const user = getUser()
  const [items, setItems] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ category:'Operacional', description:'', amount:'', date:'', status:'pago' })

  const load = useCallback(async () => {
    setLoading(true)
    try { const r = await fetch('/api/finance?type=despesa', {headers:authH()}); setItems(await r.json()) } catch { setItems([]) }
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const r = await fetch('/api/finance', { method:'POST', headers:authH(), body:JSON.stringify({...form, type:'despesa', amount: Number(form.amount)}) })
      if (!r.ok) { const d = await r.json(); setError(d.error||'Erro') } else { setShowForm(false); setForm({ category:'Operacional', description:'', amount:'', date:'', status:'pago' }); load() }
    } catch { setError('Erro de conexão') }
    setSaving(false)
  }
  const del = async (id: number) => { if(!confirm('Excluir registro?')) return; await fetch(`/api/finance/${id}`,{method:'DELETE',headers:authH()}); load() }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div><h2 className="font-serif text-2xl text-carbono">Despesas</h2><p className="text-sm text-gray-400">Saídas financeiras (Custos e Pagamentos)</p></div>
        <button onClick={() => setShowForm(true)} className="bg-red-500 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-red-600 flex items-center gap-2">+ Nova Despesa</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-md p-8">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <h3 className="font-serif text-xl text-carbono">Registrar Despesa</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 text-2xl">×</button>
            </div>
            {error && <div className="mb-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
            <form onSubmit={save} className="space-y-4">
              <div><label className="label-dash">Categoria</label><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="input-field"><option>Operacional</option><option>Folha de Pagamento</option><option>Marketing</option><option>Eventos</option><option>Impostos</option></select></div>
              <div><label className="label-dash">Descrição *</label><input required value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="input-field" placeholder="Motivo da despesa" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label-dash">Valor (R$) *</label><input required type="number" step="0.01" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} className="input-field" placeholder="0.00" /></div>
                <div><label className="label-dash">Data *</label><input required type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} className="input-field" /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-full text-sm font-bold">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 bg-red-500 text-white py-3 rounded-full text-sm font-bold disabled:opacity-60">{saving ? 'Salvando...' : 'Registrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <div className="text-center py-20 text-gray-400">Carregando...</div> : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              <th className="th-cell">Data</th><th className="th-cell">Descrição</th><th className="th-cell">Categoria</th><th className="th-cell text-right">Valor</th><th className="th-cell" />
            </tr></thead>
            <tbody>
              {items.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-gray-400">Nenhum registro encontrado</td></tr>}
              {items.map(t => (
                <tr key={t.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="td-cell text-gray-500">{new Date(t.date+'T00:00:00').toLocaleDateString('pt-BR')}</td>
                  <td className="td-cell font-semibold text-carbono">{t.description}</td>
                  <td className="td-cell text-gray-500">{t.category}</td>
                  <td className="td-cell font-bold text-red-500 text-right">- R$ {t.amount.toLocaleString('pt-BR', {minimumFractionDigits:2})}</td>
                  <td className="td-cell text-right">
                    {user.role === 'admin' && <button onClick={() => del(t.id)} className="text-xs font-bold text-red-400 hover:text-red-600">Excluir</button>}
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
// PRESTAÇÃO DE CONTAS TAB
// ═══════════════════════════════════════════════════════════════════
function AccountabilityTab() {
  const [items, setItems] = useState<AccountabilityReport[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ project_id:'', title:'', document_url:'', status:'em_analise' })

  const load = useCallback(async () => {
    setLoading(true)
    try { 
      const [r1, r2] = await Promise.all([
        fetch('/api/accountability', {headers:authH()}),
        fetch(`/api/projects?tenant_id=${TENANT}`, {headers:authH()})
      ])
      setItems(await r1.json()); setProjects(await r2.json())
    } catch { setItems([]) }
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const r = await fetch('/api/accountability', { method:'POST', headers:authH(), body:JSON.stringify({...form, project_id: Number(form.project_id)}) })
      if (!r.ok) { const d = await r.json(); setError(d.error||'Erro') } else { setShowForm(false); setForm({ project_id:'', title:'', document_url:'', status:'em_analise' }); load() }
    } catch { setError('Erro de conexão') }
    setSaving(false)
  }
  const del = async (id: number) => { if(!confirm('Excluir relatório?')) return; await fetch(`/api/accountability/${id}`,{method:'DELETE',headers:authH()}); load() }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div><h2 className="font-serif text-2xl text-carbono">Prestação de Contas</h2><p className="text-sm text-gray-400">Relatórios vinculados a Projetos</p></div>
        <button onClick={() => setShowForm(true)} className="bg-carbono text-marfim px-5 py-2.5 rounded-full text-sm font-bold hover:bg-gray-800 flex items-center gap-2">+ Novo Relatório</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-md p-8">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <h3 className="font-serif text-xl text-carbono">Vincular Relatório</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 text-2xl">×</button>
            </div>
            {error && <div className="mb-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
            <form onSubmit={save} className="space-y-4">
              <div>
                <label className="label-dash">Projeto *</label>
                <select required value={form.project_id} onChange={e=>setForm({...form,project_id:e.target.value})} className="input-field">
                  <option value="">Selecione um projeto...</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div><label className="label-dash">Título do Relatório *</label><input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="input-field" placeholder="Ex: Relatório Anual 2024" /></div>
              <div><label className="label-dash">Link do Documento (PDF/Drive)</label><input type="url" value={form.document_url} onChange={e=>setForm({...form,document_url:e.target.value})} className="input-field" placeholder="https://" /></div>
              <div>
                <label className="label-dash">Status</label>
                <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} className="input-field">
                  <option value="em_analise">Em Análise</option>
                  <option value="aprovado">Aprovado</option>
                  <option value="rejeitado">Rejeitado</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-full text-sm font-bold">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 bg-carbono text-marfim py-3 rounded-full text-sm font-bold disabled:opacity-60">{saving ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <div className="text-center py-20 text-gray-400">Carregando...</div> : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              <th className="th-cell">Projeto</th><th className="th-cell">Relatório</th><th className="th-cell">Status</th><th className="th-cell">Documento</th><th className="th-cell" />
            </tr></thead>
            <tbody>
              {items.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-gray-400">Nenhum relatório encontrado</td></tr>}
              {items.map(t => (
                <tr key={t.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="td-cell font-semibold text-carbono">{t.project_name}</td>
                  <td className="td-cell text-gray-500">{t.title}</td>
                  <td className="td-cell">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${t.status==='aprovado'?'bg-green-100 text-green-700':t.status==='rejeitado'?'bg-red-100 text-red-600':'bg-yellow-100 text-yellow-700'}`}>
                      {t.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="td-cell">
                    {t.document_url ? <a href={t.document_url} target="_blank" rel="noreferrer" className="text-dourado font-bold hover:underline">Ver Doc ↗</a> : <span className="text-gray-300">Sem link</span>}
                  </td>
                  <td className="td-cell text-right"><button onClick={() => del(t.id)} className="text-xs font-bold text-red-400 hover:text-red-600">Excluir</button></td>
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
// INDICADORES TAB
// ═══════════════════════════════════════════════════════════════════
function IndicadoresTab() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-2xl text-carbono">Indicadores de Desempenho</h2>
        <p className="text-sm text-gray-400">Acompanhamento das principais métricas</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Engajamento Mensal</p>
          <p className="text-3xl font-bold text-dourado">+ 45%</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Taxa de Conclusão (Projetos)</p>
          <p className="text-3xl font-bold text-dourado">92%</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Novos Voluntários</p>
          <p className="text-3xl font-bold text-dourado">128</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Satisfação</p>
          <p className="text-3xl font-bold text-dourado">9.8/10</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center h-64 text-gray-400 flex-col">
        <div className="text-4xl mb-4">📊</div>
        <p className="font-semibold">Módulo de Gráficos Avançados</p>
        <p className="text-sm">Em breve (Integração com BI)</p>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// RELATÓRIOS TAB
// ═══════════════════════════════════════════════════════════════════
function RelatoriosTab() {
  const [items, setItems] = useState<DocumentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title:'', document_url:'' })

  const load = useCallback(async () => {
    setLoading(true)
    try { const r = await fetch('/api/documents?type=relatorio', {headers:authH()}); setItems(await r.json()) } catch { setItems([]) }
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch('/api/documents', { method:'POST', headers:authH(), body:JSON.stringify({...form, type:'relatorio'}) })
      setShowForm(false); setForm({ title:'', document_url:'' }); load()
    } catch (err) { console.error(err) }
  }
  const del = async (id: number) => { if(!confirm('Excluir relatório?')) return; await fetch(`/api/documents/${id}`,{method:'DELETE',headers:authH()}); load() }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div><h2 className="font-serif text-2xl text-carbono">Relatórios Gerenciais</h2><p className="text-sm text-gray-400">Atividades, Operações e Auditorias</p></div>
        <button onClick={() => setShowForm(true)} className="bg-carbono text-marfim px-5 py-2.5 rounded-full text-sm font-bold hover:bg-gray-800">+ Novo Relatório</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-md p-8">
            <h3 className="font-serif text-xl mb-6">Adicionar Relatório</h3>
            <form onSubmit={save} className="space-y-4">
              <div><label className="label-dash">Título</label><input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="input-field" placeholder="Ex: Relatório de Atividades 2024" /></div>
              <div><label className="label-dash">Link do Arquivo (PDF)</label><input required type="url" value={form.document_url} onChange={e=>setForm({...form,document_url:e.target.value})} className="input-field" placeholder="https://" /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-full text-sm font-bold">Cancelar</button>
                <button type="submit" className="flex-1 bg-carbono text-marfim py-3 rounded-full text-sm font-bold">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <div className="text-center py-20 text-gray-400">Carregando...</div> : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100"><th className="th-cell">Título</th><th className="th-cell">Data</th><th className="th-cell">Arquivo</th><th className="th-cell" /></tr></thead>
            <tbody>
              {items.map(t => (
                <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="td-cell font-semibold text-carbono">{t.title}</td>
                  <td className="td-cell text-gray-500">{new Date(t.created_at).toLocaleDateString('pt-BR')}</td>
                  <td className="td-cell"><a href={t.document_url} target="_blank" rel="noreferrer" className="text-dourado font-bold hover:underline">Download</a></td>
                  <td className="td-cell text-right"><button onClick={() => del(t.id)} className="text-xs font-bold text-red-400 hover:text-red-600">Excluir</button></td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={4} className="text-center py-12 text-gray-400">Nenhum relatório cadastrado.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// IMPACTO SOCIAL TAB
// ═══════════════════════════════════════════════════════════════════
function ImpactoTab() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-2xl text-carbono">Impacto Social</h2>
        <p className="text-sm text-gray-400">O retorno das nossas ações para a sociedade</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-7xl opacity-20">🌍</div>
          <p className="text-sm font-bold uppercase tracking-widest mb-1 opacity-80">Comunidades Atendidas</p>
          <p className="text-5xl font-serif mt-2">12</p>
          <p className="text-sm mt-4 opacity-90">+3 adicionadas neste semestre</p>
        </div>
        <div className="bg-gradient-to-br from-dourado to-yellow-500 rounded-3xl p-8 text-carbono shadow-lg relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-7xl opacity-20">❤️</div>
          <p className="text-sm font-bold uppercase tracking-widest mb-1 opacity-80">Vidas Transformadas</p>
          <p className="text-5xl font-serif mt-2">5.420</p>
          <p className="text-sm mt-4 opacity-90">Impacto direto e indireto</p>
        </div>
        <div className="bg-gradient-to-br from-carbono to-gray-800 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-7xl opacity-20">🌱</div>
          <p className="text-sm font-bold uppercase tracking-widest mb-1 opacity-80">ODS Alcançados</p>
          <p className="text-5xl font-serif mt-2">8</p>
          <p className="text-sm mt-4 opacity-90">Alinhamento com a ONU</p>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// DOCUMENTOS TAB
// ═══════════════════════════════════════════════════════════════════
function DocumentosTab() {
  const [items, setItems] = useState<DocumentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title:'', document_url:'' })

  const load = useCallback(async () => {
    setLoading(true)
    try { const r = await fetch('/api/documents?type=documento', {headers:authH()}); setItems(await r.json()) } catch { setItems([]) }
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch('/api/documents', { method:'POST', headers:authH(), body:JSON.stringify({...form, type:'documento'}) })
      setShowForm(false); setForm({ title:'', document_url:'' }); load()
    } catch (err) { console.error(err) }
  }
  const del = async (id: number) => { if(!confirm('Excluir documento?')) return; await fetch(`/api/documents/${id}`,{method:'DELETE',headers:authH()}); load() }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div><h2 className="font-serif text-2xl text-carbono">Documentos Institucionais</h2><p className="text-sm text-gray-400">Estatuto, CNPJ, Certidões</p></div>
        <button onClick={() => setShowForm(true)} className="bg-carbono text-marfim px-5 py-2.5 rounded-full text-sm font-bold hover:bg-gray-800">+ Novo Documento</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-md p-8">
            <h3 className="font-serif text-xl mb-6">Adicionar Documento</h3>
            <form onSubmit={save} className="space-y-4">
              <div><label className="label-dash">Título</label><input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="input-field" placeholder="Ex: Estatuto Social Atualizado" /></div>
              <div><label className="label-dash">Link do Arquivo (PDF)</label><input required type="url" value={form.document_url} onChange={e=>setForm({...form,document_url:e.target.value})} className="input-field" placeholder="https://" /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-full text-sm font-bold">Cancelar</button>
                <button type="submit" className="flex-1 bg-carbono text-marfim py-3 rounded-full text-sm font-bold">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <div className="text-center py-20 text-gray-400">Carregando...</div> : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100"><th className="th-cell">Título do Documento</th><th className="th-cell">Data de Inserção</th><th className="th-cell">Acesso</th><th className="th-cell" /></tr></thead>
            <tbody>
              {items.map(t => (
                <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="td-cell font-semibold text-carbono flex items-center gap-3"><span className="text-xl">📄</span> {t.title}</td>
                  <td className="td-cell text-gray-500">{new Date(t.created_at).toLocaleDateString('pt-BR')}</td>
                  <td className="td-cell"><a href={t.document_url} target="_blank" rel="noreferrer" className="text-dourado font-bold hover:underline">Baixar Arquivo</a></td>
                  <td className="td-cell text-right"><button onClick={() => del(t.id)} className="text-xs font-bold text-red-400 hover:text-red-600">Excluir</button></td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={4} className="text-center py-12 text-gray-400">Nenhum documento cadastrado.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// COMPLIANCE TAB
// ═══════════════════════════════════════════════════════════════════
function ComplianceTab() {
  const policies = [
    { name: 'Código de Ética e Conduta', status: 'Em Vigor', date: 'Atualizado em Mai/2024' },
    { name: 'Adequação LGPD', status: 'Em Vigor', date: 'Atualizado em Mar/2025' },
    { name: 'Política Anticorrupção', status: 'Em Vigor', date: 'Atualizado em Jan/2024' },
    { name: 'Manual de Compras', status: 'Em Revisão', date: 'Vence em Ago/2025' },
  ]
  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-2xl text-carbono">Compliance & Integridade</h2>
        <p className="text-sm text-gray-400">Gerenciamento de políticas e adequações</p>
      </div>
      
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg text-carbono">Índice de Conformidade</h3>
          <p className="text-gray-500 text-sm mt-1">Sua organização atende aos padrões de governança.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-4xl font-serif text-green-600">92%</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Conforme</p>
          </div>
        </div>
      </div>

      <h4 className="font-bold text-carbono mb-4">Políticas e Diretrizes</h4>
      <div className="grid md:grid-cols-2 gap-4">
        {policies.map(p => (
          <div key={p.name} className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center justify-between">
            <div>
              <p className="font-bold text-carbono">{p.name}</p>
              <p className="text-xs text-gray-400 mt-1">{p.date}</p>
            </div>
            <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${p.status==='Em Vigor'?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>
              {p.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// DENUNCIAS TAB
// ═══════════════════════════════════════════════════════════════════
function DenunciasTab() {
  const [items, setItems] = useState<Denuncia[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try { const r = await fetch('/api/denuncias', {headers:authH()}); setItems(await r.json()) } catch { setItems([]) }
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const changeStatus = async (id: number, status: string) => {
    await fetch(`/api/denuncias/${id}`, { method: 'PUT', headers: authH(), body: JSON.stringify({ status }) })
    load()
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-2xl text-carbono">Canal de Denúncias</h2>
        <p className="text-sm text-gray-400">Mensagens sigilosas recebidas pelo portal</p>
      </div>

      {loading ? <div className="text-center py-20 text-gray-400">Carregando...</div> : (
        <div className="space-y-4">
          {items.map(t => (
            <div key={t.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-carbono">{t.subject}</h4>
                  <p className="text-xs text-gray-400 mt-1">Enviado por: {t.name || 'Anônimo'} • {t.email || 'Sem e-mail'} • {new Date(t.created_at).toLocaleString('pt-BR')}</p>
                </div>
                <div className="flex gap-2">
                  {t.status === 'pendente' && <button onClick={() => changeStatus(t.id, 'em_analise')} className="text-[10px] font-bold px-3 py-1.5 rounded-full border border-yellow-200 text-yellow-700 hover:bg-yellow-50 transition-colors">Em Análise</button>}
                  {t.status !== 'resolvido' && <button onClick={() => changeStatus(t.id, 'resolvido')} className="text-[10px] font-bold px-3 py-1.5 rounded-full border border-green-200 text-green-700 hover:bg-green-50 transition-colors">Concluir</button>}
                  <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full ${t.status==='pendente'?'bg-red-100 text-red-700':t.status==='resolvido'?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>
                    {t.status.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 whitespace-pre-wrap">
                {t.message}
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100 shadow-sm">Nenhuma mensagem na caixa de entrada.</div>
          )}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// GESTÃO EAD (ADMIN ONLY)
// ═══════════════════════════════════════════════════════════════════
function GestaoEadTab() {
  const [items, setItems] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title:'', description:'', author:'', youtube_url:'', category:'' })

  const load = useCallback(async () => {
    setLoading(true)
    try { const r = await fetch('/api/videos', {headers:authH()}); setItems(await r.json()) } catch { setItems([]) }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/videos', { method:'POST', headers:authH(), body:JSON.stringify(form) })
    setForm({ title:'', description:'', author:'', youtube_url:'', category:'' })
    load()
  }

  const del = async (id:number) => {
    if(confirm('Tem certeza?')) {
      await fetch('/api/videos/'+id, { method:'DELETE', headers:authH() })
      load()
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-dourado/20 text-dourado flex items-center justify-center text-xl">🎬</div>
        <h2 className="font-serif text-2xl text-carbono">Gestão de Aulas EAD</h2>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
        <h3 className="font-bold text-sm text-carbono mb-4">Cadastrar Novo Vídeo</h3>
        <form onSubmit={save} className="grid grid-cols-2 gap-4">
          <input required placeholder="Título" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="col-span-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl text-sm" />
          <input required placeholder="Autor / Professor" value={form.author} onChange={e=>setForm({...form,author:e.target.value})} className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl text-sm" />
          <input required placeholder="Categoria (ex: Oficina de Rima)" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl text-sm" />
          <input required placeholder="URL do YouTube (https://youtube.com/watch?v=...)" value={form.youtube_url} onChange={e=>setForm({...form,youtube_url:e.target.value})} className="col-span-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl text-sm" />
          <textarea required placeholder="Descrição" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="col-span-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl text-sm h-20 resize-none" />
          <div className="col-span-2 flex justify-end">
            <button type="submit" className="bg-dourado text-carbono px-6 py-2 rounded-full text-xs font-bold hover:bg-yellow-500">SALVAR VÍDEO</button>
          </div>
        </form>
      </div>

      {loading ? <div className="text-center py-10">Carregando...</div> : (
        <div className="bg-white rounded-3xl border border-gray-100 overflow-x-auto shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold">
              <tr><th className="px-6 py-4">Vídeo</th><th className="px-6 py-4">Categoria</th><th className="px-6 py-4 text-right">Ações</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(i => (
                <tr key={i.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-carbono">{i.title}</p>
                    <p className="text-[10px] text-gray-400">{i.author}</p>
                  </td>
                  <td className="px-6 py-4"><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-[10px] font-bold">{i.category}</span></td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={()=>del(i.id)} className="text-red-500 hover:text-red-700 font-bold text-xs uppercase">Excluir</button>
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
// PLATAFORMA EAD (NETFLIX STYLE)
// ═══════════════════════════════════════════════════════════════════
function EadTab({ onClose }: { onClose: () => void }) {
  const [items, setItems] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState<Video|null>(null)
  const [commentText, setCommentText] = useState('')

  const load = useCallback(async () => {
    try { const r = await fetch('/api/videos', {headers:authH()}); setItems(await r.json()) } catch { setItems([]) }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const toggleLike = async (id:number) => {
    await fetch('/api/videos/'+id+'/like', { method:'POST', headers:authH() })
    load()
    if (playing && playing.id === id) {
      setPlaying(prev => prev ? {...prev, userLiked: !prev.userLiked, likes: prev.likes + (prev.userLiked ? -1 : 1)} : null)
    }
  }

  const postComment = async (id:number) => {
    if (!commentText.trim()) return
    await fetch('/api/videos/'+id+'/comments', { method:'POST', headers:authH(), body:JSON.stringify({comment: commentText}) })
    setCommentText('')
    load()
    const r = await fetch('/api/videos', {headers:authH()})
    const fresh = await r.json()
    setItems(fresh)
    setPlaying(fresh.find((v:Video)=>v.id===id))
  }

  const getYoutubeId = (url:string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  // Agrupar por categoria
  const categories = Array.from(new Set(items.map(i=>i.category)))

  if (loading) return <div className="text-center py-20 text-carbono">Carregando plataforma...</div>

  return (
    <div className="fixed inset-0 bg-[#0f2027] z-50 overflow-y-auto">
      {/* Navbar Interna da EAD */}
      <div className="sticky top-0 z-40 bg-gradient-to-b from-black/80 to-transparent pb-10 pt-6 px-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-dourado flex items-center justify-center text-[#0f2027] font-bold text-xl">▶️</div>
          <h2 className="font-serif text-2xl text-white drop-shadow-md">Instituto EAD</h2>
        </div>
        <button onClick={onClose} className="flex items-center gap-2 border border-white/20 text-white/70 hover:bg-white/10 hover:text-white px-4 py-2 rounded-full text-xs font-bold transition-colors">
          <span aria-hidden="true">&larr;</span> SAIR DA PLATAFORMA
        </button>
      </div>

      <div className="px-8 pb-20 -mt-2">
        {categories.length === 0 && (
          <div className="text-center text-white/50 pt-20">Nenhuma aula disponível no momento.</div>
        )}
        
        {categories.map(cat => (
          <div key={cat} className="mb-12">
            <h3 className="text-white font-bold text-xl mb-4 px-2">{cat}</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
              {items.filter(i=>i.category===cat).map(video => {
                const yId = getYoutubeId(video.youtube_url)
                const thumb = yId ? `https://img.youtube.com/vi/${yId}/maxresdefault.jpg` : '/quemsomos.png'
                
                return (
                  <div key={video.id} onClick={()=>setPlaying(video)} className="snap-start shrink-0 w-72 group cursor-pointer relative rounded-xl overflow-hidden bg-gray-900 border border-white/10 transition-transform hover:scale-105 hover:z-10 hover:border-dourado/50">
                    <img src={thumb} alt={video.title} onError={(e:any)=>{e.target.src=`https://img.youtube.com/vi/${yId}/hqdefault.jpg`}} className="w-full h-40 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
                    <div className="absolute bottom-0 left-0 p-4 w-full">
                      <p className="text-white font-bold text-sm truncate">{video.title}</p>
                      <p className="text-white/60 text-[10px] truncate">{video.author}</p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-white/40">
                        <span className="flex items-center gap-1"><span className={video.userLiked ? 'text-dourado' : 'text-gray-400'}>♥</span> {video.likes}</span>
                        <span className="flex items-center gap-1"><span className="text-gray-400">💬</span> {video.comments?.length||0}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Video Modal Player */}
      {playing && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col md:flex-row overflow-hidden">
          {/* Player Area */}
          <div className="flex-1 relative flex flex-col items-center justify-center p-4 lg:p-10 overflow-y-auto hide-scrollbar">
            <button onClick={()=>setPlaying(null)} className="absolute top-6 left-6 z-50 text-white/50 hover:text-white flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-xs font-bold transition-colors">
              <span aria-hidden="true">&larr;</span> VOLTAR
            </button>
            <div className="w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 shrink-0">
              {getYoutubeId(playing.youtube_url) ? (
                <iframe 
                  className="w-full h-full" 
                  src={`https://www.youtube.com/embed/${getYoutubeId(playing.youtube_url)}?autoplay=1&rel=0&color=white`} 
                  allow="autoplay; encrypted-media; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/30">URL de Vídeo Inválida</div>
              )}
            </div>
            
            {/* Info and Actions */}
            <div className="w-full max-w-5xl mt-6 flex justify-between items-start gap-6 shrink-0 pb-10">
              <div>
                <h2 className="text-2xl lg:text-3xl font-serif text-white mb-2">{playing.title}</h2>
                <p className="text-white/60 text-sm mb-4">Com <strong>{playing.author}</strong></p>
                <p className="text-white/80 text-sm max-w-3xl leading-relaxed whitespace-pre-wrap">{playing.description}</p>
              </div>
              <button onClick={()=>toggleLike(playing.id)} className={`shrink-0 flex flex-col items-center justify-center gap-1 w-20 h-20 rounded-2xl transition-all ${playing.userLiked ? 'bg-dourado text-[#0f2027]' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                <span className="text-2xl leading-none">♥</span>
                <span className="text-[10px] font-bold tracking-widest uppercase">({playing.likes})</span>
              </button>
            </div>
          </div>

          {/* Comments Sidebar */}
          <div className="w-full md:w-80 lg:w-96 bg-[#152a33] border-l border-white/10 flex flex-col shrink-0 h-full">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-white font-bold">Comentários ({playing.comments?.length||0})</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar">
              {playing.comments?.map(c => (
                <div key={c.id}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-dourado/20 text-dourado flex items-center justify-center text-[10px] font-bold">{c.user_name?.[0]||'U'}</div>
                    <span className="text-xs font-bold text-white/80">{c.user_name}</span>
                    <span className="text-[9px] text-white/30">{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-white/60 pl-8 break-words">{c.comment}</p>
                </div>
              ))}
              {!playing.comments?.length && <p className="text-xs text-white/40 text-center py-10">Nenhum comentário ainda.</p>}
            </div>
            <div className="p-6 bg-black/20 border-t border-white/10 shrink-0">
              <form onSubmit={e=>{e.preventDefault(); postComment(playing.id)}} className="flex flex-col gap-3">
                <textarea 
                  value={commentText} onChange={e=>setCommentText(e.target.value)} 
                  placeholder="Adicione um comentário..." 
                  className="w-full bg-black/30 border border-white/10 text-white text-sm px-4 py-3 rounded-xl outline-none focus:border-dourado resize-none h-20 placeholder:text-white/30" 
                />
                <button type="submit" disabled={!commentText.trim()} className="bg-dourado text-[#0f2027] font-bold text-xs py-2 rounded-full hover:bg-yellow-500 disabled:opacity-50 transition-colors">COMENTAR</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// COMUNICADOS TAB
// ═══════════════════════════════════════════════════════════════════
function ComunicadosTab() {
  const [items, setItems] = useState<Comunicado[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title:'', message:'' })
  const user = getUser()
  const canEdit = ['admin', 'diretoria', 'coordenacao'].includes(user.role)

  const load = useCallback(async () => {
    setLoading(true)
    try { const r = await fetch('/api/comunicados', {headers:authH()}); setItems(await r.json()) } catch { setItems([]) }
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/comunicados', { method:'POST', headers:authH(), body:JSON.stringify(form) })
    setForm({ title:'', message:'' })
    setShowForm(false)
    load()
  }

  const del = async (id:number) => {
    if(confirm('Tem certeza?')) {
      await fetch('/api/comunicados/'+id, { method:'DELETE', headers:authH() })
      load()
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-dourado/20 text-dourado flex items-center justify-center text-2xl">📢</div>
          <div>
            <h2 className="font-serif text-3xl text-carbono">Mural de Comunicados</h2>
            <p className="text-gray-500 text-sm">Avisos e mensagens oficiais do Instituto MCS.</p>
          </div>
        </div>
        {canEdit && (
          <button onClick={() => setShowForm(true)} className="bg-carbono text-marfim px-6 py-3 rounded-full text-sm font-bold hover:bg-gray-800 transition-colors">+ Novo Aviso</button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
          <h3 className="font-bold text-sm text-carbono mb-4">Publicar Novo Comunicado</h3>
          <form onSubmit={save} className="space-y-4">
            <input required placeholder="Título (ex: Recesso Escolar)" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-dourado" />
            <textarea required placeholder="Escreva a mensagem..." value={form.message} onChange={e=>setForm({...form,message:e.target.value})} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-sm h-32 resize-none outline-none focus:border-dourado" />
            <div className="flex justify-end gap-3">
              <button type="button" onClick={()=>setShowForm(false)} className="px-6 py-2 rounded-full text-xs font-bold text-gray-500 hover:bg-gray-100">CANCELAR</button>
              <button type="submit" className="bg-dourado text-carbono px-6 py-2 rounded-full text-xs font-bold hover:bg-yellow-500">PUBLICAR AVISO</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <div className="text-center py-20 text-gray-400">Carregando avisos...</div> : (
        <div className="space-y-6">
          {items.map(i => (
            <div key={i.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-dourado rounded-l-3xl"></div>
              <div className="flex justify-between items-start mb-3 pl-4">
                <h3 className="font-bold text-xl text-carbono">{i.title}</h3>
                {canEdit && (
                  <button onClick={()=>del(i.id)} className="text-red-400 hover:text-red-600 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">EXCLUIR</button>
                )}
              </div>
              <p className="text-gray-600 text-sm whitespace-pre-wrap pl-4 leading-relaxed mb-4">{i.message}</p>
              <div className="pl-4 flex items-center gap-4 text-xs font-bold text-gray-400">
                <span className="flex items-center gap-1">👤 {i.author_name}</span>
                <span className="flex items-center gap-1">📅 {new Date(i.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 text-gray-400 shadow-sm">Nenhum comunicado no momento.</div>
          )}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// PASSAPORTE CULTURAL TAB
// ═══════════════════════════════════════════════════════════════════
function PassaporteTab() {
  const [items, setItems] = useState<PassaporteItem[]>([])
  const [ranking, setRanking] = useState<any[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ user_id:'', badge_name:'', description:'', points:'' })
  
  // view mode: 'passaporte' or 'ranking'
  const [view, setView] = useState<'passaporte'|'ranking'>('passaporte')
  
  const user = getUser()
  const canEdit = ['admin', 'oficineiro', 'coordenacao', 'diretoria'].includes(user.role)

  const load = useCallback(async () => {
    setLoading(true)
    try { 
      const [rItems, rUsers, rRanking] = await Promise.all([
        fetch('/api/passaporte', {headers:authH()}),
        canEdit ? fetch('/api/users', {headers:authH()}) : Promise.resolve(null),
        fetch('/api/passaporte/ranking', {headers:authH()})
      ])
      setItems(await rItems.json())
      setRanking(await rRanking.json())
      if (rUsers) {
        const u = await rUsers.json()
        setUsers(Array.isArray(u) ? u : [])
      }
    } catch (err) { console.error(err) }
    setLoading(false)
  }, [canEdit])
  
  useEffect(() => { load() }, [load])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/passaporte', { method:'POST', headers:authH(), body:JSON.stringify({...form, points:Number(form.points)||0}) })
    setForm({ user_id:'', badge_name:'', description:'', points:'' })
    setShowForm(false)
    load()
  }

  const del = async (id:number) => {
    if(confirm('Tem certeza?')) {
      await fetch('/api/passaporte/'+id, { method:'DELETE', headers:authH() })
      load()
    }
  }

  // Calculate my total points if I'm a student (from the ranking array)
  const myRankInfo = ranking.find(r => r.id === user.id)
  const myTotalPoints = myRankInfo ? myRankInfo.total_points : 0

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-carbono to-gray-800 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-dourado/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🏅</span>
              <h2 className="font-serif text-3xl font-bold tracking-wide">Passaporte Cultural</h2>
            </div>
            <p className="text-gray-300 text-sm max-w-md">Portfólio verificado de conquistas, habilidades e participação no ecossistema de cultura urbana.</p>
            
            <div className="mt-6 flex gap-3">
              <button onClick={() => setView('passaporte')} className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${view==='passaporte' ? 'bg-white text-carbono' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                Passaporte & Selos
              </button>
              <button onClick={() => setView('ranking')} className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${view==='ranking' ? 'bg-white text-carbono' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                🏆 Ranking Geral
              </button>
            </div>
          </div>
          
          {user.role === 'aluno' && (
            <div className="bg-white/10 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/20 text-center">
              <p className="text-[10px] text-dourado font-bold uppercase tracking-widest mb-1">XP Total (Selos + Games)</p>
              <p className="text-5xl font-bold font-serif">{myTotalPoints}</p>
            </div>
          )}
          {canEdit && (
            <button onClick={() => setShowForm(true)} className="bg-dourado text-carbono px-6 py-3 rounded-full text-sm font-bold hover:bg-yellow-500 shadow-lg">
              + Conceder Selo
            </button>
          )}
        </div>
      </div>

      {showForm && canEdit && (
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 mb-8">
          <h3 className="font-bold text-lg text-carbono mb-6">Conceder Nova Conquista Especial</h3>
          <form onSubmit={save} className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Aluno</label>
              <select required value={form.user_id} onChange={e=>setForm({...form,user_id:e.target.value})} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-dourado">
                <option value="">Selecione o aluno...</option>
                {users.filter(u=>u.role==='aluno').map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Selo / Medalha</label>
              <input required placeholder="Ex: Líder de Turma, Destaque do Mês" value={form.badge_name} onChange={e=>setForm({...form,badge_name:e.target.value})} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-dourado" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Descrição (O que o aluno fez?)</label>
              <input required placeholder="Descreva a atividade ou conquista" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-dourado" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Pontos XP Extras</label>
              <input required type="number" placeholder="Ex: 50" value={form.points} onChange={e=>setForm({...form,points:e.target.value})} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-dourado" />
            </div>
            <div className="flex items-end justify-end gap-3">
              <button type="button" onClick={()=>setShowForm(false)} className="px-6 py-3 rounded-full text-xs font-bold text-gray-500 hover:bg-gray-100">CANCELAR</button>
              <button type="submit" className="bg-carbono text-marfim px-8 py-3 rounded-full text-xs font-bold hover:bg-gray-800">SALVAR CONQUISTA</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <div className="text-center py-20 text-gray-400">Carregando dados...</div> : (
        <>
          {view === 'passaporte' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map(i => (
                <div key={i.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative">
                  {canEdit && (
                    <button onClick={()=>del(i.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500">✕</button>
                  )}
                  <div className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-yellow-300 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-sm">🌟</div>
                  <h4 className="font-bold text-lg text-carbono mb-1">{i.badge_name}</h4>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2" title={i.description}>{i.description}</p>
                  
                  <div className="flex justify-between items-end border-t border-gray-100 pt-4 mt-auto">
                    <div>
                      {canEdit && <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Aluno: {i.user_name}</p>}
                      <p className="text-[10px] font-bold text-gray-400 uppercase">{new Date(i.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="bg-gray-50 text-carbono px-3 py-1.5 rounded-lg text-xs font-bold shadow-inner">
                      +{i.points} XP
                    </div>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-gray-100 text-gray-400 shadow-sm">Nenhuma conquista registrada ainda.</div>
              )}
            </div>
          )}

          {view === 'ranking' && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Posição</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Aluno</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">GAMES</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Selos Extra</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">XP Total</th>
                    {canEdit && <th className="px-6 py-4"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {ranking.map((r, index) => (
                    <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        {index === 0 && <span className="text-2xl" title="1º Lugar">🥇</span>}
                        {index === 1 && <span className="text-2xl" title="2º Lugar">🥈</span>}
                        {index === 2 && <span className="text-2xl" title="3º Lugar">🥉</span>}
                        {index > 2 && <span className="font-bold text-gray-400 ml-2">{index + 1}º</span>}
                      </td>
                      <td className="px-6 py-4 font-bold text-carbono">{r.name}</td>
                      <td className="px-6 py-4 text-sm text-blue-600 font-bold">+{r.games_points} XP</td>
                      <td className="px-6 py-4 text-sm text-yellow-600 font-bold">+{r.badges_points} XP</td>
                      <td className="px-6 py-4 text-right">
                        <span className="bg-carbono text-marfim px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm">
                          {r.total_points} XP
                        </span>
                      </td>
                      {canEdit && (
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => { setForm({...form, user_id: r.id.toString()}); setShowForm(true); window.scrollTo(0,0); }} className="text-xs font-bold text-dourado hover:text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-lg">
                            + Dar Selo
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {ranking.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-400">Nenhum aluno no ranking ainda.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}


// ═══════════════════════════════════════════════════════════════════
// AUTORIZACOES DIGITAIS TAB
// ═══════════════════════════════════════════════════════════════════
function AutorizacoesTab() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showSignatures, setShowSignatures] = useState<any>(null)
  const [signatures, setSignatures] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])

  const blank = { title:'', description:'', event_date:'', event_time:'', location:'', target_type: 'all', target_id: '' }
  const [form, setForm] = useState(blank)
  const [saving, setSaving] = useState(false)
  const user = getUser()
  const canEdit = ['admin', 'diretoria'].includes(user.role)

  const loadOptions = useCallback(async () => {
    if (!canEdit) return
    try {
      const [rCls, rUsr] = await Promise.all([
        fetch('/api/classes', {headers:authH()}),
        fetch('/api/users', {headers:authH()})
      ])
      setClasses(await rCls.json())
      const allUsers = await rUsr.json()
      setStudents(allUsers.filter((u:any) => u.role === 'aluno'))
    } catch {}
  }, [canEdit])

  const load = useCallback(async () => {
    setLoading(true)
    try { const r = await fetch('/api/authorizations', {headers:authH()}); setItems(await r.json()) } catch { setItems([]) }
    setLoading(false)
  }, [])
  useEffect(() => { load(); loadOptions() }, [load, loadOptions])

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      await fetch('/api/authorizations', {method:'POST', headers:authH(), body:JSON.stringify(form)})
      setShowForm(false); setForm(blank); load()
    } catch {}
    setSaving(false)
  }

  const del = async (id: number) => {
    if(!confirm('Excluir esta autorização?')) return
    await fetch(`/api/authorizations/${id}`, {method:'DELETE', headers:authH()})
    load()
  }

  const sign = async (id: number) => {
    if(!confirm('Deseja assinar esta autorização para seus alunos?')) return
    try {
      const r = await fetch(`/api/authorizations/${id}/sign`, {method:'POST', headers:authH()})
      if (!r.ok) {
        const d = await r.json()
        alert(d.error || 'Erro ao assinar')
      }
      load()
    } catch { alert('Erro de conexão') }
  }

  const loadSignatures = async (auth: any) => {
    setShowSignatures(auth)
    setSignatures([])
    try {
      const r = await fetch(`/api/authorizations/${auth.id}/signatures`, {headers:authH()})
      setSignatures(await r.json())
    } catch {}
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-serif text-3xl text-carbono">Autorizações Digitais</h2>
          <p className="text-sm text-gray-500">Gestão de saídas, eventos e autorizações parentais.</p>
        </div>
        {canEdit && (
          <button onClick={() => setShowForm(true)} className="bg-carbono text-marfim px-6 py-3 rounded-full text-sm font-bold hover:bg-gray-800 shadow-lg">+ Nova Autorização</button>
        )}
      </div>

      {showForm && canEdit && (
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 mb-8">
          <h3 className="font-bold text-lg text-carbono mb-6">Criar Solicitação de Autorização</h3>
          <form onSubmit={save} className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Título / Motivo *</label>
              <input required placeholder="Ex: Visita ao Museu Nacional" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-dourado" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Data *</label>
              <input required type="date" value={form.event_date} onChange={e=>setForm({...form,event_date:e.target.value})} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-dourado" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Horário</label>
              <input type="time" value={form.event_time} onChange={e=>setForm({...form,event_time:e.target.value})} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-dourado" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Local / Endereço</label>
              <input placeholder="Ex: Setor Cultural Sul..." value={form.location} onChange={e=>setForm({...form,location:e.target.value})} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-dourado" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Destinatários / Público Alvo *</label>
              <div className="flex gap-4">
                <select value={form.target_type} onChange={e=>setForm({...form,target_type:e.target.value, target_id:''})} className="w-1/3 bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-dourado font-bold">
                  <option value="all">Todos os Alunos</option>
                  <option value="class">Uma Turma Específica</option>
                  <option value="student">Um Aluno Específico</option>
                </select>
                {form.target_type === 'class' && (
                  <select required value={form.target_id} onChange={e=>setForm({...form,target_id:e.target.value})} className="w-2/3 bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-dourado">
                    <option value="">Selecione a turma...</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                )}
                {form.target_type === 'student' && (
                  <select required value={form.target_id} onChange={e=>setForm({...form,target_id:e.target.value})} className="w-2/3 bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-dourado">
                    <option value="">Selecione o aluno...</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                )}
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Descrição e Detalhes</label>
              <textarea rows={3} placeholder="Instruções, o que levar, etc..." value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-dourado resize-none" />
            </div>
            <div className="flex items-end justify-end gap-3 col-span-2">
              <button type="button" onClick={()=>setShowForm(false)} className="px-6 py-3 rounded-full text-xs font-bold text-gray-500 hover:bg-gray-100">Cancelar</button>
              <button type="submit" disabled={saving} className="bg-carbono text-marfim px-8 py-3 rounded-full text-xs font-bold hover:bg-gray-800 disabled:opacity-50">Enviar Solicitação</button>
            </div>
          </form>
        </div>
      )}

      {showSignatures && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl p-8 max-h-[80vh] flex flex-col">
            <div className="flex justify-between mb-6 shrink-0">
              <h3 className="font-serif text-2xl text-carbono">Assinaturas: {showSignatures.title}</h3>
              <button onClick={() => setShowSignatures(null)} className="text-gray-400 text-2xl hover:text-carbono">×</button>
            </div>
            <div className="overflow-y-auto flex-1 pr-2">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Responsável</th>
                    <th className="px-4 py-3">Aluno</th>
                    <th className="px-4 py-3 rounded-r-lg">Data/Hora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {signatures.length === 0 && <tr><td colSpan={3} className="text-center py-8 text-gray-400">Nenhuma assinatura ainda.</td></tr>}
                  {signatures.map(s => (
                    <tr key={s.id}>
                      <td className="px-4 py-3 font-semibold text-carbono">{s.parent_name}</td>
                      <td className="px-4 py-3 text-gray-600">{s.student_name}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{new Date(s.signed_at).toLocaleString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {loading ? <div className="text-center py-20 text-gray-400">Carregando autorizações...</div> : (
        <div className="space-y-4">
          {items.map(i => (
            <div key={i.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-xl text-carbono">{i.title}</h3>
                  {i.target_type === 'class' && <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase">Turma Específica</span>}
                  {i.target_type === 'student' && <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase">Aluno Específico</span>}
                  {user.role === 'responsavel' && i.signed && (
                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase">Autorizado</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1">📅 {new Date(i.event_date+'T00:00:00').toLocaleDateString('pt-BR')}</span>
                  {i.event_time && <span className="flex items-center gap-1">⏰ {i.event_time}</span>}
                  {i.location && <span className="flex items-center gap-1">📍 {i.location}</span>}
                </div>
                {i.description && <p className="text-sm text-gray-600 mb-3 whitespace-pre-wrap">{i.description}</p>}
                <p className="text-xs text-gray-400">Criado em {new Date(i.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
              
              <div className="flex flex-col items-end gap-3 shrink-0 w-full md:w-auto">
                {canEdit ? (
                  <>
                    <button onClick={() => loadSignatures(i)} className="bg-gray-50 text-carbono px-5 py-2.5 rounded-xl text-sm font-bold border border-gray-200 hover:bg-gray-100 transition-colors w-full md:w-auto text-center">
                      Ver Assinaturas ({i.signatures_count})
                    </button>
                    <button onClick={() => del(i.id)} className="text-red-400 hover:text-red-600 text-xs font-bold px-2">EXCLUIR</button>
                  </>
                ) : (
                  user.role === 'responsavel' && !i.signed && (
                    <button onClick={() => sign(i.id)} className="bg-green-500 text-white px-8 py-3 rounded-full text-sm font-bold shadow-lg hover:bg-green-600 transition-colors w-full md:w-auto">
                      Assinar Digitalmente
                    </button>
                  )
                )}
                {user.role === 'responsavel' && i.signed && (
                  <div className="text-right">
                    <p className="text-xs text-green-600 font-bold border border-green-200 bg-green-50 px-3 py-1.5 rounded-full inline-block">✓ Assinado</p>
                    <p className="text-[10px] text-gray-400 mt-1">{new Date(i.signed_at).toLocaleString('pt-BR')}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 text-gray-400 shadow-sm">Nenhuma solicitação de autorização no momento.</div>
          )}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// AVALIAÇÕES TAB
// ═══════════════════════════════════════════════════════════════════
function AvaliacoesTab() {
  const user = getUser()
  const canEdit = ['admin', 'diretoria', 'oficineiro'].includes(user.role)

  const [assessments, setAssessments] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Views: list, create, answer, grade
  const [view, setView] = useState<'list' | 'create' | 'answer' | 'grade'>('list')

  // Create Form State
  const blankForm = { title:'', description:'', date:'', time:'', type:'questionario', target_type:'all', target_ids:[] as string[], max_score: 10, is_gamified: false }
  const [form, setForm] = useState(blankForm)
  const [questions, setQuestions] = useState<any[]>([]) // for type='questionario'
  const [saving, setSaving] = useState(false)

  // Answer State (for students)
  const [activeAssessment, setActiveAssessment] = useState<any>(null)
  const [answers, setAnswers] = useState<any>({})

  // Grade State (for teachers)
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [activeDelivery, setActiveDelivery] = useState<any>(null)
  const [gradeForm, setGradeForm] = useState({ teacher_grade: '', teacher_comment: '' })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [rAss, rCls, rStu] = await Promise.all([
        fetch('/api/assessments', {headers:authH()}),
        canEdit ? fetch('/api/classes', {headers:authH()}) : Promise.resolve(null),
        canEdit ? fetch('/api/users', {headers:authH()}) : Promise.resolve(null)
      ])
      setAssessments(await rAss.json())
      if (rCls) setClasses(await rCls.json())
      if (rStu) setStudents((await rStu.json()).filter((u:any)=>u.role==='aluno'))
    } catch {}
    setLoading(false)
  }, [canEdit])
  useEffect(() => { loadData() }, [loadData])

  // --- Handlers for Create ---
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await fetch('/api/assessments', {
        method: 'POST', headers: authH(),
        body: JSON.stringify({ ...form, questions })
      })
      setView('list')
      loadData()
      setForm(blankForm)
      setQuestions([])
    } catch {
      alert('Erro ao criar avaliação')
    }
    setSaving(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja excluir esta avaliação?')) return
    await fetch(`/api/assessments/${id}`, { method:'DELETE', headers:authH() })
    loadData()
  }

  const addQuestion = (type: string) => {
    setQuestions([...questions, { type, question_text: '', options: type === 'multiple_choice' ? [''] : [] }])
  }

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQ = [...questions]
    newQ[index][field] = value
    setQuestions(newQ)
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const addOption = (qIndex: number) => {
    const newQ = [...questions]
    newQ[qIndex].options.push('')
    setQuestions(newQ)
  }

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const newQ = [...questions]
    newQ[qIndex].options[oIndex] = value
    setQuestions(newQ)
  }

  const toggleTarget = (id: string) => {
    setForm(f => ({
      ...f, 
      target_ids: f.target_ids.includes(id) ? f.target_ids.filter(x=>x!==id) : [...f.target_ids, id]
    }))
  }

  // --- Handlers for Answer ---
  const openAnswer = async (a: any) => {
    if (a.my_delivery) return alert('Você já entregou esta avaliação.')
    try {
      const r = await fetch(`/api/assessments/${a.id}`, { headers:authH() })
      const data = await r.json()
      setActiveAssessment(data)
      setAnswers({})
      setView('answer')
    } catch { alert('Erro ao carregar avaliação') }
  }

  const submitAnswer = async () => {
    if (!confirm('Confirmar entrega e assinar digitalmente?')) return
    setSaving(true)
    try {
      await fetch(`/api/assessments/${activeAssessment.id}/deliver`, {
        method: 'POST', headers: authH(),
        body: JSON.stringify({ answers })
      })
      alert('Avaliação entregue e assinada com sucesso!')
      setView('list')
      loadData()
    } catch {
      alert('Erro ao enviar')
    }
    setSaving(false)
  }

  // --- Handlers for Grading ---
  const openGrade = async (a: any) => {
    try {
      const rAss = await fetch(`/api/assessments/${a.id}`, { headers:authH() })
      const dataAss = await rAss.json()
      setActiveAssessment(dataAss)
      
      const rDel = await fetch(`/api/assessments/${a.id}/deliveries`, { headers:authH() })
      setDeliveries(await rDel.json())
      
      setView('grade')
      setActiveDelivery(null)
    } catch { alert('Erro ao carregar entregas') }
  }

  const saveGrade = async () => {
    setSaving(true)
    try {
      await fetch(`/api/assessments/deliveries/${activeDelivery.id}/grade`, {
        method: 'POST', headers: authH(),
        body: JSON.stringify(gradeForm)
      })
      alert('Nota salva!')
      // Refresh deliveries
      const rDel = await fetch(`/api/assessments/${activeAssessment.id}/deliveries`, { headers:authH() })
      setDeliveries(await rDel.json())
      setActiveDelivery(null)
    } catch {
      alert('Erro ao salvar nota')
    }
    setSaving(false)
  }

  // ======= RENDER VIEWS =======

  if (view === 'create') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <button onClick={() => setView('list')} className="text-gray-500 font-bold text-sm hover:text-carbono">← Voltar</button>
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
          <h2 className="font-serif text-2xl text-carbono mb-6">Criar Avaliação</h2>
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Título *</label>
                <input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg outline-none focus:border-dourado" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Descrição / Instruções</label>
                <textarea rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg outline-none focus:border-dourado" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Data Limite (Opcional)</label>
                <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg outline-none focus:border-dourado" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Horário Limite (Opcional)</label>
                <input type="time" value={form.time} onChange={e=>setForm({...form,time:e.target.value})} className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg outline-none focus:border-dourado" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Tipo de Avaliação *</label>
                <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg outline-none focus:border-dourado font-bold text-sm">
                  <option value="questionario">Questionário / Formulário</option>
                  <option value="redacao">Redação</option>
                  <option value="pratica">Atividade Prática</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Nota Máxima (Opcional)</label>
                <input type="number" min="0" step="0.1" value={form.max_score} onChange={e=>setForm({...form,max_score:parseFloat(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg outline-none focus:border-dourado" />
              </div>
              <div className="col-span-2 mt-2">
                <label className="flex items-center gap-3 cursor-pointer p-4 bg-purple-50 border border-purple-100 rounded-xl hover:bg-purple-100 transition-colors">
                  <input type="checkbox" checked={form.is_gamified} onChange={e=>setForm({...form, is_gamified: e.target.checked})} className="w-5 h-5 rounded text-purple-600 focus:ring-purple-600" />
                  <div>
                    <span className="font-bold text-purple-900 block">🎮 É uma Atividade Gamificada (Game/Missão)?</span>
                    <span className="text-xs text-purple-700">Se marcado, a nota desta atividade valerá XP e somará no Ranking do Passaporte Cultural do aluno.</span>
                  </div>
                </label>
              </div>
              
              {/* TARGETS */}
              <div className="col-span-2 mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <label className="block text-xs font-bold text-carbono mb-3 uppercase">Público Alvo *</label>
                <select value={form.target_type} onChange={e=>setForm({...form, target_type:e.target.value, target_ids:[]})} className="w-full bg-white border border-gray-300 px-3 py-2 rounded-lg text-sm font-bold outline-none focus:border-dourado mb-4">
                  <option value="all">Todos os Alunos</option>
                  <option value="class">Turmas Específicas</option>
                  <option value="student">Alunos Específicos</option>
                </select>
                {form.target_type === 'class' && (
                  <div className="max-h-40 overflow-y-auto space-y-1 bg-white p-2 border border-gray-200 rounded-lg">
                    {classes.map(c => (
                      <label key={c.id} className="flex items-center gap-2 text-sm p-1 hover:bg-gray-50 cursor-pointer">
                        <input type="checkbox" checked={form.target_ids.includes(c.id.toString())} onChange={()=>toggleTarget(c.id.toString())} className="rounded text-dourado focus:ring-dourado" />
                        {c.name}
                      </label>
                    ))}
                  </div>
                )}
                {form.target_type === 'student' && (
                  <div className="max-h-40 overflow-y-auto space-y-1 bg-white p-2 border border-gray-200 rounded-lg">
                    {students.map(s => (
                      <label key={s.id} className="flex items-center gap-2 text-sm p-1 hover:bg-gray-50 cursor-pointer">
                        <input type="checkbox" checked={form.target_ids.includes(s.id.toString())} onChange={()=>toggleTarget(s.id.toString())} className="rounded text-dourado focus:ring-dourado" />
                        {s.name} - {s.email}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* QUESTIONS BUILDER */}
            {form.type === 'questionario' && (
              <div className="mt-8 border-t border-gray-100 pt-6">
                <h3 className="font-bold text-carbono mb-4">Questões do Formulário</h3>
                
                <div className="space-y-6 mb-6">
                  {questions.map((q, qIndex) => (
                    <div key={qIndex} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 relative">
                      <button type="button" onClick={()=>removeQuestion(qIndex)} className="absolute top-4 right-4 text-xs font-bold text-red-500 hover:text-red-700">Remover</button>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 block">
                        {q.type === 'multiple_choice' ? 'Múltipla Escolha' : q.type === 'dissertation' ? 'Dissertativa' : 'Associação'}
                      </span>
                      <input required placeholder="Digite a pergunta..." value={q.question_text} onChange={e=>updateQuestion(qIndex, 'question_text', e.target.value)} className="w-full bg-white border border-gray-300 px-3 py-2 rounded-lg text-sm mb-3 outline-none" />
                      
                      {q.type === 'multiple_choice' && (
                        <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                          {q.options.map((opt: string, oIndex: number) => (
                            <div key={oIndex} className="flex gap-2">
                              <input placeholder={`Opção ${oIndex+1}`} value={opt} onChange={e=>updateOption(qIndex, oIndex, e.target.value)} className="flex-1 bg-white border border-gray-200 px-3 py-1.5 rounded-md text-xs outline-none" />
                            </div>
                          ))}
                          <button type="button" onClick={()=>addOption(qIndex)} className="text-xs font-bold text-blue-500 hover:underline">+ Adicionar Opção</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                  <button type="button" onClick={()=>addQuestion('multiple_choice')} className="text-xs font-bold bg-white border border-gray-300 px-4 py-2 rounded-xl hover:bg-gray-50">+ Múltipla Escolha</button>
                  <button type="button" onClick={()=>addQuestion('dissertation')} className="text-xs font-bold bg-white border border-gray-300 px-4 py-2 rounded-xl hover:bg-gray-50">+ Dissertativa</button>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-6">
              <button disabled={saving} type="submit" className="bg-carbono text-marfim px-8 py-3 rounded-full text-sm font-bold hover:bg-gray-800 disabled:opacity-50">
                {saving ? 'Salvando...' : 'Publicar Avaliação'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  if (view === 'answer' && activeAssessment) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-20">
        <button onClick={() => setView('list')} className="text-gray-500 font-bold text-sm hover:text-carbono">← Voltar</button>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-wider">{activeAssessment.type}</span>
          <h2 className="font-serif text-3xl text-carbono mt-3 mb-2">{activeAssessment.title}</h2>
          {activeAssessment.date && <p className="text-xs font-bold text-gray-500 mb-4">Prazo: {new Date(activeAssessment.date+'T00:00:00').toLocaleDateString('pt-BR')} {activeAssessment.time && `às ${activeAssessment.time}`}</p>}
          <p className="text-sm text-gray-600">{activeAssessment.description}</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-8">
          {activeAssessment.type === 'redacao' && (
            <div>
              <label className="block font-bold text-carbono mb-2">Escreva sua redação aqui:</label>
              <textarea rows={15} value={answers['redacao']||''} onChange={e=>setAnswers({...answers, redacao: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-4 rounded-2xl text-sm outline-none focus:border-dourado resize-none" placeholder="Comece a digitar..."></textarea>
            </div>
          )}
          
          {activeAssessment.type === 'pratica' && (
            <div className="py-6">
              <p className="text-gray-500 mb-4 font-bold text-center">Esta é uma atividade prática. Descreva abaixo o que foi realizado:</p>
              <textarea rows={4} value={answers['pratica_desc']||''} onChange={e=>setAnswers({...answers, pratica_desc: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-4 rounded-2xl text-sm outline-none focus:border-dourado resize-none mb-6" placeholder="Descreva sua experiência ou o que foi feito na atividade..."></textarea>
              <div className="text-center">
                <label className="flex items-center justify-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={answers['pratica']===true} onChange={e=>setAnswers({...answers, pratica: e.target.checked})} className="w-6 h-6 rounded text-dourado focus:ring-dourado" />
                  <span className="font-bold text-carbono">Eu realizei esta atividade prática.</span>
                </label>
              </div>
            </div>
          )}

          {activeAssessment.type === 'questionario' && activeAssessment.questions?.map((q:any, i:number) => (
            <div key={q.id} className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
              <p className="font-bold text-carbono mb-4"><span className="text-dourado mr-2">{i+1}.</span>{q.question_text}</p>
              
              {q.type === 'multiple_choice' && (
                <div className="space-y-2 pl-6">
                  {JSON.parse(q.options_json||'[]').map((opt:string, optIdx:number) => (
                    <label key={optIdx} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded-lg">
                      <input type="radio" name={`q_${q.id}`} value={opt} checked={answers[q.id]===opt} onChange={e=>setAnswers({...answers, [q.id]: e.target.value})} className="text-dourado focus:ring-dourado" />
                      <span className="text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
              )}
              
              {q.type === 'dissertation' && (
                <textarea rows={4} value={answers[q.id]||''} onChange={e=>setAnswers({...answers, [q.id]: e.target.value})} className="w-full bg-white border border-gray-200 p-3 rounded-xl text-sm outline-none focus:border-dourado resize-none" placeholder="Sua resposta..."></textarea>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4">
          <button onClick={submitAnswer} disabled={saving} className="bg-carbono text-marfim px-8 py-4 rounded-full text-sm font-bold hover:bg-gray-800 disabled:opacity-50 shadow-xl flex items-center gap-2">
            <span>✍️</span> Entregar e Assinar Digitalmente
          </button>
        </div>
      </div>
    )
  }

  if (view === 'grade' && activeAssessment) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <button onClick={() => setView('list')} className="text-gray-500 font-bold text-sm hover:text-carbono">← Voltar para Avaliações</button>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="font-serif text-2xl text-carbono mb-1">{activeAssessment.title}</h2>
          <p className="text-sm text-gray-500">Painel de Correção - {deliveries.length} entregas recebidas.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 p-4 border-b border-gray-100 bg-gray-50">Alunos</h3>
            <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
              {deliveries.map(d => (
                <button key={d.id} onClick={() => { setActiveDelivery(d); setGradeForm({ teacher_grade: d.teacher_grade||'', teacher_comment: d.teacher_comment||'' }) }} className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${activeDelivery?.id === d.id ? 'bg-blue-50/50' : ''}`}>
                  <p className="font-bold text-carbono text-sm mb-1">{d.student_name}</p>
                  <p className="text-[10px] text-gray-400">Entregue: {new Date(d.delivered_at).toLocaleString('pt-BR')}</p>
                  {d.status === 'graded' ? <span className="inline-block mt-2 text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded">Corrigido: {d.teacher_grade}</span> : <span className="inline-block mt-2 text-[10px] font-bold text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded">Pendente de Nota</span>}
                </button>
              ))}
              {deliveries.length === 0 && <p className="p-4 text-sm text-gray-400 text-center">Nenhuma entrega ainda.</p>}
            </div>
          </div>

          <div className="col-span-2">
            {activeDelivery ? (
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-lg text-carbono mb-4">Respostas de {activeDelivery.student_name}</h3>
                  
                  {activeAssessment.type === 'pratica' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 text-green-700 font-bold rounded-xl border border-green-200">
                        ✅ O aluno assinou a conclusão desta atividade prática.
                      </div>
                      {JSON.parse(activeDelivery.answers_json || '{}').pratica_desc && (
                        <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 text-sm whitespace-pre-wrap">
                          <p className="font-bold text-carbono text-xs mb-2 uppercase">Relato do Aluno:</p>
                          {JSON.parse(activeDelivery.answers_json || '{}').pratica_desc}
                        </div>
                      )}
                    </div>
                  )}

                  {activeAssessment.type === 'redacao' && (
                    <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 text-sm whitespace-pre-wrap">
                      {JSON.parse(activeDelivery.answers_json || '{}').redacao || <span className="text-gray-400 italic">Em branco</span>}
                    </div>
                  )}

                  {activeAssessment.type === 'questionario' && activeAssessment.questions?.map((q:any, i:number) => {
                    const ans = JSON.parse(activeDelivery.answers_json || '{}')[q.id]
                    return (
                      <div key={q.id} className="mb-6 last:mb-0">
                        <p className="font-bold text-carbono text-sm mb-2">{i+1}. {q.question_text}</p>
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm">
                          {ans ? <span className="text-gray-700">{ans}</span> : <span className="text-gray-400 italic">Não respondido</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-lg text-carbono mb-4">Avaliação do Oficineiro</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="md:col-span-1">
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Nota (0 a {activeAssessment.max_score||10})</label>
                      <input type="number" step="0.1" value={gradeForm.teacher_grade} onChange={e=>setGradeForm({...gradeForm, teacher_grade:e.target.value})} className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg outline-none focus:border-dourado font-bold text-lg" />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Comentário / Feedback</label>
                      <textarea rows={3} value={gradeForm.teacher_comment} onChange={e=>setGradeForm({...gradeForm, teacher_comment:e.target.value})} className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg outline-none focus:border-dourado resize-none" />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button onClick={saveGrade} disabled={saving} className="bg-dourado text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-yellow-600 disabled:opacity-50">
                      {saving ? 'Salvando...' : 'Salvar Correção'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50/50 border border-gray-100 rounded-3xl h-full flex items-center justify-center text-gray-400 p-8 text-center">
                Selecione um aluno na lista ao lado para corrigir a avaliação e lançar a nota.
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // --- Main List View ---
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-serif text-3xl text-carbono">Avaliações e Atividades</h2>
          <p className="text-sm text-gray-500">Questionários, Redações e Exercícios práticos.</p>
        </div>
        {canEdit && (
          <button onClick={() => { setView('create'); setForm(blankForm); setQuestions([]) }} className="bg-carbono text-marfim px-6 py-3 rounded-full text-sm font-bold hover:bg-gray-800 shadow-lg">+ Nova Avaliação</button>
        )}
      </div>

      {loading ? <div className="text-center py-20 text-gray-400">Carregando avaliações...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map(a => (
            <div key={a.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative group flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold text-dourado bg-yellow-50 px-2 py-1 rounded-md uppercase tracking-wider">{a.type}</span>
                  {a.date && <span className="text-[10px] font-bold text-gray-400">{new Date(a.date+'T00:00:00').toLocaleDateString('pt-BR')}</span>}
                </div>
                <h3 className="font-bold text-lg text-carbono mb-2 leading-tight">
                  {a.is_gamified === 1 && <span className="inline-block mr-2" title="Atividade Gamificada (Vale XP no Passaporte)">🎮</span>}
                  {a.title}
                </h3>
                {a.description && <p className="text-xs text-gray-500 mb-4 line-clamp-2">{a.description}</p>}
                
                {user.role === 'aluno' && a.my_delivery && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs font-bold text-green-600 mb-1">✅ Entregue</p>
                    {a.my_delivery.status === 'graded' ? (
                      <p className="text-xs text-carbono">Nota: <strong className="text-lg">{a.my_delivery.teacher_grade}</strong> / {a.max_score||10}</p>
                    ) : (
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Aguardando correção</p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between gap-2">
                {user.role === 'aluno' ? (
                  !a.my_delivery ? (
                    <button onClick={() => openAnswer(a)} className="flex-1 bg-carbono text-marfim py-2 rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors">
                      ✍️ Realizar Atividade
                    </button>
                  ) : (
                    <button disabled className="flex-1 bg-gray-100 text-gray-400 py-2 rounded-xl text-xs font-bold">Assinada</button>
                  )
                ) : user.role === 'responsavel' ? (
                  <button className="flex-1 bg-gray-50 text-gray-400 py-2 rounded-xl text-xs font-bold border border-gray-100">Ver Resultado</button> // future enhancement
                ) : (
                  <>
                    <button onClick={() => openGrade(a)} className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors">
                      Corrigir ({a.deliveries_count})
                    </button>
                    {canEdit && <button onClick={() => handleDelete(a.id)} className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors">🗑</button>}
                  </>
                )}
              </div>
            </div>
          ))}
          {assessments.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-gray-100 text-gray-400 shadow-sm">Nenhuma avaliação encontrada.</div>
          )}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TURMAS E FREQUÊNCIA TAB
// ═══════════════════════════════════════════════════════════════════
function TurmasTab() {
  const user = getUser()
  const canEditClasses = ['admin', 'diretoria'].includes(user.role)
  const canTakeAttendance = ['admin', 'diretoria', 'oficineiro'].includes(user.role)

  const [classes, setClasses] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [showForm, setShowForm] = useState(false)
  const [editingClass, setEditingClass] = useState<any>(null)
  const [form, setForm] = useState({ name: '', description: '', teacher_ids: [] as number[], student_ids: [] as number[] })
  
  // Navigation states
  const [activeClass, setActiveClass] = useState<any>(null)
  const [view, setView] = useState<'list' | 'lessons' | 'attendance' | 'student_attendance'>('list')
  
  // Lessons state
  const [lessons, setLessons] = useState<any[]>([])
  const [showLessonForm, setShowLessonForm] = useState(false)
  const [lessonForm, setLessonForm] = useState({ title: '', date: new Date().toISOString().split('T')[0], start_time: '', end_time: '', description: '' })
  const [activeLesson, setActiveLesson] = useState<any>(null)

  // Attendance state
  const [attendance, setAttendance] = useState<any[]>([])
  const [savingAtt, setSavingAtt] = useState(false)

  // Student Attendance (Parents/Students view)
  const [studentHistory, setStudentHistory] = useState<any[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [rCls, rUsr] = await Promise.all([
        fetch('/api/classes', {headers:authH()}),
        canEditClasses ? fetch('/api/users', {headers:authH()}) : Promise.resolve(null)
      ])
      setClasses(await rCls.json())
      if (rUsr) setUsers(await rUsr.json())
    } catch {}
    setLoading(false)
  }, [canEditClasses])
  useEffect(() => { load() }, [load])

  // Class Form handlers
  const openNew = () => { setEditingClass(null); setForm({ name:'', description:'', teacher_ids:[], student_ids:[] }); setShowForm(true) }
  const openEdit = (c: any) => { setEditingClass(c); setForm({ name:c.name, description:c.description||'', teacher_ids:c.teachers.map((t:any)=>t.id), student_ids:c.students.map((s:any)=>s.id) }); setShowForm(true) }
  const toggleTeacher = (id: number) => setForm(f => ({ ...f, teacher_ids: f.teacher_ids.includes(id) ? f.teacher_ids.filter(x=>x!==id) : [...f.teacher_ids, id] }))
  const toggleStudent = (id: number) => setForm(f => ({ ...f, student_ids: f.student_ids.includes(id) ? f.student_ids.filter(x=>x!==id) : [...f.student_ids, id] }))

  const saveClass = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editingClass ? 'PUT' : 'POST'
    const url = editingClass ? `/api/classes/${editingClass.id}` : '/api/classes'
    await fetch(url, {method, headers:authH(), body:JSON.stringify(form)})
    setShowForm(false); load()
  }
  
  const deleteClass = async (id: number) => {
    if(!confirm('Excluir turma?')) return
    await fetch(`/api/classes/${id}`, {method:'DELETE', headers:authH()})
    load()
  }

  const downloadReport = async (c: any) => {
    try {
      const r = await fetch(`/api/classes/${c.id}/report`, {headers:authH()})
      const data = await r.json()
      if (data.error) return alert(data.error)
      if (data.length === 0) return alert('Nenhum dado de frequência encontrado.')
      
      const win = window.open('', '_blank')
      if (!win) return alert('Por favor, permita pop-ups no seu navegador para gerar o relatório.')
      
      let rows = ''
      data.forEach((row: any) => {
        const statusStr = row.status === 'present' ? 'Presente' : row.status === 'absent' ? 'Falta' : row.status === 'justified' ? 'Falta Justificada' : 'Sem Registro'
        const color = row.status === 'present' ? '#15803d' : row.status === 'absent' ? '#b91c1c' : '#b45309'
        rows += `
          <tr>
            <td>${row.student_name}</td>
            <td>${new Date(row.lesson_date+'T00:00:00').toLocaleDateString('pt-BR')}</td>
            <td>${row.lesson_title}</td>
            <td style="font-weight:bold; color:${color};">${statusStr}</td>
            <td style="color:#666;">${row.justification_text || '-'}</td>
          </tr>
        `
      })
      
      const teachersStr = (c.teachers || []).map((t: any) => t.name).join(', ') || 'Nenhum oficineiro alocado'
      
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Relatório de Frequência - ${c.name}</title>
            <style>
              @page { size: A4; margin: 20mm; }
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; margin: 0; padding: 20px; font-size: 12px; }
              .header { display: flex; align-items: center; border-bottom: 3px solid #D4AF37; padding-bottom: 20px; margin-bottom: 30px; }
              .header img { height: 70px; margin-right: 20px; object-fit: contain; }
              .header-text h1 { margin: 0; font-size: 24px; color: #1a1a1a; text-transform: uppercase; letter-spacing: 1px; }
              .header-text p { margin: 5px 0 0; font-size: 13px; color: #666; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
              th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
              th { background-color: #f9fafb; color: #4b5563; font-weight: bold; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb; }
              tr:nth-child(even) { background-color: #fcfcfc; }
              .footer { text-align: center; font-size: 10px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 40px; }
              @media print {
                body { padding: 0; }
                .header, table, .footer { page-break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <img src="/logo.png" alt="Instituto MCS" />
              <div class="header-text">
                <h1>Instituto MCS</h1>
                <p>Relatório Oficial de Frequência - Turma: <strong>${c.name}</strong></p>
                <p>Oficineiro(s): <strong>${teachersStr}</strong></p>
                <p>Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')} por ${user.name}</p>
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Data da Aula</th>
                  <th>Aula / Assunto</th>
                  <th>Status</th>
                  <th>Justificativa</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
            
            <div class="footer">
              Instituto de Missões, Cultura e Sociedade - Relatório gerado eletronicamente.
            </div>
            
            <script>
              window.onload = function() {
                setTimeout(function() { window.print(); }, 500);
              }
            </script>
          </body>
        </html>
      `
      win.document.write(html)
      win.document.close()
    } catch {
      alert('Erro ao gerar relatório')
    }
  }

  // --- Lessons Logic ---
  const openLessons = async (c: any) => {
    setActiveClass(c)
    setView('lessons')
    await loadLessons(c.id)
  }

  const loadLessons = async (cid: number) => {
    try {
      const r = await fetch(`/api/classes/${cid}/lessons`, {headers:authH()})
      setLessons(await r.json())
    } catch {}
  }

  const saveLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch(`/api/classes/${activeClass.id}/lessons`, {
        method: 'POST', headers: authH(), body: JSON.stringify(lessonForm)
      })
      setShowLessonForm(false)
      loadLessons(activeClass.id)
      setLessonForm({ title: '', date: new Date().toISOString().split('T')[0], start_time: '', end_time: '', description: '' })
    } catch { alert('Erro ao salvar aula') }
  }

  // --- Attendance Logic ---
  const openAttendance = async (lesson: any) => {
    setActiveLesson(lesson)
    setView('attendance')
    try {
      const r = await fetch(`/api/classes/lessons/${lesson.id}/attendance`, {headers:authH()})
      setAttendance(await r.json())
    } catch {}
  }

  const handleAttChange = (student_id: number, field: string, value: any) => {
    const existing = attendance.find(a => a.student_id === student_id)
    if (existing) {
      setAttendance(attendance.map(a => a.student_id === student_id ? { ...a, [field]: value } : a))
    } else {
      setAttendance([...attendance, { student_id, status: 'present', [field]: value }])
    }
  }

  const handleFileUpload = async (student_id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('image', file)
    try {
      const r = await fetch('/api/upload', { method: 'POST', headers: { Authorization: `Bearer ${getToken()}` }, body: fd })
      if (!r.ok) {
        const text = await r.text()
        alert('Falha no upload: ' + text)
        return
      }
      const d = await r.json()
      if (d.url) handleAttChange(student_id, 'justification_file_url', d.url)
    } catch (e: any) { alert('Erro na conexão do upload: ' + e.message) }
  }

  const saveAttendance = async () => {
    setSavingAtt(true)
    const records = activeClass.students.map((s:any) => {
      const a = attendance.find(x => x.student_id === s.id)
      return {
        student_id: s.id,
        status: a?.status || 'present',
        justification_text: a?.justification_text || '',
        justification_file_url: a?.justification_file_url || ''
      }
    })
    
    await fetch(`/api/classes/lessons/${activeLesson.id}/attendance`, {
      method: 'POST', headers: authH(), body: JSON.stringify({ records })
    })
    setSavingAtt(false)
    alert('Chamada salva com sucesso!')
  }

  // --- Student History (Parents/Students) ---
  const loadStudentHistory = async (c: any) => {
    setActiveClass(c)
    setView('student_attendance')
    try {
      const r = await fetch(`/api/classes/${c.id}/student-attendance`, {headers:authH()})
      setStudentHistory(await r.json())
    } catch {}
  }

  // View: Student/Parent Attendance History
  if (view === 'student_attendance' && activeClass) {
    const total = studentHistory.length
    const presents = studentHistory.filter(h => h.status === 'present').length
    const pct = total === 0 ? 100 : Math.round((presents / total) * 100)
    
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <button onClick={() => { setActiveClass(null); setView('list') }} className="text-gray-500 font-bold text-sm hover:text-carbono">← Voltar às Turmas</button>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl text-carbono">{activeClass.name}</h2>
            <p className="text-gray-500 text-sm">Boletim de Frequência</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold font-serif text-carbono">{pct}%</p>
            <p className="text-[10px] uppercase font-bold text-gray-400">Presença</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase">
              <tr><th className="px-6 py-4">Aula</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Detalhes</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {studentHistory.map((h, i) => (
                <tr key={i}>
                  <td className="px-6 py-4">
                    <p className="font-bold text-carbono">{h.title}</p>
                    <p className="text-xs text-gray-500">{new Date(h.date+'T00:00:00').toLocaleDateString('pt-BR')} {h.start_time && `- ${h.start_time}`}</p>
                    {h.description && <p className="text-xs text-gray-400 mt-1">{h.description}</p>}
                  </td>
                  <td className="px-6 py-4">
                    {h.status ? (
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${h.status==='present'?'bg-green-100 text-green-700':h.status==='absent'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700'}`}>
                        {h.status==='present' ? 'Presente' : h.status==='absent' ? 'Falta' : 'Justificado'}
                      </span>
                    ) : <span className="text-gray-400 text-xs italic">Sem registro</span>}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {h.justification_text && <p>{h.justification_text}</p>}
                    {h.justification_file_url && <a href={h.justification_file_url} target="_blank" className="text-blue-500 hover:underline mt-1 inline-block font-bold">📎 Ver Atestado</a>}
                  </td>
                </tr>
              ))}
              {studentHistory.length === 0 && <tr><td colSpan={3} className="text-center py-8 text-gray-400">Nenhuma aula registrada ainda.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // View: Lessons List (Oficineiro / Admin)
  if (view === 'lessons' && activeClass) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <button onClick={() => { setActiveClass(null); setView('list') }} className="text-gray-500 font-bold text-sm hover:text-carbono">← Voltar às Turmas</button>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl text-carbono">{activeClass.name}</h2>
            <p className="text-gray-500 text-sm">Diário de Classe - Aulas</p>
          </div>
          <button onClick={() => setShowLessonForm(true)} className="bg-carbono text-marfim px-6 py-2.5 rounded-full text-sm font-bold hover:bg-gray-800 shadow-lg">+ Registrar Nova Aula</button>
        </div>

        {showLessonForm && (
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 mb-6 relative">
            <h3 className="font-bold text-carbono mb-4">Dados da Aula</h3>
            <form onSubmit={saveLesson} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-2 md:col-span-4">
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Título / Assunto *</label>
                <input required placeholder="Ex: Aula Inaugural, Teoria Musical..." value={lessonForm.title} onChange={e=>setLessonForm({...lessonForm,title:e.target.value})} className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-sm outline-none focus:border-dourado" />
              </div>
              <div className="col-span-2 md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Data *</label>
                <input required type="date" value={lessonForm.date} onChange={e=>setLessonForm({...lessonForm,date:e.target.value})} className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-sm outline-none focus:border-dourado" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Início</label>
                <input type="time" value={lessonForm.start_time} onChange={e=>setLessonForm({...lessonForm,start_time:e.target.value})} className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-sm outline-none focus:border-dourado" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Término</label>
                <input type="time" value={lessonForm.end_time} onChange={e=>setLessonForm({...lessonForm,end_time:e.target.value})} className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-sm outline-none focus:border-dourado" />
              </div>
              <div className="col-span-2 md:col-span-4">
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Conteúdo Lecionado / Descrição</label>
                <textarea rows={2} value={lessonForm.description} onChange={e=>setLessonForm({...lessonForm,description:e.target.value})} className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-sm outline-none focus:border-dourado resize-none" />
              </div>
              <div className="col-span-2 md:col-span-4 flex justify-end gap-3 mt-2">
                <button type="button" onClick={()=>setShowLessonForm(false)} className="px-4 py-2 rounded-full text-xs font-bold text-gray-500 hover:bg-gray-100">Cancelar</button>
                <button type="submit" className="bg-dourado text-white px-6 py-2 rounded-full text-xs font-bold hover:bg-yellow-600">Salvar Aula</button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lessons.map(l => (
            <div key={l.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-gray-200 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-carbono">{l.title}</h4>
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">{new Date(l.date+'T00:00:00').toLocaleDateString('pt-BR')}</span>
                </div>
                {l.start_time && <p className="text-xs text-gray-500 mb-2">⏰ {l.start_time} {l.end_time && `às ${l.end_time}`}</p>}
                {l.description && <p className="text-xs text-gray-600 line-clamp-2 mb-4">{l.description}</p>}
              </div>
              <button onClick={() => openAttendance(l)} className="mt-4 w-full bg-gray-50 text-carbono py-2 rounded-xl text-xs font-bold hover:bg-gray-100 border border-gray-100">
                📝 Fazer Chamada
              </button>
            </div>
          ))}
          {lessons.length === 0 && <div className="col-span-full text-center py-12 text-gray-400 bg-white rounded-3xl border border-gray-100">Nenhuma aula registrada.</div>}
        </div>
      </div>
    )
  }

  // View: Attendance List for a specific lesson
  if (view === 'attendance' && activeLesson && activeClass) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <button onClick={() => { setActiveLesson(null); setView('lessons') }} className="text-gray-500 font-bold text-sm hover:text-carbono">← Voltar às Aulas</button>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{activeClass.name}</p>
            <h2 className="font-serif text-2xl text-carbono">{activeLesson.title}</h2>
            <p className="text-gray-500 text-sm">Chamada do dia {new Date(activeLesson.date+'T00:00:00').toLocaleDateString('pt-BR')}</p>
          </div>
          <button onClick={saveAttendance} disabled={savingAtt} className="bg-carbono text-marfim px-6 py-2.5 rounded-full text-sm font-bold hover:bg-gray-800 disabled:opacity-50">
            {savingAtt ? 'Salvando...' : 'Salvar Chamada'}
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase">
              <tr><th className="px-6 py-4">Aluno</th><th className="px-6 py-4">Frequência</th><th className="px-6 py-4">Justificativa (Se houver)</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {activeClass.students.map((s:any) => {
                const att = attendance.find(a => a.student_id === s.id) || { status: 'present' }
                return (
                  <tr key={s.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-semibold text-carbono">{s.name}</td>
                    <td className="px-6 py-4">
                      <select value={att.status} onChange={e=>handleAttChange(s.id, 'status', e.target.value)} className={`text-xs font-bold px-3 py-1.5 rounded-lg border outline-none ${att.status==='present'?'bg-green-50 border-green-200 text-green-700':att.status==='absent'?'bg-red-50 border-red-200 text-red-700':'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
                        <option value="present">Presente</option>
                        <option value="absent">Falta</option>
                        <option value="justified">Falta Justificada</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      {att.status === 'justified' ? (
                        <div className="flex flex-col gap-2">
                          <input placeholder="Motivo da falta..." value={att.justification_text||''} onChange={e=>handleAttChange(s.id, 'justification_text', e.target.value)} className="w-full bg-white border border-gray-200 px-3 py-1.5 rounded-md text-xs" />
                          <div className="flex items-center gap-2">
                            <label className="cursor-pointer bg-gray-100 px-3 py-1.5 rounded-md text-xs font-bold text-gray-600 hover:bg-gray-200 shrink-0">
                              📎 Atestado
                              <input type="file" className="hidden" accept="image/*,.pdf" onChange={e=>handleFileUpload(s.id, e)} />
                            </label>
                            {att.justification_file_url && <a href={att.justification_file_url} target="_blank" className="text-[10px] text-blue-500 underline truncate max-w-[100px]">Ver anexo</a>}
                          </div>
                        </div>
                      ) : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                  </tr>
                )
              })}
              {activeClass.students.length === 0 && <tr><td colSpan={3} className="text-center py-8 text-gray-400">Nenhum aluno nesta turma.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // View: Main Class List
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-serif text-3xl text-carbono">Gestão de Turmas e Frequência</h2>
          <p className="text-sm text-gray-500">Turmas, Oficineiros e Diário de Classe.</p>
        </div>
        {canEditClasses && (
          <button onClick={openNew} className="bg-carbono text-marfim px-6 py-3 rounded-full text-sm font-bold hover:bg-gray-800 shadow-lg">+ Nova Turma</button>
        )}
      </div>

      {showForm && canEditClasses && (
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 mb-8">
          <h3 className="font-bold text-lg text-carbono mb-6">{editingClass ? 'Editar Turma' : 'Criar Turma'}</h3>
          <form onSubmit={saveClass} className="space-y-6">
            <div className="grid grid-cols-2 gap-5">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Nome da Turma *</label>
                <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-dourado" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Descrição</label>
                <textarea rows={2} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-dourado resize-none" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Oficineiros / Professores</label>
                <div className="bg-gray-50 border border-gray-200 rounded-xl max-h-48 overflow-y-auto p-2 space-y-1">
                  {users.filter(u => u.role === 'oficineiro').map(u => (
                    <label key={u.id} className="flex items-center gap-2 text-sm p-2 hover:bg-white rounded cursor-pointer">
                      <input type="checkbox" checked={form.teacher_ids.includes(u.id)} onChange={()=>toggleTeacher(u.id)} className="rounded text-dourado focus:ring-dourado" />
                      {u.name}
                    </label>
                  ))}
                  {users.filter(u => u.role === 'oficineiro').length === 0 && <p className="text-xs text-gray-400 p-2">Nenhum oficineiro cadastrado.</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Alunos Matriculados</label>
                <div className="bg-gray-50 border border-gray-200 rounded-xl max-h-48 overflow-y-auto p-2 space-y-1">
                  {users.filter(u => u.role === 'aluno').map(u => (
                    <label key={u.id} className="flex items-center gap-2 text-sm p-2 hover:bg-white rounded cursor-pointer">
                      <input type="checkbox" checked={form.student_ids.includes(u.id)} onChange={()=>toggleStudent(u.id)} className="rounded text-dourado focus:ring-dourado" />
                      {u.name}
                    </label>
                  ))}
                  {users.filter(u => u.role === 'aluno').length === 0 && <p className="text-xs text-gray-400 p-2">Nenhum aluno cadastrado.</p>}
                </div>
              </div>
            </div>
            <div className="flex items-end justify-end gap-3 pt-4 border-t border-gray-50">
              <button type="button" onClick={()=>setShowForm(false)} className="px-6 py-3 rounded-full text-xs font-bold text-gray-500 hover:bg-gray-100">Cancelar</button>
              <button type="submit" className="bg-carbono text-marfim px-8 py-3 rounded-full text-xs font-bold hover:bg-gray-800">Salvar Turma</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <div className="text-center py-20 text-gray-400">Carregando turmas...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {classes.map(c => (
            <div key={c.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative group">
              <h3 className="font-bold text-xl text-carbono mb-2">{c.name}</h3>
              {c.description && <p className="text-sm text-gray-500 mb-4 line-clamp-2">{c.description}</p>}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-md uppercase">{c.students?.length||0} Alunos</span>
                <span className="text-[10px] font-bold bg-purple-50 text-purple-600 px-2 py-1 rounded-md uppercase">{c.teachers?.length||0} Oficineiros</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                <div className="flex gap-2">
                  <button onClick={() => canTakeAttendance ? openLessons(c) : loadStudentHistory(c)} className="bg-gray-50 text-carbono px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors border border-gray-100">
                    {canTakeAttendance ? '📓 Diário de Classe' : '📊 Ver Frequência'}
                  </button>
                  {canEditClasses && (
                    <button onClick={() => downloadReport(c)} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors border border-blue-100">
                      📄 Relatório
                    </button>
                  )}
                </div>
                {canEditClasses && (
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(c)} className="text-xs font-bold text-gray-400 hover:text-carbono">EDITAR</button>
                    <button onClick={() => deleteClass(c.id)} className="text-xs font-bold text-red-400 hover:text-red-600">EXCLUIR</button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {classes.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-gray-100 text-gray-400 shadow-sm">Nenhuma turma encontrada para o seu perfil.</div>
          )}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// OFICINEIROS REGISTRATIONS TAB
// ═══════════════════════════════════════════════════════════════════
function OficineirosRegistrationTab() {
  const user = getUser()
  const [items, setItems] = useState<OficineiroRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<OficineiroRegistration | null>(null)
  const [statusSaving, setStatusSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/oficineiros', { headers: authH() })
      if (r.ok) setItems(await r.json())
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const updateStatus = async (id: number, newStatus: string) => {
    if (!confirm(`Tem certeza que deseja marcar como ${newStatus}?`)) return
    setStatusSaving(true)
    try {
      const r = await fetch(`/api/oficineiros/${id}`, {
        method: 'PUT',
        headers: authH(),
        body: JSON.stringify({ status: newStatus })
      })
      if (r.ok) {
        setSelectedItem(null)
        load()
      }
    } catch {}
    setStatusSaving(false)
  }

  const canEdit = user.role === 'admin'

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-serif text-2xl text-carbono">Inscrições de Oficineiros</h2>
          <p className="text-sm text-gray-400">Gerencie as candidaturas feitas pelo site</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Carregando inscrições...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500">
                <th className="p-4 font-semibold">Data</th>
                <th className="p-4 font-semibold">Nome</th>
                <th className="p-4 font-semibold">E-mail</th>
                <th className="p-4 font-semibold">Telefone</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">Nenhuma inscrição encontrada.</td>
                </tr>
              )}
              {items.map(item => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="p-4 text-gray-500 whitespace-nowrap">
                    {new Date(item.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-4 font-bold text-carbono">{item.name}</td>
                  <td className="p-4 text-gray-500">{item.email}</td>
                  <td className="p-4 text-gray-500">{item.phone}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      item.status === 'aprovado' ? 'bg-green-100 text-green-700' :
                      item.status === 'rejeitado' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => setSelectedItem(item)} className="text-dourado font-bold text-xs hover:underline">
                      ANALISAR
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 relative">
            <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl">×</button>
            <h3 className="font-serif text-2xl text-carbono mb-6">Análise de Candidato</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div><p className="text-xs text-gray-400 uppercase font-bold">Nome</p><p className="font-semibold text-carbono">{selectedItem.name}</p></div>
              <div><p className="text-xs text-gray-400 uppercase font-bold">Data Nasc.</p><p className="text-carbono">{new Date(selectedItem.birth_date+'T00:00:00').toLocaleDateString('pt-BR')}</p></div>
              <div><p className="text-xs text-gray-400 uppercase font-bold">E-mail</p><p className="text-carbono">{selectedItem.email}</p></div>
              <div><p className="text-xs text-gray-400 uppercase font-bold">Telefone</p><p className="text-carbono">{selectedItem.phone}</p></div>
              <div><p className="text-xs text-gray-400 uppercase font-bold">CPF</p><p className="text-carbono">{selectedItem.cpf}</p></div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Formação Escolar/Acadêmica</p>
                <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 whitespace-pre-wrap">{selectedItem.education}</div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Experiência Profissional</p>
                <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 whitespace-pre-wrap">{selectedItem.experience}</div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Como pode agregar</p>
                <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 whitespace-pre-wrap">{selectedItem.contribution}</div>
              </div>
            </div>

            {canEdit && selectedItem.status === 'pendente' && (
              <div className="mt-8 flex gap-4">
                <button 
                  disabled={statusSaving}
                  onClick={() => updateStatus(selectedItem.id, 'rejeitado')} 
                  className="flex-1 bg-red-50 text-red-600 font-bold py-3 rounded-xl hover:bg-red-100 disabled:opacity-50"
                >
                  REJEITAR
                </button>
                <button 
                  disabled={statusSaving}
                  onClick={() => updateStatus(selectedItem.id, 'aprovado')} 
                  className="flex-1 bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600 disabled:opacity-50"
                >
                  APROVAR
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
