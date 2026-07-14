import React, { useState } from 'react'

type Answer = 'sim' | 'nao' | 'as_vezes' | ''

interface TriageCategory {
  questions: Record<string, Answer>;
  observations: string;
}

export interface AnamnesisData {
  tdah: TriageCategory;
  autism: TriageCategory;
  tpac: TriageCategory;
  depression: TriageCategory;
  ocd: TriageCategory;
  intellectual_disability: TriageCategory;
  domestic_violence: TriageCategory;
  substance_abuse: TriageCategory;
  general_observations: string;
}

const CATEGORIES = [
  {
    id: 'tdah', label: 'TDAH / Hiperatividade',
    questions: [
      { id: 't1', text: 'Apresenta dificuldade em manter a atenção em tarefas ou atividades lúdicas?' },
      { id: 't2', text: 'Parece não escutar quando lhe dirigem a palavra diretamente?' },
      { id: 't3', text: 'Tem dificuldade em seguir instruções até o fim (frequentemente perde o foco)?' },
      { id: 't4', text: 'Costuma batucar com as mãos/pés ou se remexer na cadeira frequentemente?' },
      { id: 't5', text: 'Fala em excesso ou tem dificuldade em brincar/trabalhar silenciosamente?' }
    ]
  },
  {
    id: 'autism', label: 'Transtorno do Espectro Autista (TEA)',
    questions: [
      { id: 'a1', text: 'Evita ou tem dificuldade em manter contato visual constante?' },
      { id: 'a2', text: 'Apresenta movimentos repetitivos (ex: balançar as mãos, girar objetos)?' },
      { id: 'a3', text: 'Tem forte apego a rotinas e resiste a mudanças, ficando muito irritado?' },
      { id: 'a4', text: 'Possui hipersensibilidade a sons, luzes ou texturas?' },
      { id: 'a5', text: 'Apresenta dificuldade em interações sociais e em compreender brincadeiras de faz-de-conta?' }
    ]
  },
  {
    id: 'tpac', label: 'Transtorno do Processamento Auditivo Central (TPAC)',
    questions: [
      { id: 'p1', text: 'Tem dificuldade em compreender a fala em ambientes ruidosos (com barulho de fundo)?' },
      { id: 'p2', text: 'Pede frequentemente para que repitam o que foi dito (dizendo "O quê?", "Hã?")?' },
      { id: 'p3', text: 'Confunde ordens ou sequências de informações passadas oralmente?' },
      { id: 'p4', text: 'Tem dificuldade em localizar de onde vem um som?' }
    ]
  },
  {
    id: 'depression', label: 'Depressão / Ansiedade',
    questions: [
      { id: 'd1', text: 'Chora frequentemente ou parece triste a maior parte do tempo?' },
      { id: 'd2', text: 'Apresenta medos excessivos, preocupações ou fobias desproporcionais?' },
      { id: 'd3', text: 'Tem queixas físicas constantes sem causa aparente (ex: dor de barriga, dor de cabeça)?' },
      { id: 'd4', text: 'Evita participar de atividades em grupo por timidez extrema ou insegurança?' },
      { id: 'd5', text: 'Perdeu o interesse em atividades ou brincadeiras que antes gostava?' }
    ]
  },
  {
    id: 'ocd', label: 'Transtorno Obsessivo Compulsivo (TOC)',
    questions: [
      { id: 'o1', text: 'Apresenta rituais repetitivos que "precisam" ser feitos (ex: lavar as mãos excessivamente)?' },
      { id: 'o2', text: 'Demonstra preocupação exagerada com simetria, ordem ou limpeza?' },
      { id: 'o3', text: 'Tem pensamentos intrusivos que o/a deixam muito aflito/a?' }
    ]
  },
  {
    id: 'intellectual_disability', label: 'Deficiência Intelectual / Atraso Cognitivo',
    questions: [
      { id: 'i1', text: 'Demorou mais do que o esperado para começar a falar ou a andar?' },
      { id: 'i2', text: 'Apresenta dificuldade de aprendizado significativamente maior que outras crianças da mesma idade?' },
      { id: 'i3', text: 'Tem dificuldade nas atividades de vida diária (ex: se vestir, usar o banheiro sozinho)?' }
    ]
  },
  {
    id: 'domestic_violence', label: 'Suspeita de Violência Doméstica / Abuso',
    questions: [
      { id: 'v1', text: 'Apresenta marcas físicas constantes ou inexplicáveis (hematomas, arranhões)?' },
      { id: 'v2', text: 'Demonstra comportamento sexualizado inapropriado para a idade?' },
      { id: 'v3', text: 'Retrai-se excessivamente quando um adulto se aproxima repentinamente?' },
      { id: 'v4', text: 'Apresenta mudanças drásticas e repentinas de comportamento ou humor?' }
    ]
  },
  {
    id: 'substance_abuse', label: 'Uso de Álcool ou Drogas (Adolescentes/Jovens)',
    questions: [
      { id: 's1', text: 'Houve queda repentina no rendimento escolar ou faltas frequentes?' },
      { id: 's2', text: 'Apresenta agressividade, alteração brusca de humor ou sinais de embriaguez/intoxicação?' },
      { id: 's3', text: 'Tem andado com grupos envolvidos em situações de risco?' }
    ]
  }
]

