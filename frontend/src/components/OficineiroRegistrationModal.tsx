import React, { useState } from 'react'

export interface TestBlockOption {
  letter: 'A' | 'B' | 'C' | 'D'
  text: string
}

export interface TestBlock {
  id: number
  title: string
  options: TestBlockOption[]
}

export const TEST_BLOCKS: TestBlock[] = [
  {
    id: 1,
    title: 'Bloco 1: Gestão de Imprevistos e Crises',
    options: [
      { letter: 'A', text: 'Analiso friamente a quebra do processo para reorganizar a agenda com base em dados lógicos.' },
      { letter: 'B', text: 'Conduzo o grupo para uma dinâmica criativa improvisada, mantendo o engajamento alto.' },
      { letter: 'C', text: 'Paro a sessão para ouvir o sentimento do grupo e decidir o caminho em conjunto.' },
      { letter: 'D', text: 'Assumo a liderança da situação com firmeza para garantir a entrega do objetivo principal.' }
    ]
  },
  {
    id: 2,
    title: 'Bloco 2: Foco de Energia e Motivação',
    options: [
      { letter: 'A', text: 'Garantir que o conteúdo programático seja absorvido de ponta a ponta com clareza.' },
      { letter: 'B', text: 'Despertar insights e ideias fora da caixa através de interações dinâmicas.' },
      { letter: 'C', text: 'Construir um ambiente seguro e de alta conexão emocional entre as pessoas.' },
      { letter: 'D', text: 'Concluir a sessão com planos de ação claros, práticos e focados em resultados.' }
    ]
  },
  {
    id: 3,
    title: 'Bloco 3: Postura Diante da Resistência',
    options: [
      { letter: 'A', text: 'Desarmar a objeção apresentando fatos, regras estruturadas e argumentos lógicos.' },
      { letter: 'B', text: 'Utilizar o humor e perguntas provocativas para mudar o foco da tensão no ambiente.' },
      { letter: 'C', text: 'Chamar o participante para uma conversa reservada para acolher sua insatisfação.' },
      { letter: 'D', text: 'Neutralizar a interrupção de forma direta para manter o ritmo e o tempo da sessão.' }
    ]
  },
  {
    id: 4,
    title: 'Bloco 4: Estilo de Preparação e Planejamento',
    options: [
      { letter: 'A', text: 'Detalhar o roteiro minuto a minuto, prevendo antecipadamente os riscos técnicos.' },
      { letter: 'B', text: 'Desenhar uma estrutura flexível que me permita cocriar o caminho com o público.' },
      { letter: 'C', text: 'Desenhar a jornada priorizando o nível de energia e a integração dos participantes.' },
      { letter: 'D', text: 'Focar em um checklist objetivo focado exclusivamente nos entregáveis da sessão.' }
    ]
  }
]

export interface ProfileGuide {
  letter: 'A' | 'B' | 'C' | 'D'
  title: string
  shortTitle: string
  summary: string
  strengths: string
  pointsOfAttention: string
  color: string
  badgeBg: string
  badgeText: string
  borderColor: string
}

