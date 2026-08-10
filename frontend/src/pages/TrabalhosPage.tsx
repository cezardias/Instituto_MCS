import React, { useState, useEffect, useCallback } from 'react';

interface Assignment {
  id: number;
  tenant_id: string;
  student_id?: number;
  student_name: string;
  student_email?: string;
  parent_email?: string;
  turma: string;
  title: string;
  description?: string;
  file_url: string;
  file_name?: string;
  file_type?: string;
  status: string;
  feedback?: string;
  grade?: string;
  created_at: string;
}

export default function TrabalhosPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  // Filtros
  const [filterTurma, setFilterTurma] = useState('todos');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Formulário de Upload
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    student_name: '',
    student_email: '',
    parent_email: '',
    turma: 'Contraturno Conexão Rima',
    title: '',
    description: ''
  });

  // Formulário de Avaliação (Professor / Diretoria)
  const [evaluating, setEvaluating] = useState(false);
  const [evalData, setEvalData] = useState({
    status: 'aprovado',
    grade: '',
    feedback: ''
  });

  const loadAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/assignments?tenant_id=mcs');
      if (res.ok) {
        const data = await res.json();
        setAssignments(data);
      }
    } catch (err) {
      console.error('Erro ao carregar trabalhos:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setFormError('Por favor, selecione um arquivo (.pdf, .doc, .docx, .jpg, .png)');
      return;
    }
    if (!formData.student_name || !formData.title) {
      setFormError('Nome do aluno e Título do trabalho são obrigatórios.');
      return;
    }

    setUploading(true);
    setFormError('');
    setFormSuccess('');

    try {
      // 1. Upload do arquivo
      const uploadFd = new FormData();
      uploadFd.append('image', file);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFd
      });

      if (!uploadRes.ok) throw new Error('Falha no upload do arquivo.');
      const uploadData = await uploadRes.json();
      const fileUrl = uploadData.url;

      // 2. Gravar o trabalho no banco
      const assignRes = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          file_url: fileUrl,
          file_name: file.name,
          file_type: file.name.split('.').pop()?.toLowerCase() || ''
        })
      });

      if (!assignRes.ok) throw new Error('Erro ao salvar o trabalho.');

      setFormSuccess('Trabalho enviado com sucesso! O professor e a diretoria foram notificados.');
      setFile(null);
      setFormData({
        student_name: '',
        student_email: '',
        parent_email: '',
        turma: 'Contraturno Conexão Rima',
        title: '',
        description: ''
      });
      setTimeout(() => {
        setShowUploadModal(false);
        setFormSuccess('');
      }, 1500);
      loadAssignments();
    } catch (err: any) {
      setFormError(err.message || 'Erro ao enviar o trabalho. Tente novamente.');
    }
    setUploading(false);
  };

  const handleEvaluateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    setEvaluating(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await fetch(`/api/assignments/${selectedAssignment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(evalData)
      });

      if (res.ok) {
        setSelectedAssignment(null);
        loadAssignments();
      } else {
        alert('Erro ao atualizar avaliação. Verifique se está autenticado no painel.');
      }
    } catch (err) {
      console.error(err);
    }
    setEvaluating(false);
  };

  // Filtragem dos Trabalhos
  const filteredAssignments = assignments.filter(item => {
    const matchesSearch =
      item.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.parent_email && item.parent_email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTurma = filterTurma === 'todos' || item.turma.toLowerCase().includes(filterTurma.toLowerCase());
    const matchesStatus = filterStatus === 'todos' || item.status === filterStatus;

    return matchesSearch && matchesTurma && matchesStatus;
  });

  const getFileBadgeColor = (type?: string) => {
    switch (type) {
      case 'pdf': return 'bg-red-100 text-red-700 border-red-200';
      case 'doc':
      case 'docx': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'png':
      case 'jpg':
      case 'jpeg': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-purple-100 text-purple-700 border-purple-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aprovado':
        return <span className="bg-green-100 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">🟢 APROVADO</span>;
      case 'necessita_revisao':
        return <span className="bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">🟡 REVISÃO SOLICITADA</span>;
      case 'em_analise':
        return <span className="bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">🔵 EM ANÁLISE</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">⚪ ENVIADO</span>;
    }
  };

  return (
    <div className="bg-marfim min-h-screen pt-24 pb-20 font-sans">
      {/* Banner Principal */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 mb-10">
        <div className="relative rounded-[2.5rem] overflow-hidden bg-carbono text-marfim p-8 lg:p-14 shadow-xl border border-carbono/20 flex flex-col md:flex-row items-center justify-between">
          <div className="relative z-10 md:w-2/3">
            <span className="text-dourado font-bold tracking-widest text-xs uppercase mb-3 block">
              Portal do Estudante e do Responsável —
            </span>
            <h1 className="font-serif text-3xl lg:text-5xl leading-tight mb-4">
              Envio e Gestão de Trabalhos Escolares
            </h1>
            <p className="text-gray-300 text-sm leading-relaxed max-w-2xl">
              Alunos podem enviar suas pesquisas, trabalhos manuais e atividades em formato PDF, Word ou imagem. Responsáveis, oficineiros e a diretoria acompanham cada entrega com transparência.
            </p>
          </div>
          <div className="mt-6 md:mt-0 relative z-10 shrink-0">
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-dourado text-carbono font-bold px-8 py-4 rounded-full hover:bg-yellow-500 transition-all transform hover:-translate-y-1 shadow-lg text-sm uppercase tracking-wider flex items-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Enviar Trabalho do Aluno
            </button>
          </div>
        </div>
      </div>

      {/* Painel de Filtros e Busca */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 mb-8">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
          
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Turma / Projeto</label>
              <select
                value={filterTurma}
                onChange={e => setFilterTurma(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-carbono text-xs font-bold px-4 py-2.5 rounded-xl outline-none focus:border-dourado"
              >
                <option value="todos">Todas as Turmas</option>
                <option value="Conexão Rima">Contraturno Conexão Rima</option>
                <option value="Movimento">MCS em Movimento</option>
                <option value="Digital">MCS Digital</option>
                <option value="Família">MCS Família</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Status da Avaliação</label>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-carbono text-xs font-bold px-4 py-2.5 rounded-xl outline-none focus:border-dourado"
              >
                <option value="todos">Todos os Status</option>
                <option value="enviado">⚪ Enviado</option>
                <option value="em_analise">🔵 Em Análise</option>
                <option value="aprovado">🟢 Aprovado</option>
                <option value="necessita_revisao">🟡 Necessita Revisão</option>
              </select>
            </div>
          </div>

          <div className="w-full lg:w-80">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Pesquisar por Aluno ou Título</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Nome do aluno, e-mail ou título..."
                className="w-full bg-gray-50 border border-gray-200 text-carbono text-xs font-medium pl-10 pr-4 py-2.5 rounded-xl outline-none focus:border-dourado"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Trabalhos Enviados */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Carregando trabalhos e atividades...</div>
        ) : filteredAssignments.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
            <span className="text-4xl mb-3 block">📚</span>
            <h3 className="font-serif text-2xl text-carbono mb-2">Nenhum trabalho encontrado</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
              Nenhuma atividade postada atende aos filtros selecionados. Clique no botão abaixo para realizar um novo envio.
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-carbono text-marfim px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-gray-800"
            >
              + Enviar Novo Trabalho
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssignments.map(item => (
              <div key={item.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getFileBadgeColor(item.file_type)}`}>
                      📄 {item.file_type ? item.file_type.toUpperCase() : 'ARQUIVO'}
                    </span>
                    {getStatusBadge(item.status)}
                  </div>

                  <h3 className="font-serif text-xl font-bold text-carbono mb-2 leading-snug">
                    {item.title}
                  </h3>

                  <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 text-xs mb-4 space-y-1">
                    <p className="text-carbono font-bold">👤 Aluno: {item.student_name}</p>
                    <p className="text-gray-500">🏫 Turma: {item.turma}</p>
                    {item.parent_email && <p className="text-gray-400 text-[11px]">✉️ Resp: {item.parent_email}</p>}
                    <p className="text-gray-400 text-[11px]">📅 Entregue em: {new Date(item.created_at).toLocaleDateString('pt-BR')} às {new Date(item.created_at).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</p>
                  </div>

                  {item.description && (
                    <p className="text-gray-600 text-xs mb-4 line-clamp-3 italic">
                      "{item.description}"
                    </p>
                  )}

                  {/* Feedback do Professor / Diretoria */}
                  {(item.feedback || item.grade) && (
                    <div className="bg-amber-50/60 border border-amber-100 p-3.5 rounded-2xl mb-4 text-xs">
                      <span className="font-bold text-amber-900 block mb-1 flex items-center justify-between">
                        <span>💬 Parecer do Professor:</span>
                        {item.grade && <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-black">Nota: {item.grade}</span>}
                      </span>
                      <p className="text-amber-800 text-[11px] leading-relaxed">{item.feedback || 'Atividade avaliada.'}</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                  <a
                    href={item.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-carbono text-marfim text-center py-2.5 rounded-full text-xs font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>📥</span> Baixar / Visualizar
                  </a>

                  <button
                    onClick={() => {
                      setSelectedAssignment(item);
                      setEvalData({
                        status: item.status || 'aprovado',
                        grade: item.grade || '',
                        feedback: item.feedback || ''
                      });
                    }}
                    className="border border-dourado text-carbono font-bold px-3 py-2.5 rounded-full text-[11px] hover:bg-dourado/20 transition-colors"
                    title="Avaliar Trabalho (Professores e Diretoria)"
                  >
                    ⭐ Avaliar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL DE UPLOAD DE ARQUIVO */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 md:p-8 relative">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>

            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-dourado block mb-1">
                Envio de Atividade Escolar
              </span>
              <h3 className="font-serif text-2xl text-carbono">Anexar Trabalho do Estudante</h3>
              <p className="text-xs text-gray-400 mt-1">
                Formatos suportados: PDF, Word (.doc, .docx) ou Imagem (.jpg, .png).
              </p>
            </div>

            {formError && <div className="mb-4 bg-red-50 text-red-600 text-xs p-4 rounded-2xl border border-red-100 font-bold">{formError}</div>}
            {formSuccess && <div className="mb-4 bg-green-50 text-green-700 text-xs p-4 rounded-2xl border border-green-100 font-bold">{formSuccess}</div>}

            <form onSubmit={handleFileUpload} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-carbono font-bold mb-1">Nome Completo do Aluno *</label>
                  <input
                    required
                    value={formData.student_name}
                    onChange={e => setFormData({ ...formData, student_name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-dourado"
                    placeholder="Nome do estudante"
                  />
                </div>

                <div>
                  <label className="block text-carbono font-bold mb-1">Turma / Projeto *</label>
                  <select
                    value={formData.turma}
                    onChange={e => setFormData({ ...formData, turma: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-dourado font-bold"
                  >
                    <option>Contraturno Conexão Rima</option>
                    <option>MCS em Movimento</option>
                    <option>MCS Digital</option>
                    <option>MCS Família</option>
                    <option>Outra Turma / Oficina</option>
                  </select>
                </div>

                <div>
                  <label className="block text-carbono font-bold mb-1">E-mail do Responsável (Opcional)</label>
                  <input
                    type="email"
                    value={formData.parent_email}
                    onChange={e => setFormData({ ...formData, parent_email: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-dourado"
                    placeholder="Para vincular no painel do responsável"
                  />
                </div>

                <div>
                  <label className="block text-carbono font-bold mb-1">E-mail do Aluno (Opcional)</label>
                  <input
                    type="email"
                    value={formData.student_email}
                    onChange={e => setFormData({ ...formData, student_email: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-dourado"
                    placeholder="E-mail do aluno se tiver"
                  />
                </div>
              </div>

              <div>
                <label className="block text-carbono font-bold mb-1">Título da Atividade / Pesquisa *</label>
                <input
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-dourado"
                  placeholder="Ex: Trabalho de Redação sobre Meio Ambiente"
                />
              </div>

              <div>
                <label className="block text-carbono font-bold mb-1">Descrição / Comentários do Aluno</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-dourado resize-none"
                  placeholder="Explique brevemente o que foi feito ou anote observações para o professor..."
                />
              </div>

              {/* UPLOAD FILE DROPZONE */}
              <div>
                <label className="block text-carbono font-bold mb-1">Arquivo do Trabalho (.pdf, .doc, .docx, .jpg, .png) *</label>
                <div className="border-2 border-dashed border-gray-300 hover:border-dourado rounded-2xl p-6 text-center bg-gray-50 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    required
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={e => setFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <span className="text-3xl mb-2 block">📎</span>
                  {file ? (
                    <p className="font-bold text-carbono">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
                  ) : (
                    <div>
                      <p className="font-bold text-carbono">Clique ou arraste o arquivo aqui</p>
                      <p className="text-[11px] text-gray-400 mt-1">Formatos aceitos: PDF, Word ou Foto da Atividade</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-full font-bold hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-carbono text-marfim py-3 rounded-full font-bold hover:bg-gray-800 disabled:opacity-60"
                >
                  {uploading ? 'Enviando Arquivo...' : 'Confirmar Envio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE AVALIAÇÃO DO PROFESSOR / DIRETORIA */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 md:p-8 relative">
            <button
              onClick={() => setSelectedAssignment(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>

            <div className="mb-6 border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-dourado block mb-1">
                Avaliação Pedagógica
              </span>
              <h3 className="font-serif text-2xl text-carbono">{selectedAssignment.title}</h3>
              <p className="text-xs text-gray-400">Aluno: {selectedAssignment.student_name} | Turma: {selectedAssignment.turma}</p>
            </div>

            <form onSubmit={handleEvaluateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-carbono font-bold mb-1">Status da Atividade</label>
                <select
                  value={evalData.status}
                  onChange={e => setEvalData({ ...evalData, status: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none font-bold"
                >
                  <option value="aprovado">🟢 Aprovado</option>
                  <option value="em_analise">🔵 Em Análise</option>
                  <option value="necessita_revisao">🟡 Necessita Revisão / Refazer</option>
                  <option value="enviado">⚪ Enviado (Sem Avaliação)</option>
                </select>
              </div>

              <div>
                <label className="block text-carbono font-bold mb-1">Nota / Conceito (Opcional)</label>
                <input
                  value={evalData.grade}
                  onChange={e => setEvalData({ ...evalData, grade: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none"
                  placeholder="Ex: 10.0, A+, Excelente, 8.5"
                />
              </div>

              <div>
                <label className="block text-carbono font-bold mb-1">Parecer Pedagógico / Feedback para o Aluno e Responsável</label>
                <textarea
                  rows={4}
                  value={evalData.feedback}
                  onChange={e => setEvalData({ ...evalData, feedback: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none resize-none"
                  placeholder="Escreva comentários sobre o desempenho, elogios ou orientações para melhoria..."
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedAssignment(null)}
                  className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-full font-bold hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={evaluating}
                  className="flex-1 bg-dourado text-carbono py-3 rounded-full font-bold hover:bg-yellow-500 disabled:opacity-60"
                >
                  {evaluating ? 'Salvando...' : 'Salvar Avaliação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
