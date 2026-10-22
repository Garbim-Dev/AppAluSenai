import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ArrowLeft, QrCode, Copy, Check, Download, 
  Maximize2, Minimize2, School, Sparkles, Wifi 
} from 'lucide-react';

interface InstructorViewProps {
  onBack: () => void;
}

const CURSOS_SUGERIDOS = [
  'OPERAÇÃO DE MINA',
  'TÉCNICO EM ELETROMECÂNICA',
  'TÉCNICO EM SEGURANÇA DO TRABALHO',
  'MANUTENÇÃO MECÂNICA INDUSTRIAL',
  'OPERADOR DE EQUIPAMENTOS MÓVEIS',
  'ELETRICISTA INDUSTRIAL',
  'SOLDAGEM INDUSTRIAL',
];

export const InstructorView: React.FC<InstructorViewProps> = ({ onBack }) => {
  const [curso, setCurso] = useState('OPERAÇÃO DE MINA');
  const [turno, setTurno] = useState('NOITE');
  const [copied, setCopied] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  // Permite configurar o IP da máquina para a rede local
  const defaultHost = window.location.hostname === 'localhost' ? '' : window.location.hostname;
  const [customIp, setCustomIp] = useState(() => {
    return localStorage.getItem('senai_server_ip') || defaultHost;
  });

  const port = window.location.port || '5174';
  const effectiveHost = customIp ? `http://${customIp}:${port}` : window.location.origin;
  
  const targetUrl = `${effectiveHost}/?view=cadastro&curso=${encodeURIComponent(curso)}&turno=${encodeURIComponent(turno)}`;

  const handleIpChange = (val: string) => {
    setCustomIp(val.trim());
    localStorage.setItem('senai_server_ip', val.trim());
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width + 80;
      canvas.height = img.height + 80;
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 40, 40);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `QR_${curso.replace(/\s+/g, '_')}_${turno}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className={`max-w-4xl mx-auto transition-all ${fullscreen ? 'fixed inset-0 z-50 bg-slate-900 p-6 flex flex-col justify-center items-center max-w-none' : 'p-4 sm:p-6'}`}>
      <div className={`bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden w-full ${fullscreen ? 'max-w-3xl' : ''}`}>
        
        {/* Barra Superior */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-2xl text-white">
              <School size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold">Painel do Instrutor • SENAI</h1>
              <p className="text-xs text-slate-400">Projeção de QR Code para Turma em Sala</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFullscreen(!fullscreen)}
              title={fullscreen ? 'Sair do Modo Apresentação' : 'Modo Telão / Projetor'}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              {fullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            {!fullscreen && (
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
              >
                <ArrowLeft size={16} /> Voltar
              </button>
            )}
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          {/* Lado Esquerdo: Configuração da Turma */}
          <div className="space-y-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-2">
                <Sparkles size={14} /> Configuração da Aula
              </span>
              <h2 className="text-xl font-bold text-slate-800">Parâmetros da Turma</h2>
            </div>

            {/* Configuração do IP para leitura no celular */}
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900">
              <label className="flex items-center gap-1.5 font-bold mb-1">
                <Wifi size={14} className="text-amber-700" /> IP do Computador na Wi-Fi (para celular)
              </label>
              <input
                type="text"
                placeholder="Ex: 192.168.1.15 (do ipconfig)"
                value={customIp}
                onChange={(e) => handleIpChange(e.target.value)}
                className="w-full p-2 bg-white border border-amber-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-[10px] text-amber-700 block mt-1">
                Necessário para o smartphone na mesma rede Wi-Fi encontrar o formulário.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">CURSO / QUALIFICAÇÃO</label>
              <input
                type="text"
                list="cursos-list"
                value={curso}
                onChange={(e) => setCurso(e.target.value.toUpperCase())}
                placeholder="Digite ou selecione o curso"
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <datalist id="cursos-list">
                {CURSOS_SUGERIDOS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">TURNO</label>
              <div className="grid grid-cols-3 gap-2">
                {(['MANHA', 'TARDE', 'NOITE'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTurno(t)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      turno === t
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {t === 'MANHA' ? 'Manhã' : t === 'TARDE' ? 'Tarde' : 'Noite'}
                  </button>
                ))}
              </div>
            </div>

            {/* Link Direto */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                URL Codificada no QR Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={targetUrl}
                  className="w-full bg-white px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-600 truncate font-mono select-all"
                />
                <button
                  onClick={handleCopyLink}
                  title="Copiar Link"
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all flex items-center justify-center shrink-0 cursor-pointer"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Lado Direito: Projeção do QR Code */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-3xl border border-slate-200 text-center">
            <div className="bg-white p-5 rounded-2xl shadow-lg border border-slate-100 flex flex-col items-center justify-center">
              <QRCodeSVG
                id="qr-code-svg"
                value={targetUrl}
                size={fullscreen ? 280 : 200}
                level="H"
                includeMargin={true}
              />
              <div className="mt-3 pt-3 border-t border-slate-100 w-full">
                <p className="text-xs font-black text-slate-800 tracking-wider uppercase">{curso}</p>
                <p className="text-[11px] text-slate-500 font-semibold">TURNO: {turno}</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-3 max-w-xs font-medium">
              Conecte o smartphone na mesma rede Wi-Fi e aponte a câmera.
            </p>

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleDownloadQR}
                className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <Download size={14} /> Salvar
              </button>
              <button
                onClick={() => setFullscreen(true)}
                className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <QrCode size={14} /> Telão
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};