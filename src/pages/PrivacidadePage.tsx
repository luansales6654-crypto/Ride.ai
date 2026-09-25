import React from 'react';
import { Logo } from '../components/ui/Logo';
import { NavLink } from 'react-router-dom';

export const PrivacidadePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#000000] text-white p-6 sm:p-12 font-['Inter',sans-serif] max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b border-[#26262B] pb-6">
        <NavLink to="/">
          <Logo variant="full" size="md" />
        </NavLink>
        <NavLink to="/" className="text-xs text-[#3D8BFF] hover:underline">Voltar para início</NavLink>
      </div>

      <div className="space-y-4 text-xs text-[#C9C9CF] leading-relaxed">
        <h1 className="font-sora text-2xl font-bold text-white">Política de Privacidade e LGPD — RIDE.IA</h1>
        <p>Última atualização: 24 de setembro de 2026</p>

        <h3 className="font-sora text-sm font-bold text-white pt-4">1. Coleta e Isolamento de Dados</h3>
        <p>Todos os dados cadastrados pelos usuários (leads, propostas, vendas e produtos) são mantidos estritamente isolados por conta no banco de dados Firebase Firestore.</p>

        <h3 className="font-sora text-sm font-bold text-white pt-4">2. Direitos dos Titulares (LGPD)</h3>
        <p>Você tem o direito de exportar todos os seus dados a qualquer momento em formato CSV/JSON ou solicitar a exclusão definitiva da sua conta.</p>
      </div>
    </div>
  );
};
