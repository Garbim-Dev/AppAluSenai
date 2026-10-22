import React, { useState, useEffect } from 'react';
import { QrCode, UserCheck, School, Building2 } from 'lucide-react';
import { StudentForm } from './components/StudentForm';
import { InstructorView } from './components/InstructorView';
import { SecretariaDashboard } from './components/SecretariaDashboard';

export default function App() {
  const [currentView, setCurrentView] = useState<'HOME' | 'STUDENT_FORM' | 'INSTRUCTOR_QR' | 'SECRETARIA'>('HOME');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'cadastro') {
      setCurrentView('STUDENT_FORM');
    }
  }, []);

  if (currentView === 'STUDENT_FORM') {
    return (
      <div className="min-h-screen bg-slate-100 p-2 sm:p-4">
        <StudentForm onBack={() => {
          window.history.pushState({}, '', window.location.pathname);
          setCurrentView('HOME');
        }} />
      </div>
    );
  }

  if (currentView === 'INSTRUCTOR_QR') {
    return (
      <div className="min-h-screen bg-slate-100 p-2 sm:p-4 flex flex-col justify-center">
        <InstructorView onBack={() => setCurrentView('HOME')} />
      </div>
    );
  }

  if (currentView === 'SECRETARIA') {
    return (
      <div className="min-h-screen bg-slate-100 p-2 sm:p-4">
        <SecretariaDashboard onBack={() => setCurrentView('HOME')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-200 text-center">
        
        {/* Ícone e Cabeçalho */}
        <div className="flex justify-center mb-4">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 shadow-sm">
            <School size={40} />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          SENAI Parauapebas
        </h1>
        <p className="text-sm text-slate-500 mt-1 mb-8">
          Sistema de Cadastro e Atualização Cadastral
        </p>

        {/* Menu de Ações */}
        <div className="space-y-3">
          <button 
            onClick={() => setCurrentView('STUDENT_FORM')}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-4 rounded-2xl shadow-md transition-all cursor-pointer"
          >
            <UserCheck size={20} />
            <span>Ficha de Cadastro do Aluno</span>
          </button>

          <button 
            onClick={() => setCurrentView('INSTRUCTOR_QR')}
            className="w-full flex items-center justify-center gap-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3.5 px-4 rounded-2xl transition-all cursor-pointer"
          >
            <QrCode size={20} />
            <span>Área do Instrutor (QR Code)</span>
          </button>

          <button 
            onClick={() => setCurrentView('SECRETARIA')}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold py-3.5 px-4 rounded-2xl transition-all cursor-pointer shadow-sm"
          >
            <Building2 size={20} className="text-blue-600" />
            <span>Painel da Secretaria</span>
          </button>
        </div>
      </div>
    </div>
  );
}