const emptyCategory = (): TriageCategory => ({ questions: {}, observations: '' })

const defaultData: AnamnesisData = {
  tdah: emptyCategory(),
  autism: emptyCategory(),
  tpac: emptyCategory(),
  depression: emptyCategory(),
  ocd: emptyCategory(),
  intellectual_disability: emptyCategory(),
  domestic_violence: emptyCategory(),
  substance_abuse: emptyCategory(),
  general_observations: ''
}

interface Props {
  user: any;
  onClose: () => void;
  onSaved: (data?: AnamnesisData) => void;
  authH: () => any;
}

export default function AnamnesisModal({ user, onClose, onSaved, authH }: Props) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [expandedCat, setExpandedCat] = useState<string | null>(CATEGORIES[0].id)

  const [data, setData] = useState<AnamnesisData>(() => {
    if (user.anamnesis_data) {
      try {
        const parsed = typeof user.anamnesis_data === 'string' ? JSON.parse(user.anamnesis_data) : user.anamnesis_data
        
        // Handle migration from old format to new format
        // If the old format had { tdah: { identified: boolean, details: string } }
        // We ensure we don't crash and just initialize properly.
        const migrated = { ...defaultData }
        for (const cat of CATEGORIES) {
          const oldCat = parsed[cat.id]
          if (oldCat && typeof oldCat === 'object') {
            (migrated as any)[cat.id] = {
              questions: oldCat.questions || {},
              observations: oldCat.observations || oldCat.details || ''
            }
          }
        }
        migrated.general_observations = parsed.general_observations || ''
        return migrated
      } catch (e) {
        return defaultData
      }
    }
    return defaultData
  })

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (user?.id) {
        const r = await fetch(`/api/users/${user.id}/anamnesis`, {
          method: 'PUT',
          headers: { ...authH(), 'Content-Type': 'application/json' },
          body: JSON.stringify({ anamnesis_data: data })
        })
        if (!r.ok) {
          const d = await r.json()
          setError(d.error || 'Erro ao salvar anamnese')
        } else {
          onSaved(data)
        }
      } else {
        onSaved(data)
      }
    } catch {
      setError('Erro de conexão')
    }
    setSaving(false)
  }

  const setAnswer = (catId: keyof AnamnesisData, qId: string, answer: Answer) => {
    setData(prev => {
      const cat = prev[catId] as TriageCategory
      return {
        ...prev,
        [catId]: {
          ...cat,
          questions: { ...cat.questions, [qId]: answer }
        }
      }
    })
  }

  const setObservation = (catId: keyof AnamnesisData | 'general_observations', obs: string) => {
    if (catId === 'general_observations') {
      setData(prev => ({ ...prev, general_observations: obs }))
      return
    }
    setData(prev => {
      const cat = prev[catId] as TriageCategory
      return {
        ...prev,
        [catId]: { ...cat, observations: obs }
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-start justify-center p-4 overflow-y-auto pt-10 pb-20">
      <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-4xl p-8 relative flex flex-col max-h-[90vh]">
        <div className="flex justify-between mb-6 border-b border-gray-100 pb-4 shrink-0">
          <div>
            <h3 className="font-serif text-2xl text-carbono">Questionário de Triagem Clínica</h3>
            <p className="text-sm text-gray-500 font-bold mt-1">Aluno: <span className="text-dourado">{user.name}</span></p>
          </div>
          <button onClick={onClose} className="text-gray-400 text-3xl hover:text-carbono leading-none">&times;</button>
        </div>

        {error && <div className="mb-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100 shrink-0">{error}</div>}

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <form id="anamnesis-form" onSubmit={save} className="space-y-4">
            
            {CATEGORIES.map(cat => {
              const catData = data[cat.id as keyof AnamnesisData] as TriageCategory
              const isExpanded = expandedCat === cat.id
              
              // Conta quantos sim/nao/as vezes tem
              let answeredCount = 0
              for (const q of cat.questions) {
                if (catData.questions[q.id]) answeredCount++
              }

              return (
                <div key={cat.id} className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isExpanded ? 'border-dourado/50 shadow-sm' : 'border-gray-200'}`}>
                  <button 
                    type="button" 
                    onClick={() => setExpandedCat(isExpanded ? null : cat.id)}
                    className={`w-full px-6 py-4 flex items-center justify-between text-left ${isExpanded ? 'bg-dourado/5' : 'bg-white hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-carbono">{cat.label}</span>
                      {answeredCount > 0 && (
                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">
                          {answeredCount}/{cat.questions.length} Respondidas
                        </span>
                      )}
                    </div>
                    <span className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                  </button>

                  {isExpanded && (
                    <div className="p-6 bg-white border-t border-gray-100 animate-fade-in">
                      <div className="space-y-4">
                        {cat.questions.map(q => {
                          const ans = catData.questions[q.id] || ''
                          return (
                            <div key={q.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                              <p className="text-sm text-carbono md:w-2/3">{q.text}</p>
                              <div className="flex gap-2 shrink-0">
                                <button type="button" onClick={() => setAnswer(cat.id as any, q.id, 'sim')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${ans === 'sim' ? 'bg-red-100 text-red-700 border-red-200 border' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}>Sim</button>
                                <button type="button" onClick={() => setAnswer(cat.id as any, q.id, 'as_vezes')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${ans === 'as_vezes' ? 'bg-yellow-100 text-yellow-700 border-yellow-200 border' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}>Às Vezes</button>
                                <button type="button" onClick={() => setAnswer(cat.id as any, q.id, 'nao')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${ans === 'nao' ? 'bg-green-100 text-green-700 border-green-200 border' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}>Não</button>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      <div className="mt-6">
                        <label className="text-xs text-gray-500 font-bold block mb-2">Observações / Detalhes Adicionais sobre {cat.label.split('/')[0]}</label>
                        <textarea
                          value={catData.observations}
                          onChange={(e) => setObservation(cat.id as any, e.target.value)}
                          placeholder="Caso tenha marcado Sim/Às Vezes em algum item, detalhe aqui as observações, laudos médicos prévios ou contexto..."
                          className="w-full border border-gray-200 p-3 rounded-xl text-sm focus:border-dourado outline-none resize-y min-h-[80px] bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            <div className="pt-6 mt-6 border-t border-gray-100">
              <label className="font-bold text-sm text-carbono block mb-2">Parecer Geral da Triagem / Outras Observações</label>
              <textarea
                value={data.general_observations}
                onChange={(e) => setObservation('general_observations', e.target.value)}
                placeholder="Insira um parecer geral sobre a triagem, anotações relevantes sobre o contexto social do aluno, alergias ou medicações contínuas..."
                className="w-full border border-gray-200 p-4 rounded-xl text-sm focus:border-dourado outline-none resize-y min-h-[120px] bg-gray-50"
              />
            </div>
          </form>
        </div>

        <div className="flex gap-4 pt-6 mt-4 border-t border-gray-100 shrink-0">
          <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-3.5 rounded-full text-sm font-bold hover:bg-gray-50">Cancelar</button>
          <button form="anamnesis-form" type="submit" disabled={saving} className="flex-1 bg-carbono text-marfim py-3.5 rounded-full text-sm font-bold hover:bg-gray-800 disabled:opacity-60 shadow-lg shadow-black/10">
            {saving ? 'Salvando...' : 'SALVAR TRIAGEM'}
          </button>
        </div>
      </div>
    </div>
  )
}
