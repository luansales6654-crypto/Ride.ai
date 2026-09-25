import React from 'react';
import { Logo } from '../components/ui/Logo';
import { NavLink } from 'react-router-dom';

export const TermosPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#000000] text-white p-6 sm:p-12 font-['Inter',sans-serif] max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b border-[#26262B] pb-6">
        <NavLink to="/">
          <Logo variant="full" size="md" />
        </NavLink>
        <NavLink to="/" className="text-xs text-[#3D8BFF] hover:underline">Voltar para início</NavLink>
      </div>

      <div className="space-y-4 text-xs text-[#C9C9CF] leading-relaxed">
        <h1 className="font-sora text-2xl font-bold text-white">Termos de Uso — RIDE.IA</h1>
        <p>Última atualização: 24 de setembro de 2026</p>

        <h3 className="font-sora text-sm font-bold text-white pt-4">1. Aceitação dos Termos</h3>
        <p>Ao se cadastrar ou utilizar a plataforma RIDE.IA, você concorda expressamente com os presentes Termos de Uso.</p>

        <h3 className="font-sora text-sm font-bold text-white pt-4">2. Prospecção e Dados do Google Maps</h3>
        <p>A funcionalidade de prospecção utiliza dados públicos fornecidos pela API oficial da Google Maps Platform. A RIDE.IA opera estritamente sob as políticas de uso responsável e proíbe disparos em massa automatizados.</p>

        <h3 className="font-sora text-sm font-bold text-white pt-4">3. Responsabilidade do Usuário</h3>
        <p>O usuário é o único responsável pelo conteúdo das mensagens e propostas comerciais enviadas aos seus potenciais clientes.</p>
      </div>
    </div>
  );
};
