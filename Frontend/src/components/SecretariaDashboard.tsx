import React, { useState, useEffect } from 'react';
import { 
  Building2, ArrowLeft, Search, Filter, CheckCircle2, 
  AlertTriangle, Clock, Download, Eye, X, RefreshCw, UserCheck
} from 'lucide-react';
import { maskCPF, maskPhone, maskCEP } from '../utils/formatters';

interface AlunoRecord {
  id: number;
  ra?: string;
  curso: string;
  turno: string;
  nomeCompleto: string;
  nomeSocial?: string;
  rgNumero: string;
  cpf: string;
  dataNascimento: string;
  naturalidade: string; // <-- Adicione esta linha
  nacionalidade?: string;
  cnhNumero?: string;
  cnhTipo?: string;
  sexo: string;
  estadoCivil: string;
  nomeMae: string;
  nomePai?: string;
  escolaridade: string;
  tipoEscolaOrigem: string;
  etnia: string;
  necessidadeEspecial: string;
  situacaoOcupacional: string;
  email: string;
  cep: string;
  enderecoLogradouro: string;
  bairro: string;
  municipio: string;
  uf: string;
  telefoneCelular: string;
  statusCadastro: 'PENDENTE' | 'APROVADO' | 'EM_REVISAO';
  observacoesSecretaria?: string;
  createdAt: string;
}

interface SecretariaDashboardProps {
  onBack: () => void;
}

