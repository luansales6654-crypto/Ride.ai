import React from 'react';
import { LifeBuoy, Search, FileText } from 'lucide-react';

export const AdminOperacaoPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-sora text-xl font-bold text-white flex items-center gap-2">
          <LifeBuoy className="w-5 h-5 text-[#3D8BFF]" /> Painel Admin 2 — Operação e Suporte
        </h2>
        <p className="text-xs text-[#8B8B95] mt-1">
          Atendimento ao cliente, registro de notas internas e acompanhamento de chamados
        </p>
      </div>

      <div className="card-surface p-6 rounded-2xl border border-[#26262B] bg-[#0A0A0B] text-xs">
        <h3 className="font-sora font-bold text-white mb-2">Consulta de Contas do Suporte</h3>
        <p className="text-[#8B8B95]">Digite o e-mail do usuário para consultar o histórico de suporte.</p>
      </div>
    </div>
  );
};
