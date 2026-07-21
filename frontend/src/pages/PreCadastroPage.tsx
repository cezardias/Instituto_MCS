import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export default function PreCadastroPage() {
  const [searchParams] = useSearchParams();
  const initialProjectId = searchParams.get('projeto') || '';

  const [projects, setProjects] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', phone: '', email: '', project_id: initialProjectId });
  const [status, setStatus] = useState<'idle'|'submitting'|'success'|'error'>('idle');

  useEffect(() => {
    // Fetch active projects to populate the dropdown
    fetch('/api/projects?tenant_id=mcs')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProjects(data.filter(p => p.status === 'em_execucao' || p.status === 'em_planejamento'));
        }
      })
      .catch(err => console.error('Error fetching projects:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      const res = await fetch('/api/pre-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: 'mcs',
          name: form.name,
          phone: form.phone,
          email: form.email,
          project_id: form.project_id || null
        })
      });
      if (res.ok) {
        setStatus('success');
        setForm({ name: '', phone: '', email: '', project_id: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 py-4 px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="MCS" className="h-10" />
          <span className="font-serif text-xl font-bold text-carbono">Instituto MCS</span>
        </Link>
        <Link to="/projetos" className="text-sm font-bold text-dourado hover:text-yellow-600">Voltar para Projetos</Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white max-w-lg w-full rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-carbono text-white p-8 text-center">
            <h1 className="font-serif text-3xl mb-2">Pré-Cadastro</h1>
            <p className="text-gray-300 text-sm">Demonstre interesse em nossos projetos e nossa equipe entrará em contato.</p>
          </div>
          
          <div className="p-8">
            {status === 'success' ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-carbono mb-2">Cadastro Recebido!</h2>
                <p className="text-gray-600 mb-6">Agradecemos o seu interesse. Nossa equipe entrará em contato em breve com mais informações.</p>
                <button onClick={() => setStatus('idle')} className="text-dourado font-bold hover:underline">Fazer outro cadastro</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {status === 'error' && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
                    Ocorreu um erro ao enviar seu cadastro. Tente novamente.
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nome Completo do Responsável *</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-dourado focus:ring-1 focus:ring-dourado transition-colors" placeholder="Ex: Maria da Silva" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Telefone (WhatsApp) *</label>
                  <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-dourado focus:ring-1 focus:ring-dourado transition-colors" placeholder="(00) 00000-0000" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">E-mail</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-dourado focus:ring-1 focus:ring-dourado transition-colors" placeholder="seu@email.com" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Projeto de Interesse</label>
                  <select value={form.project_id} onChange={e => setForm({...form, project_id: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-dourado focus:ring-1 focus:ring-dourado transition-colors bg-white">
                    <option value="">Selecione um projeto (Opcional)</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
                
                <button type="submit" disabled={status === 'submitting'} className="w-full bg-dourado text-carbono font-bold py-4 rounded-xl hover:bg-yellow-500 transition-colors disabled:opacity-70 text-lg mt-4">
                  {status === 'submitting' ? 'Enviando...' : 'Quero Garantir a Vaga'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
