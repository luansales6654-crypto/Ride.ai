import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';

export const ProdutosPublicadosPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-sora text-xl font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#3D8BFF]" /> Produtos Publicados em Marketplaces
        </h2>
        <p className="text-xs text-[#8B8B95] mt-1">Anúncios ativos no Mercado Livre, Shopee e TikTok Shop</p>
      </div>

      <EmptyState
        icon={CheckCircle2}
        title="Nenhum produto publicado."
        description="Conecte sua conta do Mercado Livre em Integrações para começar a publicar seus anúncios."
      />
    </div>
  );
};
