import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

export default function PreCadastroPage() {
  const [searchParams] = useSearchParams()
  const initialProjectId = searchParams.get('projeto') || ''

  const [projects, setProjects] = useState<any[]>([])
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const [form, setForm] = useState({
    // Projeto
    project_id: initialProjectId,
    
    // Aluno
    student_name: '',
    student_email: '',
    student_cpf: '',
    student_rg: '',
    address: '',
    gender: 'Feminino',
    rnm: '',
    birth_date: '',
    school_name: '',
    school_shift: 'Matutino',
    school_grade: '',

    // Saúde
    health_allergies: '',
    blood_type: 'Não sei',
    weight: '',
    height: '',
    medications: '',
    health_conditions: '',

    // Responsável
    name: '', // Nome do responsável
    parent_email: '',
    parent_cpf: '',
    parent_rg: '',
    phone: '', // Telefone principal
    emergency_phone: '', // 1º contato de emergência
    emergency_phone_2: '', // 2º contato de emergência
    family_kinship: 'Mãe', // Vínculo familiar
    parents_profession: '',
    family_income: '1 a 2 salários mínimos',
    workplace: '',
    project_expectations: '',
    safety_word: '',

    // Autorizações
    image_voice_authorization: true,
    pick_drop_responsibility: true,
  })

  useEffect(() => {
    fetch('/api/projects?tenant_id=instituto-mcs')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProjects(data.filter(p => p.status === 'em_execucao' || p.status === 'em_planejamento'))
        }
      })
      .catch(err => console.error('Error fetching projects:', err))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    try {
      const res = await fetch('/api/pre-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: 'instituto-mcs',
          name: form.name,
          phone: form.phone,
          email: form.parent_email || form.student_email || '',
          student_name: form.student_name,
          student_email: form.student_email,
          student_cpf: form.student_cpf,
          student_rg: form.student_rg,
          address: form.address,
          gender: form.gender,
          rnm: form.rnm,
          birth_date: form.birth_date,
          school_name: form.school_name,
          school_shift: form.school_shift,
          school_grade: form.school_grade,
          health_allergies: form.health_allergies,
          blood_type: form.blood_type,
          weight: form.weight,
          height: form.height,
          medications: form.medications,
          health_conditions: form.health_conditions,
          parent_name: form.name,
          parent_email: form.parent_email,
          parent_cpf: form.parent_cpf,
          parent_rg: form.parent_rg,
          family_income: form.family_income,
          parents_profession: form.parents_profession,
          workplace: form.workplace,
          emergency_phone: form.emergency_phone,
          emergency_phone_2: form.emergency_phone_2,
          family_kinship: form.family_kinship,
          image_voice_authorization: form.image_voice_authorization,
          pick_drop_responsibility: form.pick_drop_responsibility,
          project_expectations: form.project_expectations,
          safety_word: form.safety_word,
          project_id: form.project_id || null,
        })
      })

      if (res.ok) {
        setStatus('success')
      } else {
        const d = await res.json()
        setErrorMessage(d.error || 'Erro ao enviar cadastro. Verifique as informações e tente novamente.')
        setStatus('error')
      }
    } catch {
      setErrorMessage('Erro de conexão. Tente novamente.')
      setStatus('error')
    }
  }

  const resetForm = () => {
    setStatus('idle')
    setStep(1)
    setForm({
      project_id: '',
      student_name: '',
      student_email: '',
      student_cpf: '',
      student_rg: '',
      address: '',
      gender: 'Feminino',
      rnm: '',
      birth_date: '',
      school_name: '',
      school_shift: 'Matutino',
      school_grade: '',
      health_allergies: '',
      blood_type: 'Não sei',
      weight: '',
      height: '',
      medications: '',
      health_conditions: '',
      name: '',
      parent_email: '',
      parent_cpf: '',
      parent_rg: '',
      phone: '',
      emergency_phone: '',
      emergency_phone_2: '',
      family_kinship: 'Mãe',
      parents_profession: '',
      family_income: '1 a 2 salários mínimos',
      workplace: '',
      project_expectations: '',
      safety_word: '',
      image_voice_authorization: true,
      pick_drop_responsibility: true,
    })
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex flex-col font-sans">
      <header className="bg-[#0f2027] text-white py-4 px-6 flex items-center justify-between shadow-md">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="MCS" className="h-10 bg-white p-1 rounded-lg" />
          <div>
            <span className="font-serif text-xl font-bold block leading-tight text-white">Instituto MCS</span>
            <span className="text-[10px] text-dourado uppercase tracking-widest">Inscrição & Pré-Cadastro</span>
          </div>
        </Link>
        <Link to="/projetos" className="text-xs font-bold border border-dourado text-dourado px-4 py-2 rounded-full hover:bg-dourado hover:text-carbono transition-colors">
          ← Voltar aos Projetos
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="bg-white max-w-3xl w-full rounded-3xl shadow-2xl overflow-hidden border border-gray-100 my-auto">
          
          {/* Top Banner Header */}
          <div className="bg-carbono text-white p-6 md:p-8 text-center relative overflow-hidden">
            <h1 className="font-serif text-2xl md:text-3xl font-bold mb-2">Formulário Oficial de Inscrição do Aluno</h1>
            <p className="text-gray-300 text-xs md:text-sm max-w-xl mx-auto">
              Preencha os dados completos do estudante, saúde e responsável para garantir a vaga nos projetos educacionais do Instituto MCS.
            </p>
          </div>

          {/* Progress Indicator */}
          {status !== 'success' && (
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center max-w-lg mx-auto text-xs font-bold">
                <button 
                  onClick={() => setStep(1)} 
                  className={`flex items-center gap-1.5 ${step === 1 ? 'text-dourado font-bold scale-105' : 'text-gray-400'}`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 1 ? 'bg-dourado text-carbono' : 'bg-gray-200 text-gray-600'}`}>1</span>
                  <span className="hidden sm:inline">Aluno</span>
                </button>
                <span className="text-gray-300">──</span>
                <button 
                  onClick={() => setStep(2)} 
                  className={`flex items-center gap-1.5 ${step === 2 ? 'text-dourado font-bold scale-105' : 'text-gray-400'}`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 2 ? 'bg-dourado text-carbono' : 'bg-gray-200 text-gray-600'}`}>2</span>
                  <span className="hidden sm:inline">Saúde</span>
                </button>
                <span className="text-gray-300">──</span>
                <button 
                  onClick={() => setStep(3)} 
                  className={`flex items-center gap-1.5 ${step === 3 ? 'text-dourado font-bold scale-105' : 'text-gray-400'}`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 3 ? 'bg-dourado text-carbono' : 'bg-gray-200 text-gray-600'}`}>3</span>
                  <span className="hidden sm:inline">Responsável</span>
                </button>
                <span className="text-gray-300">──</span>
                <button 
                  onClick={() => setStep(4)} 
                  className={`flex items-center gap-1.5 ${step === 4 ? 'text-dourado font-bold scale-105' : 'text-gray-400'}`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 4 ? 'bg-dourado text-carbono' : 'bg-gray-200 text-gray-600'}`}>4</span>
                  <span className="hidden sm:inline">Termos</span>
                </button>
              </div>
            </div>
          )}

          <div className="p-6 md:p-8">
            {status === 'success' ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner">
                  ✓
                </div>
                <h2 className="font-serif text-3xl font-bold text-carbono">Inscrição Efetuada com Sucesso!</h2>
                <p className="text-gray-600 max-w-md mx-auto text-sm leading-relaxed">
                  Recebemos todas as informações do estudante e da ficha de saúde. Nossa equipe analisará os dados e entrará em contato pelo WhatsApp informado.
                </p>
                <div className="pt-6">
                  <button 
                    onClick={resetForm} 
                    className="bg-carbono text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors shadow-md text-sm"
                  >
                    Fazer Novo Cadastro
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {status === 'error' && (
                  <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl text-sm text-center font-medium">
                    {errorMessage || 'Ocorreu um erro ao enviar seu cadastro. Tente novamente.'}
                  </div>
                )}

                {/* ── SEÇÃO 1: DADOS DO ALUNO ────────────────────────────── */}
                {step === 1 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="border-b border-gray-100 pb-3 mb-4 flex items-center justify-between">
                      <h3 className="font-serif text-xl font-bold text-carbono flex items-center gap-2">
                        <span>🎓</span> Dados Pessoais e Escolares do Aluno
                      </h3>
                      <span className="text-xs text-gray-400 font-bold uppercase">Passo 1 de 4</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Projeto de Interesse</label>
                      <select 
                        value={form.project_id} 
                        onChange={e => setForm({...form, project_id: e.target.value})} 
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-sm focus:border-dourado outline-none"
                      >
                        <option value="">Geral / Sem projeto específico definido</option>
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>{p.title} ({p.location})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nome Completo do Aluno *</label>
                      <input 
                        required 
                        value={form.student_name} 
                        onChange={e => setForm({...form, student_name: e.target.value})} 
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-sm focus:border-dourado outline-none" 
                        placeholder="Nome completo da criança/estudante" 
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Data de Nascimento *</label>
                        <input 
                          required 
                          type="date" 
                          value={form.birth_date} 
                          onChange={e => setForm({...form, birth_date: e.target.value})} 
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-sm focus:border-dourado outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Sexo *</label>
                        <select 
                          value={form.gender} 
                          onChange={e => setForm({...form, gender: e.target.value})} 
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-sm focus:border-dourado outline-none"
                        >
                          <option value="Feminino">Feminino</option>
                          <option value="Masculino">Masculino</option>
                          <option value="Outro">Outro / Prefiro não declarar</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">E-mail do Aluno (Opcional)</label>
                        <input 
                          type="email" 
                          value={form.student_email} 
                          onChange={e => setForm({...form, student_email: e.target.value})} 
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-sm focus:border-dourado outline-none" 
                          placeholder="aluno@email.com" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">CPF do Aluno</label>
                        <input 
                          value={form.student_cpf} 
                          onChange={e => setForm({...form, student_cpf: e.target.value})} 
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-sm focus:border-dourado outline-none" 
                          placeholder="000.000.000-00" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">RG do Aluno</label>
                        <input 
                          value={form.student_rg} 
                          onChange={e => setForm({...form, student_rg: e.target.value})} 
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-sm focus:border-dourado outline-none" 
                          placeholder="Nº do Documento" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">RNM (Registro Migratório)</label>
                        <input 
                          value={form.rnm} 
                          onChange={e => setForm({...form, rnm: e.target.value})} 
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-sm focus:border-dourado outline-none" 
                          placeholder="Caso seja migrante/estrangeiro" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Endereço Residencial Completo *</label>
                      <input 
                        required 
                        value={form.address} 
                        onChange={e => setForm({...form, address: e.target.value})} 
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-sm focus:border-dourado outline-none" 
                        placeholder="Rua, número, bairro, cidade..." 
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      <div className="col-span-1 md:col-span-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Escola onde Estuda *</label>
                        <input 
                          required 
                          value={form.school_name} 
                          onChange={e => setForm({...form, school_name: e.target.value})} 
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-sm focus:border-dourado outline-none" 
                          placeholder="Nome da escola" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Turno *</label>
                        <select 
                          value={form.school_shift} 
                          onChange={e => setForm({...form, school_shift: e.target.value})} 
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-sm focus:border-dourado outline-none"
                        >
                          <option value="Matutino">Matutino (Manhã)</option>
                          <option value="Vespertino">Vespertino (Tarde)</option>
                          <option value="Noturno">Noturno (Noite)</option>
                          <option value="Integral">Integral</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Turma / Ano Escolar *</label>
                        <input 
                          required 
                          value={form.school_grade} 
                          onChange={e => setForm({...form, school_grade: e.target.value})} 
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-sm focus:border-dourado outline-none" 
                          placeholder="Ex: 6º Ano B" 
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <button 
                        type="button" 
                        onClick={() => {
                          if (!form.student_name || !form.birth_date || !form.school_name) {
                            alert('Por favor, preencha o nome do aluno, data de nascimento e escola antes de continuar.')
                            return
                          }
                          setStep(2)
                        }} 
                        className="w-full bg-dourado text-carbono font-bold py-3.5 rounded-xl hover:bg-yellow-500 transition-colors shadow-md text-sm"
                      >
                        Próximo: Informações de Saúde →
                      </button>
                    </div>
                  </div>
                )}

                {/* ── SEÇÃO 2: INFORMAÇÕES DE SAÚDE ──────────────────────── */}
                {step === 2 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="border-b border-gray-100 pb-3 mb-4 flex items-center justify-between">
                      <h3 className="font-serif text-xl font-bold text-carbono flex items-center gap-2">
                        <span>🏥</span> Ficha e Informações de Saúde do Aluno
                      </h3>
                      <span className="text-xs text-gray-400 font-bold uppercase">Passo 2 de 4</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tipo Sanguíneo</label>
                        <select 
                          value={form.blood_type} 
                          onChange={e => setForm({...form, blood_type: e.target.value})} 
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-sm focus:border-dourado outline-none"
                        >
                          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Não sei'].map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Peso (kg)</label>
                        <input 
                          value={form.weight} 
                          onChange={e => setForm({...form, weight: e.target.value})} 
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-sm focus:border-dourado outline-none" 
                          placeholder="Ex: 35 kg" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Altura (cm)</label>
                        <input 
                          value={form.height} 
                          onChange={e => setForm({...form, height: e.target.value})} 
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-sm focus:border-dourado outline-none" 
                          placeholder="Ex: 142 cm" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Alergias (Alimentos, Medicamentos, Outros)</label>
                      <input 
                        value={form.health_allergies} 
                        onChange={e => setForm({...form, health_allergies: e.target.value})} 
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-sm focus:border-dourado outline-none" 
                        placeholder="Descreva se o aluno possui alergias (Ex: Dipirona, Amendoim, Lactose, Poeira, Nenhuma)" 
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Uso de Medicamento Contínuo ou Prescrito</label>
                      <textarea 
                        rows={2} 
                        value={form.medications} 
                        onChange={e => setForm({...form, medications: e.target.value})} 
                        className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 text-sm focus:border-dourado outline-none resize-none" 
                        placeholder="Informe se faz uso diário de medicamentos, dosagens e horários..." 
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Patologia / Diagnóstico / Suspeita Médica</label>
                      <textarea 
                        rows={3} 
                        value={form.health_conditions} 
                        onChange={e => setForm({...form, health_conditions: e.target.value})} 
                        className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 text-sm focus:border-dourado outline-none resize-none" 
                        placeholder="Descreva se há diagnóstico formal ou suspeita de condições (Ex: Asma, Bronquite, TDAH, TEA, Restrição Física...)" 
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        type="button" 
                        onClick={() => setStep(1)} 
                        className="w-1/3 py-3.5 rounded-xl font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm"
                      >
                        ← Voltar
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setStep(3)} 
                        className="w-2/3 bg-dourado text-carbono font-bold py-3.5 rounded-xl hover:bg-yellow-500 transition-colors shadow-md text-sm"
                      >
                        Próximo: Dados do Responsável →
                      </button>
                    </div>
                  </div>
                )}

                {/* ── SEÇÃO 3: DADOS DO RESPONSÁVEL ─────────────────────── */}
                {step === 3 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="border-b border-gray-100 pb-3 mb-4 flex items-center justify-between">
                      <h3 className="font-serif text-xl font-bold text-carbono flex items-center gap-2">
                        <span>👨‍👩‍👧</span> Informações do Responsável Legal
                      </h3>
                      <span className="text-xs text-gray-400 font-bold uppercase">Passo 3 de 4</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nome Completo do Responsável *</label>
                        <input 
                          required 
                          value={form.name} 
                          onChange={e => setForm({...form, name: e.target.value})} 
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-sm focus:border-dourado outline-none" 
                          placeholder="Ex: Maria da Silva" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Vínculo Familiar *</label>
                        <select 
                          value={form.family_kinship} 
                          onChange={e => setForm({...form, family_kinship: e.target.value})} 
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-sm focus:border-dourado outline-none"
                        >
                          {['Mãe', 'Pai', 'Avó/Avô', 'Tio/Tia', 'Irmão/Irmã', 'Tutor Legal', 'Outro'].map(v => (
                            <option key={v} value={v}>{v}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">CPF do Responsável</label>
                        <input 
                          value={form.parent_cpf} 
                          onChange={e => setForm({...form, parent_cpf: e.target.value})} 
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-sm focus:border-dourado outline-none" 
                          placeholder="000.000.000-00" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">RG do Responsável</label>
                        <input 
                          value={form.parent_rg} 
                          onChange={e => setForm({...form, parent_rg: e.target.value})} 
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-sm focus:border-dourado outline-none" 
                          placeholder="Nº do Documento" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Telefone Principal (WhatsApp) *</label>
                        <input 
                          required 
                          value={form.phone} 
                          onChange={e => setForm({...form, phone: e.target.value})} 
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-sm focus:border-dourado outline-none" 
                          placeholder="(00) 00000-0000" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">1º Contato de Emergência *</label>
                        <input 
                          required 
                          value={form.emergency_phone} 
                          onChange={e => setForm({...form, emergency_phone: e.target.value})} 
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-sm focus:border-dourado outline-none" 
                          placeholder="(00) 00000-0000 (Parente/Vizinho)" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">2º Contato de Emergência</label>
                        <input 
                          value={form.emergency_phone_2} 
                          onChange={e => setForm({...form, emergency_phone_2: e.target.value})} 
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-sm focus:border-dourado outline-none" 
                          placeholder="(00) 00000-0000 (Outro Parente)" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">E-mail do Responsável</label>
                        <input 
                          type="email" 
                          value={form.parent_email} 
                          onChange={e => setForm({...form, parent_email: e.target.value})} 
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-sm focus:border-dourado outline-none" 
                          placeholder="seu@email.com" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Profissão</label>
                        <input 
                          value={form.parents_profession} 
                          onChange={e => setForm({...form, parents_profession: e.target.value})} 
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-sm focus:border-dourado outline-none" 
                          placeholder="Ocupação / Cargo" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Local de Trabalho</label>
                        <input 
                          value={form.workplace} 
                          onChange={e => setForm({...form, workplace: e.target.value})} 
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-sm focus:border-dourado outline-none" 
                          placeholder="Empresa / Cidade" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Faixa Salarial (Renda Familiar)</label>
                        <select 
                          value={form.family_income} 
                          onChange={e => setForm({...form, family_income: e.target.value})} 
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-sm focus:border-dourado outline-none"
                        >
                          <option value="Até 1 salário mínimo">Até 1 salário mínimo</option>
                          <option value="1 a 2 salários mínimos">1 a 2 salários mínimos</option>
                          <option value="2 a 4 salários mínimos">2 a 4 salários mínimos</option>
                          <option value="Acima de 4 salários mínimos">Acima de 4 salários mínimos</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Palavra Segura (Para Retirada do Menor) *</label>
                        <input 
                          required 
                          value={form.safety_word} 
                          onChange={e => setForm({...form, safety_word: e.target.value})} 
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-sm focus:border-dourado outline-none" 
                          placeholder="Ex: Código ou palavra secreta familiar" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Qual sua expectativa com esse projeto?</label>
                      <textarea 
                        rows={2} 
                        value={form.project_expectations} 
                        onChange={e => setForm({...form, project_expectations: e.target.value})} 
                        className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 text-sm focus:border-dourado outline-none resize-none" 
                        placeholder="O que você espera que seu filho desenvolva nos projetos do Instituto MCS?" 
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        type="button" 
                        onClick={() => setStep(2)} 
                        className="w-1/3 py-3.5 rounded-xl font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm"
                      >
                        ← Voltar
                      </button>
                      <button 
                        type="button" 
                        onClick={() => {
                          if (!form.name || !form.phone || !form.emergency_phone || !form.safety_word) {
                            alert('Por favor, preencha o nome do responsável, telefone, contato de emergência e palavra segura antes de continuar.')
                            return
                          }
                          setStep(4)
                        }} 
                        className="w-2/3 bg-dourado text-carbono font-bold py-3.5 rounded-xl hover:bg-yellow-500 transition-colors shadow-md text-sm"
                      >
                        Próximo: Termos e Autorizações →
                      </button>
                    </div>
                  </div>
                )}

                {/* ── SEÇÃO 4: AUTORIZAÇÕES LEGAIS ───────────────────────── */}
                {step === 4 && (
                  <div className="space-y-5 animate-fade-in">
                    <div className="border-b border-gray-100 pb-3 mb-4 flex items-center justify-between">
                      <h3 className="font-serif text-xl font-bold text-carbono flex items-center gap-2">
                        <span>✍️</span> Autorizações Legais e Finalização
                      </h3>
                      <span className="text-xs text-gray-400 font-bold uppercase">Passo 4 de 4</span>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex items-start gap-3">
                        <input 
                          type="checkbox" 
                          id="imgAuth" 
                          checked={form.image_voice_authorization} 
                          onChange={e => setForm({...form, image_voice_authorization: e.target.checked})} 
                          className="mt-1 w-5 h-5 text-dourado rounded focus:ring-dourado cursor-pointer accent-dourado" 
                        />
                        <label htmlFor="imgAuth" className="text-xs md:text-sm text-gray-700 leading-relaxed cursor-pointer">
                          <strong>Autorização de Imagem e Voz:</strong> Autorizo o uso gratuito e por tempo indeterminado da imagem e voz do estudante em fotos, vídeos e publicações institucionais das redes sociais e relatórios do Instituto MCS.
                        </label>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex items-start gap-3">
                        <input 
                          type="checkbox" 
                          id="pickAuth" 
                          checked={form.pick_drop_responsibility} 
                          onChange={e => setForm({...form, pick_drop_responsibility: e.target.checked})} 
                          className="mt-1 w-5 h-5 text-dourado rounded focus:ring-dourado cursor-pointer accent-dourado" 
                        />
                        <label htmlFor="pickAuth" className="text-xs md:text-sm text-gray-700 leading-relaxed cursor-pointer">
                          <strong>Ciência sobre Transporte e Responsabilidade:</strong> Declaro ciência de que é de inteira responsabilidade dos pais/tutores legais o transporte de ida e volta do menor até as dependências do projeto.
                        </label>
                      </div>
                    </div>

                    {/* Resumo Consolidado */}
                    <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-1">
                      <p className="font-bold text-sm">Resumo da Inscrição:</p>
                      <p>• <strong>Aluno:</strong> {form.student_name} ({form.school_name} - Turno {form.school_shift})</p>
                      <p>• <strong>Responsável:</strong> {form.name} ({form.family_kinship}) - Tel: {form.phone}</p>
                      <p>• <strong>Emergência / Palavra Segura:</strong> {form.emergency_phone} | Segura: *****</p>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        type="button" 
                        onClick={() => setStep(3)} 
                        disabled={status === 'submitting'}
                        className="w-1/3 py-3.5 rounded-xl font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
                      >
                        ← Voltar
                      </button>
                      <button 
                        type="submit" 
                        disabled={status === 'submitting'} 
                        className="w-2/3 bg-dourado text-carbono font-bold py-3.5 rounded-xl hover:bg-yellow-500 transition-colors shadow-md text-base disabled:opacity-70 flex items-center justify-center gap-2"
                      >
                        {status === 'submitting' ? 'Enviando...' : '✓ Confirmar e Concluir Inscrição'}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
