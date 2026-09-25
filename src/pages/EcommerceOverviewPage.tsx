import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Grid, PackageCheck, Truck, Layers, CheckCircle2, ShoppingCart } from 'lucide-react';

export const EcommerceOverviewPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-sora text-xl font-bold text-white flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-[#3D8BFF]" /> Visão Geral do E-commerce & Marketplace
        </h2>
        <p className="text-xs text-[#8B8B95] mt-1">
          Acompanhe catálogo, fornecedores, integrações e pedidos recebidos
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => navigate('/app/catalogo')}
          className="card-surface p-5 rounded-2xl border border-[#26262B] hover:border-[#3D8BFF]/40 cursor-pointer transition-all"
        >
          <Grid className="w-6 h-6 text-[#3D8BFF] mb-2" />
          <span className="text-[10px] text-[#8B8B95] uppercase font-bold block">Catálogo Global</span>
          <span className="font-sora text-2xl font-bold text-white">1.000</span>
          <span className="text-[10px] text-[#8B8B95] block mt-1">Itens disponíveis</span>
        </div>

        <div
          onClick={() => navigate('/app/fornecedores')}
          className="card-surface p-5 rounded-2xl border border-[#26262B] hover:border-[#3D8BFF]/40 cursor-pointer transition-all"
        >
          <Truck className="w-6 h-6 text-[#3D8BFF] mb-2" />
          <span className="text-[10px] text-[#8B8B95] uppercase font-bold block">Fornecedores</span>
          <span className="font-sora text-2xl font-bold text-white">40</span>
          <span className="text-[10px] text-[#8B8B95] block mt-1">Cadastrados</span>
        </div>

        <div
          onClick={() => navigate('/app/integracoes')}
          className="card-surface p-5 rounded-2xl border border-[#26262B] hover:border-[#3D8BFF]/40 cursor-pointer transition-all"
        >
          <Layers className="w-6 h-6 text-[#3D8BFF] mb-2" />
          <span className="text-[10px] text-[#8B8B95] uppercase font-bold block">Marketplaces</span>
          <span className="font-sora text-2xl font-bold text-white">3</span>
          <span className="text-[10px] text-[#8B8B95] block mt-1">ML, Shopee, TikTok</span>
        </div>

        <div
          onClick={() => navigate('/app/pedidos')}
          className="card-surface p-5 rounded-2xl border border-[#26262B] hover:border-[#3D8BFF]/40 cursor-pointer transition-all"
        >
          <ShoppingCart className="w-6 h-6 text-[#3D8BFF] mb-2" />
          <span className="text-[10px] text-[#8B8B95] uppercase font-bold block">Pedidos</span>
          <span className="font-sora text-2xl font-bold text-white">0</span>
          <span className="text-[10px] text-[#8B8B95] block mt-1">Pendentes</span>
        </div>
      </div>
    </div>
  );
};
