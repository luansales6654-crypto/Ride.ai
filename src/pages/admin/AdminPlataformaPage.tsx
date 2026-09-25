import React from 'react';
import { Shield, Activity, Cpu, Users } from 'lucide-react';

export const AdminPlataformaPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-sora text-xl font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#3D8BFF]" /> Painel Admin 1 — Administração da Plataforma
        </h2>
        <p className="text-xs text-[#8B8B95] mt-1">
          Visão técnica global de contas, filas de automação, integrações e métricas do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-surface p-5 rounded-2xl border border-[#26262B]">
          <Users className="w-6 h-6 text-[#3D8BFF] mb-2" />
          <span className="text-[10px] text-[#8B8B95] uppercase font-bold block">Usuários Ativos</span>
          <span className="font-sora text-2xl font-bold text-white">1</span>
        </div>
        <div className="card-surface p-5 rounded-2xl border border-[#26262B]">
          <Activity className="w-6 h-6 text-[#3D8BFF] mb-2" />
          <span className="text-[10px] text-[#8B8B95] uppercase font-bold block">Saúde do Servidor</span>
          <span className="font-sora text-2xl font-bold text-[#2FBF71]">100% OK</span>
        </div>
        <div className="card-surface p-5 rounded-2xl border border-[#26262B]">
          <Cpu className="w-6 h-6 text-[#3D8BFF] mb-2" />
          <span className="text-[10px] text-[#8B8B95] uppercase font-bold block">Status Gemini API</span>
          <span className="font-sora text-2xl font-bold text-[#2FBF71]">Conectado</span>
        </div>
      </div>
    </div>
  );
};