export const SecretariaDashboard: React.FC<SecretariaDashboardProps> = ({ onBack }) => {
  const [alunos, setAlunos] = useState<AlunoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [selectedAluno, setSelectedAluno] = useState<AlunoRecord | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const apiHost = window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname;
  const API_URL = `http://${apiHost}:3000/api/alunos`;

  const fetchAlunos = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        setAlunos(data);
      }
    } catch (err) {
      console.error('Erro ao buscar alunos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlunos();
  }, []);

  const handleUpdateStatus = async (id: number, newStatus: 'APROVADO' | 'EM_REVISAO') => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAlunos(prev => prev.map(a => a.id === id ? { ...a, statusCadastro: updated.statusCadastro } : a));
        if (selectedAluno && selectedAluno.id === id) {
          setSelectedAluno(prev => prev ? { ...prev, statusCadastro: updated.statusCadastro } : null);
        }
      }
    } catch (err) {
      alert('Falha ao atualizar status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (alunos.length === 0) return;

    const headers = [
      'ID', 'Status', 'Curso', 'Turno', 'Nome Completo', 'CPF', 'RG', 
      'Data Nasc.', 'Sexo', 'Nome Mãe', 'Nome Pai', 'Escolaridade', 
      'E-mail', 'Telefone Celular', 'CEP', 'Endereço', 'Bairro', 'Município', 'UF'
    ];

    const rows = filteredAlunos.map(a => [
      a.id,
      a.statusCadastro,
      `"${a.curso}"`,
      a.turno,
      `"${a.nomeCompleto}"`,
      maskCPF(a.cpf),
      a.rgNumero,
      new Date(a.dataNascimento).toLocaleDateString('pt-BR'),
      a.sexo,
      `"${a.nomeMae}"`,
      `"${a.nomePai || ''}"`,
      a.escolaridade,
      a.email,
      maskPhone(a.telefoneCelular),
      maskCEP(a.cep),
      `"${a.enderecoLogradouro}"`,
      `"${a.bairro}"`,
      `"${a.municipio}"`,
      a.uf
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Alunos_SENAI_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAlunos = alunos.filter(aluno => {
    const matchesSearch = 
      aluno.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aluno.cpf.includes(searchTerm.replace(/\D/g, '')) ||
      aluno.curso.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'TODOS' || aluno.statusCadastro === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAlunos = alunos.length;
  const pendentes = alunos.filter(a => a.statusCadastro === 'PENDENTE').length;
  const aprovados = alunos.filter(a => a.statusCadastro === 'APROVADO').length;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Topo do Painel */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-2xl">
            <Building2 size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">Painel da Secretaria Acadêmica</h1>
            <p className="text-xs text-slate-500">Gestão e Validação das Fichas Cadastrais • SENAI Parauapebas</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={fetchAlunos}
            title="Recarregar dados"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Download size={16} /> Exportar Excel (CSV)
          </button>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft size={16} /> Voltar
          </button>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total de Cadastros</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalAlunos}</h3>
          </div>
          <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
            <UserCheck size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Aguardando Validação</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{pendentes}</h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Homologados / Aprovados</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{aprovados}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:flex-1">
          <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por Aluno, CPF ou Curso..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={18} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none"
          >
            <option value="TODOS">Todos os Status</option>
            <option value="PENDENTE">Pendentes</option>
            <option value="APROVADO">Aprovados</option>
            <option value="EM_REVISAO">Em Revisão</option>
          </select>
        </div>
      </div>

      {/* Tabela de Cadastros */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Aluno</th>
                <th className="px-6 py-4">Curso / Turno</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4">Data Envio</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAlunos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                    {loading ? 'Carregando cadastros...' : 'Nenhum registro encontrado.'}
                  </td>
                </tr>
              ) : (
                filteredAlunos.map(aluno => (
                  <tr key={aluno.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{aluno.nomeCompleto}</p>
                      <p className="text-xs text-slate-400 font-mono">CPF: {maskCPF(aluno.cpf)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-700">{aluno.curso}</p>
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {aluno.turno}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-700">{maskPhone(aluno.telefoneCelular)}</p>
                      <p className="text-xs text-slate-400 lowercase">{aluno.email}</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(aluno.createdAt).toLocaleDateString('pt-BR')} às {new Date(aluno.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        aluno.statusCadastro === 'APROVADO'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : aluno.statusCadastro === 'EM_REVISAO'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {aluno.statusCadastro === 'APROVADO' && <CheckCircle2 size={12} />}
                        {aluno.statusCadastro === 'EM_REVISAO' && <AlertTriangle size={12} />}
                        {aluno.statusCadastro === 'PENDENTE' && <Clock size={12} />}
                        {aluno.statusCadastro}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedAluno(aluno)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        <Eye size={14} /> Detalhes
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Ficha Detalhada */}
      {selectedAluno && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Cabeçalho do Modal */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-blue-400">Ficha Cadastral #{selectedAluno.id}</span>
                <h3 className="text-lg font-bold">{selectedAluno.nomeCompleto}</h3>
              </div>
              <button
                onClick={() => setSelectedAluno(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Conteúdo com Scroll */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
              
              {/* Curso & Status */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Curso / Habilitação</p>
                  <p className="font-bold text-sm text-slate-800">{selectedAluno.curso}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Turno</p>
                  <p className="font-bold text-sm text-slate-800">{selectedAluno.turno}</p>
                </div>
              </div>

              {/* Documentos */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2">Documentação Pessoal</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div><strong>CPF:</strong> {maskCPF(selectedAluno.cpf)}</div>
                  <div><strong>RG:</strong> {selectedAluno.rgNumero}</div>
                  <div><strong>Nascimento:</strong> {new Date(selectedAluno.dataNascimento).toLocaleDateString('pt-BR')}</div>
                  <div><strong>Sexo:</strong> {selectedAluno.sexo}</div>
                  <div><strong>Estado Civil:</strong> {selectedAluno.estadoCivil}</div>
                  <div><strong>Naturalidade:</strong> {selectedAluno.naturalidade}</div>
                </div>
              </div>

              {/* Filiação e Perfil */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2">Filiação & Perfil Social</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div><strong>Mãe:</strong> {selectedAluno.nomeMae}</div>
                  <div><strong>Pai:</strong> {selectedAluno.nomePai || 'Não declarado'}</div>
                  <div><strong>Escolaridade:</strong> {selectedAluno.escolaridade}</div>
                  <div><strong>Origem Escolar:</strong> {selectedAluno.tipoEscolaOrigem}</div>
                  <div><strong>Etnia / PCD:</strong> {selectedAluno.etnia} | {selectedAluno.necessidadeEspecial}</div>
                  <div><strong>Ocupação:</strong> {selectedAluno.situacaoOcupacional}</div>
                </div>
              </div>

              {/* Endereço e Contatos */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2">Endereço & Contatos</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div><strong>Celular:</strong> {maskPhone(selectedAluno.telefoneCelular)}</div>
                  <div><strong>E-mail:</strong> {selectedAluno.email}</div>
                  <div className="col-span-2">
                    <strong>Endereço:</strong> {selectedAluno.enderecoLogradouro}, {selectedAluno.bairro} - {selectedAluno.municipio}/{selectedAluno.uf} (CEP: {maskCEP(selectedAluno.cep)})
                  </div>
                </div>
              </div>

            </div>

            {/* Ações de Homologação */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Status atual: <strong>{selectedAluno.statusCadastro}</strong>
              </span>

              <div className="flex gap-2">
                <button
                  disabled={actionLoading || selectedAluno.statusCadastro === 'EM_REVISAO'}
                  onClick={() => handleUpdateStatus(selectedAluno.id, 'EM_REVISAO')}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-bold text-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  Marcar Pendência / Revisão
                </button>
                <button
                  disabled={actionLoading || selectedAluno.statusCadastro === 'APROVADO'}
                  onClick={() => handleUpdateStatus(selectedAluno.id, 'APROVADO')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  Homologar Cadastro
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};