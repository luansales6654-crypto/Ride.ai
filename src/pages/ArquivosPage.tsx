import React from 'react';
import { Folder } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';

export const ArquivosPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-sora text-xl font-bold text-white flex items-center gap-2">
          <Folder className="w-5 h-5 text-[#3D8BFF]" /> Gestor de Arquivos e Mídias
        </h2>
        <p className="text-xs text-[#8B8B95] mt-1">Uploads de logos, mídias de produtos e exportações</p>
      </div>

      <EmptyState
        icon={Folder}
        title="Nenhum arquivo enviado."
        description="Seus uploads de imagens de produtos, logos de agências e PDFs de propostas gerados aparecerão aqui."
      />
    </div>
  );
};
