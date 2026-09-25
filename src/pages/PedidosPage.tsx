import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';

export const PedidosPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-sora text-xl font-bold text-white flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-[#3D8BFF]" /> Pedidos dos Marketplaces
        </h2>
        <p className="text-xs text-[#8B8B95] mt-1">Sincronização de vendas e despachos</p>
      </div>

      <EmptyState
        icon={ShoppingCart}
        title="Nenhum pedido encontrado."
        description="Quando seus anúncios no Mercado Livre receberem compras, os pedidos aparecerão automaticamente aqui."
      />
    </div>
  );
};
