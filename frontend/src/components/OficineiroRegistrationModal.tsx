import React, { useState } from 'react'

interface Props {
  onClose: () => void
}

export default function OficineiroRegistrationModal({ onClose }: Props) {
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
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const response = await fetch('/api/oficineiros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tenant_id: 'mcs' })
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

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl my-8 relative overflow-hidden shadow-2xl">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-2 text-2xl z-10"
        >
          ×
        </button>

        <div className="p-8 md:p-10">
          <div className="mb-8">
            <h2 className="font-serif text-3xl text-carbono mb-2">Cadastro de Oficineiro</h2>
            <p className="text-gray-500">Preencha o formulário abaixo para se candidatar a uma vaga de oficineiro em nossos projetos.</p>
          </div>

          {success ? (
            <div className="text-center py-10">
              <div className="text-emerald-500 mb-4 flex justify-center">
                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-serif text-2xl text-carbono mb-2">Inscrição enviada!</h3>
              <p className="text-gray-500 mb-8">Recebemos o seu cadastro com sucesso. Nossa equipe analisará as informações e entrará em contato em breve.</p>
              <button 
                onClick={onClose}
                className="bg-carbono text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors"
              >
                Fechar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">{error}</div>}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nome Completo *</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-dourado bg-gray-50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">E-mail *</label>
                  <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-dourado bg-gray-50" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Telefone/WhatsApp *</label>
                  <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-dourado bg-gray-50" placeholder="(11) 99999-9999" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">CPF *</label>
                  <input required value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-dourado bg-gray-50" placeholder="000.000.000-00" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Data de Nasc. *</label>
                  <input required type="date" value={form.birth_date} onChange={e => setForm({...form, birth_date: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-dourado bg-gray-50" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Formação Escolar/Acadêmica *</label>
                <textarea required value={form.education} onChange={e => setForm({...form, education: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-dourado bg-gray-50 min-h-[80px]" placeholder="Descreva sua formação..."></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Experiência Profissional *</label>
                <textarea required value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-dourado bg-gray-50 min-h-[80px]" placeholder="Descreva sua experiência prévia relacionada à área..."></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">O que você pode agregar ao projeto? *</label>
                <textarea required value={form.contribution} onChange={e => setForm({...form, contribution: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-dourado bg-gray-50 min-h-[80px]" placeholder="Quais habilidades, ideias ou metodologias você traria para as oficinas?"></textarea>
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={onClose} className="w-1/3 py-3 rounded-xl font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="w-2/3 bg-dourado text-carbono py-3 rounded-xl font-bold hover:bg-yellow-500 transition-colors disabled:opacity-50">
                  {saving ? 'Enviando...' : 'Enviar Inscrição'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