export const PROFILE_GUIDES: Record<'A' | 'B' | 'C' | 'D', ProfileGuide> = {
  A: {
    letter: 'A',
    title: 'Perfil Analítico / Processual',
    shortTitle: 'Analítico / Processual',
    summary: 'Altamente metódico, focado em conformidade, dados e cronogramas.',
    strengths: 'Excelente para treinamentos técnicos, transferências de processos complexos e cenários que exigem governança rígida.',
    pointsOfAttention: 'Pode demonstrar rigidez excessiva diante de públicos altamente disruptivos ou quando o cronograma estoura.',
    color: '#3b82f6',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800',
    borderColor: 'border-blue-200'
  },
  B: {
    letter: 'B',
    title: 'Perfil Adaptativo / Inspirador',
    shortTitle: 'Adaptativo / Inspirador',
    summary: 'Criativo, focado em inovação, engajamento orgânico e quebra de padrões.',
    strengths: 'Perfeito para workshops de ideação, design thinking, convenções e públicos desengajados.',
    pointsOfAttention: 'Risco de perder o controle do tempo (timeboxing) ou deixar lacunas conceituais por focar excessivamente na dinâmica.',
    color: '#ec4899',
    badgeBg: 'bg-pink-100',
    badgeText: 'text-pink-800',
    borderColor: 'border-pink-200'
  },
  C: {
    letter: 'C',
    title: 'Perfil Facilitador Humanista / Mediador',
    shortTitle: 'Humanista / Mediador',
    summary: 'Centrado na segurança psicológica, escuta ativa e conexões interpessoais.',
    strengths: 'Ideal para resolução de conflitos internos, construção de cultura, onboarding e dinâmicas de times (team building).',
    pointsOfAttention: 'Dificuldade em confrontar participantes tóxicos de forma direta ou em cortar conversas improdutivas para focar na meta.',
    color: '#10b981',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    borderColor: 'border-emerald-200'
  },
  D: {
    letter: 'D',
    title: 'Perfil Direcional / Executivo',
    shortTitle: 'Direcional / Executivo',
    summary: 'Pragmático, focado em eficiência, planos de ação e alta produtividade.',
    strengths: 'Excelente para reuniões de planejamento estratégico, alinhamento de lideranças e dinâmicas focadas em tomadas de decisão rápidas.',
    pointsOfAttention: 'Pode atropelar o tempo de maturação do grupo ou parecer impaciente com participantes que precisam de mais contextualização.',
    color: '#f59e0b',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    borderColor: 'border-amber-200'
  }
}

interface BlockAnswer {
  mais: 'A' | 'B' | 'C' | 'D' | null
  menos: 'A' | 'B' | 'C' | 'D' | null
}

interface Props {
  onClose: () => void
}

