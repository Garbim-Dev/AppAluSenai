import React, { useState, useEffect } from 'react';
import { 
  User, BookOpen, MapPin, ShieldCheck, ArrowRight, ArrowLeft, 
  CheckCircle, Loader2, AlertCircle, School 
} from 'lucide-react';
import { 
  maskCPF, maskCEP, maskPhone, stripNonDigits, 
  sanitizeText, isValidCPF, fetchAddressByCEP 
} from '../utils/formatters';

interface StudentFormProps {
  onBack: () => void;
}

export const StudentForm: React.FC<StudentFormProps> = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [loadingCEP, setLoadingCEP] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Captura automática de parâmetros passados via QR Code (ex: ?curso=Eletromecanica&turno=NOITE)
  const [formData, setFormData] = useState({
    curso: '',
    turno: 'NOITE',
    nomeCompleto: '',
    nomeSocial: '',
    rgNumero: '',
    rgDataEmissao: '',
    cpf: '',
    dataNascimento: '',
    cnhNumero: '',
    cnhTipo: '',
    naturalidade: 'PARAUAPEBAS',
    nacionalidade: 'BRASILEIRA',
    sexo: 'MASCULINO',
    estadoCivil: 'SOLTEIRO',
    
    // Filiação
    nomeMae: '',
    maeEstadoNatal: 'PA',
    maeNaturalidade: '',
    maeDataNascimento: '',
    nomePai: '',

    // Perfil Educacional e Social
    escolaridade: 'MEDIO_COMPLETO',
    tipoEscolaOrigem: 'PUBLICA_ESTADUAL',
    etnia: 'PARDA',
    necessidadeEspecial: 'NAO_POSSUI',
    situacaoOcupacional: 'EMPREGADO',

    // Contatos e Endereço
    email: '',
    cep: '',
    enderecoLogradouro: '',
    bairro: '',
    municipio: 'PARAUAPEBAS',
    uf: 'PA',
    telefoneCelular: '',
    telefoneResidencial: '',
    telefoneRecados: '',

    termoLgpdAceito: false,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cursoParam = params.get('curso');
    const turnoParam = params.get('turno');
    if (cursoParam) setFormData(p => ({ ...p, curso: cursoParam.toUpperCase() }));
    if (turnoParam) setFormData(p => ({ ...p, turno: turnoParam.toUpperCase() }));
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCEPBlur = async () => {
    const clean = stripNonDigits(formData.cep);
    if (clean.length === 8) {
      setLoadingCEP(true);
      const res = await fetchAddressByCEP(clean);
      setLoadingCEP(false);
      if (res) {
        setFormData(prev => ({
          ...prev,
          enderecoLogradouro: res.logradouro || prev.enderecoLogradouro,
          bairro: res.bairro || prev.bairro,
          municipio: res.municipio || prev.municipio,
          uf: res.uf || prev.uf,
        }));
      }
    }
  };

  const handleNext = () => {
    setErrorMessage('');
    if (step === 1) {
      if (!formData.curso || !formData.nomeCompleto || !formData.cpf || !formData.dataNascimento || !formData.rgNumero) {
        setErrorMessage('Preencha os campos obrigatórios da Identificação.');
        return;
      }
      if (!isValidCPF(formData.cpf)) {
        setErrorMessage('O CPF digitado é inválido. Verifique os números.');
        return;
      }
    }
    if (step === 2) {
      if (!formData.nomeMae) {
        setErrorMessage('O Nome da Mãe é obrigatório.');
        return;
      }
    }
    if (step === 3) {
      if (!formData.email || !formData.telefoneCelular || !formData.cep || !formData.enderecoLogradouro) {
        setErrorMessage('Preencha os contatos e o endereço completo.');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.termoLgpdAceito) {
      setErrorMessage('É obrigatório concordar com o termo de tratamento de dados LGPD.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        ...formData,
        nomeCompleto: sanitizeText(formData.nomeCompleto),
        nomeSocial: formData.nomeSocial ? sanitizeText(formData.nomeSocial) : undefined,
        nomeMae: sanitizeText(formData.nomeMae),
        nomePai: formData.nomePai ? sanitizeText(formData.nomePai) : undefined,
        naturalidade: sanitizeText(formData.naturalidade),
        enderecoLogradouro: sanitizeText(formData.enderecoLogradouro),
        bairro: sanitizeText(formData.bairro),
        municipio: sanitizeText(formData.municipio),
        uf: sanitizeText(formData.uf),
        cpf: stripNonDigits(formData.cpf),
        rgNumero: stripNonDigits(formData.rgNumero),
        cep: stripNonDigits(formData.cep),
        telefoneCelular: stripNonDigits(formData.telefoneCelular),
        telefoneResidencial: formData.telefoneResidencial ? stripNonDigits(formData.telefoneResidencial) : undefined,
        telefoneRecados: formData.telefoneRecados ? stripNonDigits(formData.telefoneRecados) : undefined,
        rgDataEmissao: formData.rgDataEmissao || undefined,
        maeDataNascimento: formData.maeDataNascimento || undefined,
      };

      const apiHost = window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname;
        const res = await fetch(`http://${apiHost}:3000/api/alunos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Falha ao salvar o cadastro.');
      }

      setSubmittedSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao comunicar com o servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedSuccess) {
    return (
      <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-xl p-8 text-center my-6 border border-slate-100">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Cadastro Enviado!</h2>
        <p className="text-slate-600 mt-2 mb-6 text-sm">
          Seus dados foram transmitidos à Secretaria do SENAI Parauapebas. O processo de conferência física agora é digital e automático.
        </p>
        <button
          onClick={onBack}
          className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-blue-700 transition-all cursor-pointer"
        >
          Voltar ao Início
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-6 sm:p-8 my-4 border border-slate-200">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <School size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">Ficha Cadastral do Aluno</h1>
            <p className="text-xs text-slate-500">SENAI • Parauapebas</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
          Etapa {step} de 4
        </span>
      </div>

      {/* Barra de Progresso */}
      <div className="w-full bg-slate-100 h-2 rounded-full mb-6 overflow-hidden">
        <div 
          className="bg-blue-600 h-full transition-all duration-300"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-3 text-sm border border-red-100">
          <AlertCircle size={20} className="shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Formulário por Etapas */}
      <form onSubmit={handleSubmit}>
        {/* ETAPA 1: Identificação Básica */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2 mb-2">
              <BookOpen size={18} className="text-blue-600" /> 1. Curso e Dados Pessoais
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">CURSO *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: TÉCNICO EM ELETROMECÂNICA"
                  className="w-full p-2.5 border border-slate-300 rounded-xl uppercase text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.curso}
                  onChange={e => handleChange('curso', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">TURNO *</label>
                <select
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.turno}
                  onChange={e => handleChange('turno', e.target.value)}
                >
                  <option value="MANHA">Manhã</option>
                  <option value="TARDE">Tarde</option>
                  <option value="NOITE">Noite</option>
                  <option value="INTEGRAL">Integral</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">NOME COMPLETO *</label>
              <input
                type="text"
                required
                className="w-full p-2.5 border border-slate-300 rounded-xl uppercase text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.nomeCompleto}
                onChange={e => handleChange('nomeCompleto', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">NOME SOCIAL (OPCIONAL)</label>
                <input
                  type="text"
                  className="w-full p-2.5 border border-slate-300 rounded-xl uppercase text-sm"
                  value={formData.nomeSocial}
                  onChange={e => handleChange('nomeSocial', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">CPF *</label>
                <input
                  type="text"
                  required
                  placeholder="000.000.000-00"
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  value={formData.cpf}
                  onChange={e => handleChange('cpf', maskCPF(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">RG NÚMERO *</label>
                <input
                  type="text"
                  required
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
                  value={formData.rgNumero}
                  onChange={e => handleChange('rgNumero', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">RG DATA EMISSÃO</label>
                <input
                  type="date"
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
                  value={formData.rgDataEmissao}
                  onChange={e => handleChange('rgDataEmissao', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">DATA NASCIMENTO *</label>
                <input
                  type="date"
                  required
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
                  value={formData.dataNascimento}
                  onChange={e => handleChange('dataNascimento', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">SEXO *</label>
                <select
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
                  value={formData.sexo}
                  onChange={e => handleChange('sexo', e.target.value)}
                >
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMININO">Feminino</option>
                  <option value="INTERSEXO">Intersexo</option>
                  <option value="PREFIRO_NAO_INFORMAR">Prefiro não informar</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ESTADO CIVIL *</label>
                <select
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
                  value={formData.estadoCivil}
                  onChange={e => handleChange('estadoCivil', e.target.value)}
                >
                  <option value="SOLTEIRO">Solteiro(a)</option>
                  <option value="CASADO">Casado(a)</option>
                  <option value="DIVORCIADO">Divorciado(a)</option>
                  <option value="UNIAO_ESTAVEL">União Estável</option>
                  <option value="VIUVO">Viúvo(a)</option>
                  <option value="SEPARADO_JUDICIALMENTE">Separado Judicialmente</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">NATURALIDADE (CIDADE) *</label>
                <input
                  type="text"
                  required
                  className="w-full p-2.5 border border-slate-300 rounded-xl uppercase text-sm"
                  value={formData.naturalidade}
                  onChange={e => handleChange('naturalidade', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">CNH (OPCIONAL)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Número"
                    className="w-2/3 p-2.5 border border-slate-300 rounded-xl text-sm"
                    value={formData.cnhNumero}
                    onChange={e => handleChange('cnhNumero', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Cat. Ex: B"
                    maxLength={3}
                    className="w-1/3 p-2.5 border border-slate-300 rounded-xl uppercase text-sm text-center"
                    value={formData.cnhTipo}
                    onChange={e => handleChange('cnhTipo', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ETAPA 2: Filiação e Perfil */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2 mb-2">
              <User size={18} className="text-blue-600" /> 2. Filiação e Perfil Sociocultural
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">NOME DA MÃE *</label>
              <input
                type="text"
                required
                className="w-full p-2.5 border border-slate-300 rounded-xl uppercase text-sm"
                value={formData.nomeMae}
                onChange={e => handleChange('nomeMae', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ESTADO NATAL MÃE (UF)</label>
                <input
                  type="text"
                  maxLength={2}
                  className="w-full p-2.5 border border-slate-300 rounded-xl uppercase text-sm text-center"
                  value={formData.maeEstadoNatal}
                  onChange={e => handleChange('maeEstadoNatal', e.target.value.toUpperCase())}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">NATURALIDADE DA MÃE</label>
                <input
                  type="text"
                  className="w-full p-2.5 border border-slate-300 rounded-xl uppercase text-sm"
                  value={formData.maeNaturalidade}
                  onChange={e => handleChange('maeNaturalidade', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">DATA NASCIMENTO MÃE</label>
                <input
                  type="date"
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
                  value={formData.maeDataNascimento}
                  onChange={e => handleChange('maeDataNascimento', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">NOME DO PAI (OPCIONAL)</label>
              <input
                type="text"
                className="w-full p-2.5 border border-slate-300 rounded-xl uppercase text-sm"
                value={formData.nomePai}
                onChange={e => handleChange('nomePai', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ESCOLARIDADE *</label>
                <select
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
                  value={formData.escolaridade}
                  onChange={e => handleChange('escolaridade', e.target.value)}
                >
                  <option value="FUNDAMENTAL_INCOMPLETO">Ensino Fundamental Incompleto</option>
                  <option value="FUNDAMENTAL_COMPLETO">Ensino Fundamental Completo</option>
                  <option value="MEDIO_INCOMPLETO">Ensino Médio Incompleto</option>
                  <option value="MEDIO_COMPLETO">Ensino Médio Completo</option>
                  <option value="SUPERIOR_INCOMPLETO">Superior Incompleto</option>
                  <option value="SUPERIOR_COMPLETO">Superior Completo</option>
                  <option value="POS_GRADUACAO">Pós-Graduação / Especialização</option>
                  <option value="MESTRADO">Mestrado</option>
                  <option value="DOUTORADO">Doutorado</option>
                  <option value="ANALFABETO">Não Alfabetizado</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">TIPO DE ESCOLA ORIGEM *</label>
                <select
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
                  value={formData.tipoEscolaOrigem}
                  onChange={e => handleChange('tipoEscolaOrigem', e.target.value)}
                >
                  <option value="PUBLICA_ESTADUAL">Pública Estadual</option>
                  <option value="PUBLICA_MUNICIPAL">Pública Municipal</option>
                  <option value="PUBLICA_FEDERAL">Pública Federal</option>
                  <option value="PRIVADA_REGULAR">Privada / Particular Regular</option>
                  <option value="PRIVADA_FILANTROPICA">Privada Filantrópica / Comunitária</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ETNIA / COR *</label>
                <select
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
                  value={formData.etnia}
                  onChange={e => handleChange('etnia', e.target.value)}
                >
                  <option value="PARDA">Parda</option>
                  <option value="BRANCA">Branca</option>
                  <option value="NEGRA">Negra</option>
                  <option value="AMARELA">Amarela</option>
                  <option value="INDIGENA">Indígena</option>
                  <option value="NAO_DECLARADA">Não Declarada</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">NECESSIDADES ESPECIAIS *</label>
                <select
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
                  value={formData.necessidadeEspecial}
                  onChange={e => handleChange('necessidadeEspecial', e.target.value)}
                >
                  <option value="NAO_POSSUI">Não Possui</option>
                  <option value="FISICA">Física</option>
                  <option value="VISUAL">Visual</option>
                  <option value="AUDITIVA">Auditiva</option>
                  <option value="INTELECTUAL">Intelectual</option>
                  <option value="MULTIPLAS">Múltiplas</option>
                  <option value="ALTAS_HABILIDADES">Altas Habilidades</option>
                  <option value="REABILITADO_BR">Reabilitado (INSS)</option>
                  <option value="OUTRAS">Outras</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">SITUAÇÃO OCUPACIONAL *</label>
                <select
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
                  value={formData.situacaoOcupacional}
                  onChange={e => handleChange('situacaoOcupacional', e.target.value)}
                >
                  <option value="EMPREGADO">Empregado</option>
                  <option value="AUTONOMO">Autônomo</option>
                  <option value="DESEMPREGADO">Desempregado</option>
                  <option value="PRIMEIRO_EMPREGO">Em busca do 1º Emprego</option>
                  <option value="PROFISSIONAL_LIBERAL">Profissional Liberal</option>
                  <option value="EMPREGADOR">Empregador</option>
                  <option value="APOSENTADO">Aposentado</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ETAPA 3: Endereço e Telefones */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2 mb-2">
              <MapPin size={18} className="text-blue-600" /> 3. Endereço e Contatos
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">E-MAIL PRINCIPAL *</label>
              <input
                type="email"
                required
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm lowercase"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">TELEFONE CELULAR *</label>
                <input
                  type="text"
                  required
                  placeholder="(94) 99999-9999"
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
                  value={formData.telefoneCelular}
                  onChange={e => handleChange('telefoneCelular', maskPhone(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">TELEFONE RESIDENCIAL</label>
                <input
                  type="text"
                  placeholder="(94) 3333-3333"
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
                  value={formData.telefoneResidencial}
                  onChange={e => handleChange('telefoneResidencial', maskPhone(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">RECADO / CONTATO</label>
                <input
                  type="text"
                  placeholder="(94) 99999-9999"
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
                  value={formData.telefoneRecados}
                  onChange={e => handleChange('telefoneRecados', maskPhone(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  CEP * {loadingCEP && <span className="text-blue-600 font-normal">Buscando...</span>}
                </label>
                <input
                  type="text"
                  required
                  placeholder="68515-000"
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
                  value={formData.cep}
                  onChange={e => handleChange('cep', maskCEP(e.target.value))}
                  onBlur={handleCEPBlur}
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">LOGRADOURO (RUA/AVENIDA E NÚMERO) *</label>
                <input
                  type="text"
                  required
                  className="w-full p-2.5 border border-slate-300 rounded-xl uppercase text-sm"
                  value={formData.enderecoLogradouro}
                  onChange={e => handleChange('enderecoLogradouro', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">BAIRRO *</label>
                <input
                  type="text"
                  required
                  className="w-full p-2.5 border border-slate-300 rounded-xl uppercase text-sm"
                  value={formData.bairro}
                  onChange={e => handleChange('bairro', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">MUNICÍPIO *</label>
                <input
                  type="text"
                  required
                  className="w-full p-2.5 border border-slate-300 rounded-xl uppercase text-sm"
                  value={formData.municipio}
                  onChange={e => handleChange('municipio', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">UF *</label>
                <input
                  type="text"
                  maxLength={2}
                  required
                  className="w-full p-2.5 border border-slate-300 rounded-xl uppercase text-sm text-center"
                  value={formData.uf}
                  onChange={e => handleChange('uf', e.target.value.toUpperCase())}
                />
              </div>
            </div>
          </div>
        )}

        {/* ETAPA 4: Validação Final e LGPD */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2 mb-2">
              <ShieldCheck size={18} className="text-blue-600" /> 4. Confirmação e LGPD
            </h3>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 space-y-2">
              <p className="font-semibold text-slate-800 text-sm">Resumo dos Dados:</p>
              <p>• <strong>Aluno:</strong> {formData.nomeCompleto} (CPF: {formData.cpf})</p>
              <p>• <strong>Curso:</strong> {formData.curso} - Turno {formData.turno}</p>
              <p>• <strong>Contato:</strong> {formData.telefoneCelular} | {formData.email}</p>
              <p>• <strong>Endereço:</strong> {formData.enderecoLogradouro}, {formData.bairro} - {formData.municipio}/{formData.uf}</p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  checked={formData.termoLgpdAceito}
                  onChange={e => handleChange('termoLgpdAceito', e.target.checked)}
                />
                <span className="text-xs text-slate-700 leading-relaxed">
                  Autorizo o <strong>SENAI Parauapebas</strong> a coletar e tratar os dados informados acima, 
                  em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)</strong>, 
                  exclusivamente para finalidades de registro acadêmico, emissão de certificados e comunicações institucionais.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Controles de Navegação */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-100">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(prev => prev - 1)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-all cursor-pointer"
            >
              <ArrowLeft size={16} /> Voltar
            </button>
          ) : (
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 font-medium text-sm hover:bg-slate-50 transition-all cursor-pointer"
            >
              Cancelar
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              Avançar <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Enviando...
                </>
              ) : (
                <>
                  <CheckCircle size={16} /> Finalizar e Enviar
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};