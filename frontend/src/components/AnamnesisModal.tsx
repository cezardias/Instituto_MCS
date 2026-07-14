import React, { useState } from 'react'

export interface AnamnesisData {
  tdah: { identified: boolean; details: string };
  tpac: { identified: boolean; details: string };
  autism: { identified: boolean; details: string };
  depression: { identified: boolean; details: string };
  domestic_violence: { identified: boolean; details: string };
  ocd: { identified: boolean; details: string };
  substance_abuse: { identified: boolean; details: string };
  intellectual_disability: { identified: boolean; details: string };
  general_observations: string;
}

const defaultData: AnamnesisData = {
  tdah: { identified: false, details: '' },
  tpac: { identified: false, details: '' },
  autism: { identified: false, details: '' },
  depression: { identified: false, details: '' },
  domestic_violence: { identified: false, details: '' },
  ocd: { identified: false, details: '' },
  substance_abuse: { identified: false, details: '' },
  intellectual_disability: { identified: false, details: '' },
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

  // Parse existing data or use default
  const [data, setData] = useState<AnamnesisData>(() => {
    if (user.anamnesis_data) {
      try {
        const parsed = JSON.parse(user.anamnesis_data)
        return { ...defaultData, ...parsed }
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
        // User not created yet, just pass data back
        onSaved(data)
      }
    } catch {
      setError('Erro de conexão')
    }
    setSaving(false)
  }

  const updateField = (key: keyof AnamnesisData, subKey: 'identified' | 'details', value: any) => {
    if (key === 'general_observations') {
      setData({ ...data, general_observations: value })
      return
    }
    setData({
      ...data,
      [key]: {
        ...(data[key] as any),
        [subKey]: value
      }
    })
  }

  const sections = [
    { key: 'tdah', label: 'TDAH / Hiperatividade' },
    { key: 'autism', label: 'Transtorno do Espectro Autista (TEA)' },
    { key: 'tpac', label: 'Transtorno do Processamento Auditivo Central (TPAC)' },
    { key: 'depression', label: 'Depressão / Ansiedade' },
    { key: 'ocd', label: 'Transtorno Obsessivo Compulsivo (TOC)' },
    { key: 'intellectual_disability', label: 'Deficiência Intelectual / Atraso Cognitivo' },
    { key: 'domestic_violence', label: 'Suspeita de Violência Doméstica / Abuso' },
    { key: 'substance_abuse', label: 'Uso de Álcool ou Drogas' }
  ] as const

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-start justify-center p-4 overflow-y-auto pt-10 pb-20">
      <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-4xl p-8 relative">
        <div className="flex justify-between mb-6 border-b border-gray-100 pb-4 sticky top-0 bg-white z-10">
          <div>
            <h3 className="font-serif text-2xl text-carbono">Questionário de Anamnese Clínica</h3>
            <p className="text-sm text-gray-500 font-bold mt-1">Aluno: <span className="text-dourado">{user.name}</span></p>
          </div>
          <button onClick={onClose} className="text-gray-400 text-3xl hover:text-carbono leading-none">&times;</button>
        </div>

        {error && <div className="mb-6 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">{error}</div>}

        <form onSubmit={save} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sections.map(({ key, label }) => {
              const field = data[key] as { identified: boolean; details: string }
              return (
                <div key={key} className={`p-5 rounded-2xl border transition-colors ${field.identified ? 'border-dourado bg-yellow-50/30' : 'border-gray-100 bg-gray-50/50'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <label className="font-bold text-sm text-carbono">{label}</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={field.identified} onChange={(e) => updateField(key, 'identified', e.target.checked)} />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-dourado"></div>
                    </label>
                  </div>
                  {field.identified && (
                    <div className="mt-3 animate-fade-in">
                      <label className="text-xs text-gray-500 font-bold block mb-1">Detalhes / Observações</label>
                      <textarea
                        value={field.details}
                        onChange={(e) => updateField(key, 'details', e.target.value)}
                        placeholder="Descreva o diagnóstico, suspeita, medicações em uso..."
                        className="w-full border border-gray-200 p-3 rounded-xl text-sm focus:border-dourado outline-none resize-none h-20 bg-white"
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="pt-4 border-t border-gray-100">
            <label className="font-bold text-sm text-carbono block mb-2">Observações Gerais Complementares</label>
            <textarea
              value={data.general_observations}
              onChange={(e) => updateField('general_observations', 'details', e.target.value)}
              placeholder="Outras informações relevantes sobre o histórico clínico, alergias ou contexto do aluno..."
              className="w-full border border-gray-200 p-4 rounded-xl text-sm focus:border-dourado outline-none resize-y min-h-[100px] bg-gray-50"
            />
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-100 sticky bottom-0 bg-white py-4 mt-8">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-3.5 rounded-full text-sm font-bold hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 bg-carbono text-marfim py-3.5 rounded-full text-sm font-bold hover:bg-gray-800 disabled:opacity-60">{saving ? 'Salvando...' : 'SALVAR ANAMNESE'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