export default function OficineiroRegistrationModal({ onClose }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    birth_date: '',
    education: '',
    experience: '',
    contribution: ''
  })
  const [termsAccepted, setTermsAccepted] = useState(false)
  
  // Test answers for blocks 1, 2, 3, 4
  const [answers, setAnswers] = useState<Record<number, BlockAnswer>>({
    1: { mais: null, menos: null },
    2: { mais: null, menos: null },
    3: { mais: null, menos: null },
    4: { mais: null, menos: null }
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Calculations
  const calculateScores = () => {
    const scores: Record<'A' | 'B' | 'C' | 'D', number> = { A: 0, B: 0, C: 0, D: 0 }
    
    for (let b = 1; b <= 4; b++) {
      const ans = answers[b]
      if (ans.mais) scores[ans.mais] += 2
      if (ans.menos) scores[ans.menos] += 0
      
      const letters: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D']
      letters.forEach(l => {
        if (l !== ans.mais && l !== ans.menos) {
          scores[l] += 1
        }
      })
    }

    const sorted = (['A', 'B', 'C', 'D'] as const).map(letter => ({
      letter,
      score: scores[letter]
    })).sort((a, b) => b.score - a.score)

    return {
      scores,
      primary: sorted[0].letter,
      secondary: sorted[1].letter
    }
  }

  const handleSelectAnswer = (blockId: number, type: 'mais' | 'menos', letter: 'A' | 'B' | 'C' | 'D') => {
    setAnswers(prev => {
      const current = prev[blockId]
      let newMais = current.mais
      let newMenos = current.menos

      if (type === 'mais') {
        newMais = current.mais === letter ? null : letter
        if (newMenos === letter) newMenos = null
      } else {
        newMenos = current.menos === letter ? null : letter
        if (newMais === letter) newMais = null
      }

      return {
        ...prev,
        [blockId]: { mais: newMais, menos: newMenos }
      }
    })
  }

  const isBlockComplete = (blockId: number) => {
    const ans = answers[blockId]
    return ans.mais !== null && ans.menos !== null && ans.mais !== ans.menos
  }

  const isTestComplete = () => {
    return [1, 2, 3, 4].every(isBlockComplete)
  }

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!termsAccepted) {
      setError('Você deve aceitar os termos de responsabilidade e política de segurança para continuar.')
      return
    }
    setError('')
    setStep(2)
  }

  const handleNextStep2 = () => {
    if (!isTestComplete()) {
      setError('Por favor, selecione 1 opção MAIS e 1 opção MENOS em todos os 4 blocos antes de continuar.')
      return
    }
    setError('')
    setStep(3)
  }

  const handleSubmitFinal = async () => {
    setSaving(true)
    setError('')

    const { scores, primary, secondary } = calculateScores()

    try {
      const response = await fetch('/api/oficineiros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tenant_id: 'instituto-mcs',
          test_answers: answers,
          scores,
          primary_profile: primary,
          secondary_profile: secondary
        })
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Erro ao enviar inscrição. Tente novamente.')
      } else {
        setSuccess(true)
      }
    } catch (e) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const { scores, primary, secondary } = calculateScores()
  const primaryGuide = PROFILE_GUIDES[primary]
  const secondaryGuide = PROFILE_GUIDES[secondary]

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 md:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col relative overflow-hidden shadow-2xl my-auto">
        
        {/* Header Bar */}
        <div className="bg-[#0f2027] text-white px-6 md:px-8 py-5 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-dourado text-carbono font-bold text-[10px] uppercase px-2 py-0.5 rounded-full">
                {step === 1 ? 'Etapa 1 de 3' : step === 2 ? 'Etapa 2 de 3' : 'Etapa 3 de 3'}
              </span>
              <h2 className="font-serif text-xl md:text-2xl text-white">Cadastro de Facilitador MCS</h2>
            </div>
            <p className="text-xs text-gray-300 mt-1">
              {step === 1 && 'Preencha suas informações pessoais e acadêmicas.'}
              {step === 2 && 'Ficha do Facilitador: Responda ao Teste de Perfil Comportamental.'}
              {step === 3 && 'Resultado do seu perfil de facilitação e confirmação.'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-300 hover:text-white p-2 text-2xl transition-colors rounded-full hover:bg-white/10"
          >
            ×
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 h-1.5 shrink-0">
          <div 
            className="bg-dourado h-1.5 transition-all duration-300"
            style={{ width: step === 1 ? '33.3%' : step === 2 ? '66.6%' : '100%' }}
          />
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
          {success ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner">
                ✓
              </div>
              <h3 className="font-serif text-3xl text-carbono">Inscrição Enviada com Sucesso!</h3>
              <p className="text-gray-600 max-w-md mx-auto text-sm leading-relaxed">
                Seu cadastro e seu **Teste de Perfil Comportamental** foram gravados com sucesso. Nossa diretoria analisará seu perfil e entrará em contato em breve.
              </p>
              
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 max-w-md mx-auto text-left space-y-3">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="text-xs text-gray-500 uppercase font-bold">Perfil Predominante</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${primaryGuide.badgeBg} ${primaryGuide.badgeText}`}>
                    {primaryGuide.title}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 uppercase font-bold">Perfil Secundário</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${secondaryGuide.badgeBg} ${secondaryGuide.badgeText}`}>
                    {secondaryGuide.title}
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={onClose}
                  className="bg-carbono text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors shadow-md"
                >
                  Concluir e Fechar
                </button>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-medium flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* ── STEP 1: PERSONAL & PROFESSIONAL DATA ────────────────── */}
              {step === 1 && (
                <form onSubmit={handleNextStep1} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nome Completo *</label>
                      <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-dourado bg-gray-50 text-sm" placeholder="Seu nome completo" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">E-mail *</label>
                      <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-dourado bg-gray-50 text-sm" placeholder="seu@email.com" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Telefone/WhatsApp *</label>
                      <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-dourado bg-gray-50 text-sm" placeholder="(11) 99999-9999" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">CPF *</label>
                      <input required value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-dourado bg-gray-50 text-sm" placeholder="000.000.000-00" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Data de Nasc. *</label>
                      <input required type="date" value={form.birth_date} onChange={e => setForm({...form, birth_date: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-dourado bg-gray-50 text-sm" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Formação Escolar/Acadêmica *</label>
                    <textarea required value={form.education} onChange={e => setForm({...form, education: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-dourado bg-gray-50 text-sm min-h-[70px] resize-none" placeholder="Descreva sua formação..." />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Experiência Profissional *</label>
                    <textarea required value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-dourado bg-gray-50 text-sm min-h-[70px] resize-none" placeholder="Descreva sua experiência prévia..." />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">O que você pode agregar ao projeto? *</label>
                    <textarea required value={form.contribution} onChange={e => setForm({...form, contribution: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-dourado bg-gray-50 text-sm min-h-[70px] resize-none" placeholder="Habilidades, ideias ou metodologias..." />
                  </div>

                  <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <input 
                      type="checkbox" 
                      id="terms" 
                      checked={termsAccepted} 
                      onChange={e => setTermsAccepted(e.target.checked)} 
                      className="mt-1 w-4 h-4 text-dourado rounded border-gray-300 focus:ring-dourado" 
                      required
                    />
                    <label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed cursor-pointer">
                      Li e concordo com os <span className="font-bold text-carbono">Termos de Responsabilidade</span> e a <span className="font-bold text-carbono">Política de Segurança</span> do Instituto MCS.
                    </label>
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button type="button" onClick={onClose} className="w-1/3 py-3 rounded-xl font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm">
                      Cancelar
                    </button>
                    <button type="submit" className="w-2/3 bg-dourado text-carbono py-3 rounded-xl font-bold hover:bg-yellow-500 transition-colors text-sm shadow-md flex items-center justify-center gap-2">
                      Ir para o Teste de Perfil →
                    </button>
                  </div>
                </form>
              )}

              {/* ── STEP 2: CANDIDATE PROFILE TEST (4 BLOCKS) ──────────── */}
              {step === 2 && (
                <div className="space-y-6">
                  {/* Instructions Callout */}
                  <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 md:p-5 text-amber-900 text-xs md:text-sm leading-relaxed space-y-2">
                    <h4 className="font-bold text-amber-950 flex items-center gap-2 text-sm md:text-base">
                      <span>📋</span> Instruções para o Candidato
                    </h4>
                    <p>
                      Em cada uma das 4 situações abaixo, escolha obrigatoriamente:
                    </p>
                    <div className="flex flex-wrap gap-3 font-semibold pt-1">
                      <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-lg border border-emerald-200">
                        🟢 1 afirmação que MAIS (M) representa você (+2 pts)
                      </span>
                      <span className="bg-rose-100 text-rose-800 px-3 py-1 rounded-lg border border-rose-200">
                        🔴 1 afirmação que MENOS (L) representa você (0 pts)
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800">
                      * As outras 2 opções não marcadas contarão automaticamente como neutras (+1 pt cada).
                    </p>
                  </div>

                  {/* 4 Blocks */}
                  <div className="space-y-6">
                    {TEST_BLOCKS.map((block) => {
                      const complete = isBlockComplete(block.id)
                      const ans = answers[block.id]

                      return (
                        <div 
                          key={block.id} 
                          className={`border rounded-2xl p-5 md:p-6 transition-all ${
                            complete ? 'border-emerald-300 bg-emerald-50/20' : 'border-gray-200 bg-white shadow-sm'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-base text-carbono flex items-center gap-2">
                              <span>{block.title}</span>
                            </h3>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                              complete ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {complete ? '✓ Concluído' : 'Pendente'}
                            </span>
                          </div>

                          <div className="space-y-3">
                            {block.options.map((opt) => {
                              const isMais = ans.mais === opt.letter
                              const isMenos = ans.menos === opt.letter

                              return (
                                <div 
                                  key={opt.letter}
                                  className={`p-3.5 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                                    isMais ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-400' :
                                    isMenos ? 'bg-rose-50 border-rose-400 ring-1 ring-rose-400' :
                                    'bg-gray-50/60 border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <div className="flex items-start gap-3 flex-1">
                                    <span className="w-6 h-6 rounded-lg bg-carbono text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                                      {opt.letter}
                                    </span>
                                    <p className="text-xs md:text-sm text-gray-700 font-medium leading-relaxed">
                                      {opt.text}
                                    </p>
                                  </div>

                                  {/* Selectors */}
                                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                                    <button
                                      type="button"
                                      onClick={() => handleSelectAnswer(block.id, 'mais', opt.letter)}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 ${
                                        isMais 
                                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                                          : 'bg-white text-gray-600 border-gray-200 hover:bg-emerald-50 hover:text-emerald-700'
                                      }`}
                                    >
                                      <span>M</span>
                                      <span className="text-[10px] opacity-80">(MAIS +2)</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleSelectAnswer(block.id, 'menos', opt.letter)}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 ${
                                        isMenos 
                                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm' 
                                          : 'bg-white text-gray-600 border-gray-200 hover:bg-rose-50 hover:text-rose-700'
                                      }`}
                                    >
                                      <span>L</span>
                                      <span className="text-[10px] opacity-80">(MENOS 0)</span>
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button 
                      type="button" 
                      onClick={() => setStep(1)} 
                      className="w-1/3 py-3 rounded-xl font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm"
                    >
                      ← Voltar
                    </button>
                    <button 
                      type="button"
                      onClick={handleNextStep2}
                      disabled={!isTestComplete()}
                      className="w-2/3 bg-dourado text-carbono py-3 rounded-xl font-bold hover:bg-yellow-500 transition-colors text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      Ver Apuração & Resultado →
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 3: RESULT & FINAL CONFIRMATION ─────────────────── */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="text-center space-y-1">
                    <h3 className="font-serif text-2xl text-carbono">Apuração do Seu Perfil de Facilitador</h3>
                    <p className="text-xs text-gray-500">Confira a tabulação das suas respostas antes de enviar seu formulário final.</p>
                  </div>

                  {/* Primary & Secondary Profile Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Primary Profile */}
                    <div className={`p-5 rounded-2xl border ${primaryGuide.borderColor} bg-white shadow-sm space-y-3 relative overflow-hidden`}>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Perfil Predominante</span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${primaryGuide.badgeBg} ${primaryGuide.badgeText}`}>
                          [{primaryGuide.letter}] {scores[primary]} Pontos
                        </span>
                      </div>
                      <h4 className="font-serif text-lg font-bold text-carbono">{primaryGuide.title}</h4>
                      <p className="text-xs text-gray-600 leading-relaxed font-medium">{primaryGuide.summary}</p>
                      
                      <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
                        <div>
                          <strong className="text-emerald-700 block mb-0.5">💪 Pontos Fortes:</strong>
                          <p className="text-gray-600">{primaryGuide.strengths}</p>
                        </div>
                        <div>
                          <strong className="text-amber-700 block mb-0.5">⚠️ Pontos de Atenção:</strong>
                          <p className="text-gray-600">{primaryGuide.pointsOfAttention}</p>
                        </div>
                      </div>
                    </div>

                    {/* Secondary Profile */}
                    <div className={`p-5 rounded-2xl border ${secondaryGuide.borderColor} bg-white shadow-sm space-y-3 relative overflow-hidden`}>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Perfil Secundário</span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${secondaryGuide.badgeBg} ${secondaryGuide.badgeText}`}>
                          [{secondaryGuide.letter}] {scores[secondary]} Pontos
                        </span>
                      </div>
                      <h4 className="font-serif text-lg font-bold text-carbono">{secondaryGuide.title}</h4>
                      <p className="text-xs text-gray-600 leading-relaxed font-medium">{secondaryGuide.summary}</p>

                      <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
                        <div>
                          <strong className="text-emerald-700 block mb-0.5">💪 Pontos Fortes:</strong>
                          <p className="text-gray-600">{secondaryGuide.strengths}</p>
                        </div>
                        <div>
                          <strong className="text-amber-700 block mb-0.5">⚠️ Pontos de Atenção:</strong>
                          <p className="text-gray-600">{secondaryGuide.pointsOfAttention}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pontuação Consolidada */}
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-3">
                    <h4 className="font-bold text-xs uppercase text-gray-500 tracking-wider">Pontuação Geral por Perfil (Máx. 8 Pts cada)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {(['A', 'B', 'C', 'D'] as const).map(letter => {
                        const guide = PROFILE_GUIDES[letter]
                        const score = scores[letter]
                        const pct = (score / 8) * 100

                        return (
                          <div key={letter} className="bg-white p-3 rounded-xl border border-gray-200">
                            <div className="flex justify-between items-center text-xs font-bold mb-1">
                              <span className="text-carbono">[{letter}] {guide.shortTitle}</span>
                              <span style={{ color: guide.color }}>{score} pts</span>
                            </div>
                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                              <div className="h-full transition-all" style={{ width: `${pct}%`, backgroundColor: guide.color }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button 
                      type="button" 
                      onClick={() => setStep(2)} 
                      disabled={saving}
                      className="w-1/3 py-3 rounded-xl font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
                    >
                      ← Revisar Teste
                    </button>
                    <button 
                      type="button"
                      onClick={handleSubmitFinal}
                      disabled={saving}
                      className="w-2/3 bg-dourado text-carbono py-3 rounded-xl font-bold hover:bg-yellow-500 transition-colors text-sm shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {saving ? 'Enviando Candidatura...' : '✓ Confirmar e Enviar Inscrição'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
