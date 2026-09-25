import React, { useState } from 'react';
import { PackageCheck, Plus } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';

export const MeusProdutosPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-sora text-xl font-bold text-white flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-[#3D8BFF]" /> Meus Produtos
          </h2>
          <p className="text-xs text-[#8B8B95] mt-1">Produtos cadastrados por você prontos para publicação</p>
        </div>
      </div>

      <EmptyState
        icon={PackageCheck}
        title="Nenhum produto cadastrado por você ainda"
        description="Acesse o Catálogo e selecione produtos para cadastrá-los na sua lista privada ou importá-los por planilha."
      />
    </div>
  );
};
