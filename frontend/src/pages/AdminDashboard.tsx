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
interface Transaction { id:number; tenant_id:string; type:string; category:string; description:string; amount:number; date:string; status:string; created_at:string }
interface AccountabilityReport { id:number; tenant_id:string; project_id:number; project_name?:string; title:string; document_url:string; status:string; created_at:string }
interface DocumentItem { id:number; title:string; type:string; document_url:string; created_at:string }
interface Denuncia { id:number; name:string|null; email:string|null; subject:string; message:string; status:string; created_at:string }
interface VideoComment { id:number; user_name:string; comment:string; created_at:string }
interface Video { id:number; title:string; description:string; author:string; youtube_url:string; category:string; likes:number; userLiked:boolean; comments:VideoComment[]; created_at:string }
interface Comunicado { id:number; title:string; message:string; author_name:string; created_at:string }
interface PassaporteItem { id:number; user_name?:string; badge_name:string; description:string; points:number; created_at:string }

// ─── sidebar config ───────────────────────────────────────────────────
const SIDEBAR = [
  { group: 'GESTÃO', items: [
    { id:'overview', label:'Dashboard Executivo', icon:'⊞', roles:['admin', 'diretoria'] },
    { id:'projetos', label:'Projetos', icon:'🚀', roles:['admin', 'coordenacao', 'oficineiro'] },
    { id:'alunos', label:'Alunos', icon:'🎓', roles:['admin', 'coordenacao', 'oficineiro', 'responsavel'] },
    { id:'frequencia', label:'Frequência', icon:'📅', roles:['admin', 'responsavel'] },
    { id:'comunicados', label:'Comunicados', icon:'📢', roles:['admin', 'aluno', 'responsavel', 'oficineiro', 'coordenacao', 'diretoria'] },
    { id:'news', label:'Notícias do Site', icon:'📰', roles:['admin'] },
    { id:'parceiros', label:'Parceiros', icon:'🤝', roles:['admin'] },
  ]},
  { group: 'FINANCEIRO', items: [
    { id:'financeiro', label:'Recursos Recebidos', icon:'💰', roles:['admin', 'diretoria'] },
    { id:'despesas', label:'Despesas', icon:'📉', roles:['admin', 'diretoria'] },
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
    { id:'ead', label:'Plataforma de Aulas', icon:'▶️', roles:['admin', 'aluno', 'oficineiro', 'coordenacao', 'diretoria', 'responsavel'] },
    { id:'passaporte', label:'Passaporte Cultural', icon:'🏅', roles:['admin', 'aluno'] },
    { id:'gestao_ead', label:'Gestão de Aulas', icon:'🎬', roles:['admin'] },
  ]},
  { group: 'PORTAL DOS PAIS', items: [
    { id:'autorizacoes', label:'Autorizações Digitais', icon:'✍️', roles:['admin', 'responsavel'] },
  ]},
  { group: 'ADMIN', items: [
    { id:'users', label:'Usuários e Perfis', icon:'👥', roles:['admin'] },
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
              {group.items.filter(item => !item.roles || item.roles.includes(user.role)).map(item => (
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
          {!['overview','projetos','alunos','news','users','financeiro','despesas','prestacao','indicadores','relatorios','impacto','documentos','compliance','canal','ead','gestao_ead','comunicados','passaporte'].includes(tab) && <ComingSoon label={currentLabel} />}
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
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'aluno',
    personal_email: '', cpf: '', rg: '', phone: '', address: ''
  })
  const [parentForm, setParentForm] = useState({
    name: '', email: '', personal_email: '', cpf: '', rg: '', phone: ''
  })
  const [photo, setPhoto] = useState<File | null>(null)

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

      const payload = {
        ...form,
        photo_url,
        parent: form.role === 'aluno' ? parentForm : null
      }

      const r = await fetch('/api/users',{method:'POST',headers:authH(),body:JSON.stringify(payload)})
      if (!r.ok) { 
        const d = await r.json(); setError(d.error||'Erro ao criar usuário') 
      } else { 
        setShowForm(false)
        setForm({name:'',email:'',password:'',role:'aluno',personal_email:'',cpf:'',rg:'',phone:'',address:''})
        setParentForm({name:'',email:'',personal_email:'',cpf:'',rg:'',phone:''})
        setPhoto(null)
        load() 
      }
    } catch { setError('Erro de conexão') }
    setSaving(false)
  }
  
  const del = async (id: number) => { if(!confirm('Excluir usuário?')) return; await fetch(`/api/users/${id}`,{method:'DELETE',headers:authH()}); load() }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
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
                <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 mt-6 space-y-4">
                  <h4 className="font-bold text-blue-800 text-sm border-b border-blue-200 pb-2">Dados do Responsável (Pai / Mãe)</h4>
                  <p className="text-xs text-blue-600 mb-4">Ao preencher, o sistema criará o usuário do responsável automaticamente.</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="label-dash text-xs text-blue-700 font-bold block mb-1">Nome do Responsável *</label><input required value={parentForm.name} onChange={e=>setParentForm({...parentForm,name:e.target.value})} className="w-full border border-blue-200 p-2.5 rounded-xl text-sm bg-white" /></div>
                    <div><label className="label-dash text-xs text-blue-700 font-bold block mb-1">E-mail Pessoal (Responsável)</label><input type="email" value={parentForm.personal_email} onChange={e=>setParentForm({...parentForm,personal_email:e.target.value})} className="w-full border border-blue-200 p-2.5 rounded-xl text-sm bg-white" /></div>
                    
                    <div><label className="label-dash text-xs text-blue-700 font-bold block mb-1">CPF (Responsável)</label><input value={parentForm.cpf} onChange={e=>setParentForm({...parentForm,cpf:e.target.value})} className="w-full border border-blue-200 p-2.5 rounded-xl text-sm bg-white" /></div>
                    <div><label className="label-dash text-xs text-blue-700 font-bold block mb-1">Telefone (Responsável)</label><input value={parentForm.phone} onChange={e=>setParentForm({...parentForm,phone:e.target.value})} className="w-full border border-blue-200 p-2.5 rounded-xl text-sm bg-white" /></div>
                  </div>
                </div>
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
                      <button onClick={() => del(u.id)} className="text-xs font-bold text-red-400 hover:text-red-600">EXCLUIR</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// RECURSOS RECEBIDOS TAB (FINANCEIRO)
// ═══════════════════════════════════════════════════════════════════
function FinanceiroTab() {
  const [items, setItems] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ category:'Doação', description:'', amount:'', date:'', status:'pago' })

  const load = useCallback(async () => {
    setLoading(true)
    try { const r = await fetch('/api/finance?type=receita', {headers:authH()}); setItems(await r.json()) } catch { setItems([]) }
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const r = await fetch('/api/finance', { method:'POST', headers:authH(), body:JSON.stringify({...form, type:'receita', amount: Number(form.amount)}) })
      if (!r.ok) { const d = await r.json(); setError(d.error||'Erro') } else { setShowForm(false); setForm({ category:'Doação', description:'', amount:'', date:'', status:'pago' }); load() }
    } catch { setError('Erro de conexão') }
    setSaving(false)
  }
  const del = async (id: number) => { if(!confirm('Excluir registro?')) return; await fetch(`/api/finance/${id}`,{method:'DELETE',headers:authH()}); load() }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="font-serif text-2xl text-carbono">Recursos Recebidos</h2><p className="text-sm text-gray-400">Entradas financeiras (Receitas)</p></div>
        <button onClick={() => setShowForm(true)} className="bg-emerald-600 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-emerald-700 flex items-center gap-2">+ Nova Receita</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-md p-8">
            <div className="flex justify-between mb-6">
              <h3 className="font-serif text-xl text-carbono">Registrar Receita</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 text-2xl">×</button>
            </div>
            {error && <div className="mb-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
            <form onSubmit={save} className="space-y-4">
              <div><label className="label-dash">Categoria</label><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="input-field"><option>Doação</option><option>Patrocínio</option><option>Edital Governamental</option><option>Convênio</option><option>Eventos</option></select></div>
              <div><label className="label-dash">Descrição *</label><input required value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="input-field" placeholder="Origem do recurso" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label-dash">Valor (R$) *</label><input required type="number" step="0.01" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} className="input-field" placeholder="0.00" /></div>
                <div><label className="label-dash">Data *</label><input required type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} className="input-field" /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-full text-sm font-bold">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 bg-emerald-600 text-white py-3 rounded-full text-sm font-bold disabled:opacity-60">{saving ? 'Salvando...' : 'Registrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <div className="text-center py-20 text-gray-400">Carregando...</div> : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
                  <td className="td-cell font-bold text-emerald-600 text-right">R$ {t.amount.toLocaleString('pt-BR', {minimumFractionDigits:2})}</td>
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
// DESPESAS TAB
// ═══════════════════════════════════════════════════════════════════
function DespesasTab() {
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
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="font-serif text-2xl text-carbono">Despesas</h2><p className="text-sm text-gray-400">Saídas financeiras (Custos e Pagamentos)</p></div>
        <button onClick={() => setShowForm(true)} className="bg-red-500 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-red-600 flex items-center gap-2">+ Nova Despesa</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-md p-8">
            <div className="flex justify-between mb-6">
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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="font-serif text-2xl text-carbono">Prestação de Contas</h2><p className="text-sm text-gray-400">Relatórios vinculados a Projetos</p></div>
        <button onClick={() => setShowForm(true)} className="bg-carbono text-marfim px-5 py-2.5 rounded-full text-sm font-bold hover:bg-gray-800 flex items-center gap-2">+ Novo Relatório</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-md p-8">
            <div className="flex justify-between mb-6">
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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
      <div className="flex items-center justify-between mb-6">
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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
      <div className="flex items-center justify-between mb-6">
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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
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
      <div className="flex items-center justify-between mb-8">
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
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ user_id:'', badge_name:'', description:'', points:'' })
  const user = getUser()
  const canEdit = ['admin', 'oficineiro', 'coordenacao'].includes(user.role)

  const load = useCallback(async () => {
    setLoading(true)
    try { 
      const [rItems, rUsers] = await Promise.all([
        fetch('/api/passaporte', {headers:authH()}),
        canEdit ? fetch('/api/users', {headers:authH()}) : Promise.resolve(null)
      ])
      setItems(await rItems.json())
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

  const totalPoints = items.reduce((acc, cur) => acc + (cur.points || 0), 0)

  // Para visualização de alunos (agrupado por nome se for admin, ou listado direto se for aluno)
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8 bg-gradient-to-r from-carbono to-gray-800 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-dourado/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🏅</span>
            <h2 className="font-serif text-3xl font-bold tracking-wide">Passaporte Cultural</h2>
          </div>
          <p className="text-gray-300 text-sm max-w-md">Portfólio verificado de conquistas, habilidades e participação no ecossistema de cultura urbana.</p>
        </div>
        {!canEdit && (
          <div className="relative z-10 bg-white/10 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/20 text-center">
            <p className="text-[10px] text-dourado font-bold uppercase tracking-widest mb-1">Meus Pontos</p>
            <p className="text-5xl font-bold font-serif">{totalPoints}</p>
          </div>
        )}
        {canEdit && (
          <button onClick={() => setShowForm(true)} className="relative z-10 bg-dourado text-carbono px-6 py-3 rounded-full text-sm font-bold hover:bg-yellow-500 shadow-lg">+ Conceder Selo</button>
        )}
      </div>

      {showForm && canEdit && (
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 mb-8">
          <h3 className="font-bold text-lg text-carbono mb-6">Conceder Nova Conquista</h3>
          <form onSubmit={save} className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Aluno</label>
              <select required value={form.user_id} onChange={e=>setForm({...form,user_id:e.target.value})} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-dourado">
                <option value="">Selecione o aluno...</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Selo / Medalha</label>
              <input required placeholder="Ex: Líder de Turma, Oficina Concluída" value={form.badge_name} onChange={e=>setForm({...form,badge_name:e.target.value})} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-dourado" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Descrição (O que o aluno fez?)</label>
              <input required placeholder="Descreva a atividade ou conquista" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-dourado" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">PontosXP</label>
              <input required type="number" placeholder="Ex: 50" value={form.points} onChange={e=>setForm({...form,points:e.target.value})} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-dourado" />
            </div>
            <div className="flex items-end justify-end gap-3">
              <button type="button" onClick={()=>setShowForm(false)} className="px-6 py-3 rounded-full text-xs font-bold text-gray-500 hover:bg-gray-100">CANCELAR</button>
              <button type="submit" className="bg-carbono text-marfim px-8 py-3 rounded-full text-xs font-bold hover:bg-gray-800">SALVAR CONQUISTA</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <div className="text-center py-20 text-gray-400">Carregando passaporte...</div> : (
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
    </div>
  )
}
