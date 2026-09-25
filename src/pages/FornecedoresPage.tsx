import React from 'react';
import { Truck } from 'lucide-react';
import { generateDemoSuppliers } from '../database/demoCatalogSeed';

export const FornecedoresPage: React.FC = () => {
  const suppliers = generateDemoSuppliers();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-sora text-xl font-bold text-white flex items-center gap-2">
          <Truck className="w-5 h-5 text-[#3D8BFF]" /> Fornecedores Vinculados ({suppliers.length})
        </h2>
        <p className="text-xs text-[#8B8B95] mt-1">Parceiros de logística e estoque para atendimento dos produtos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.map((sup) => (
          <div key={sup.id} className="card-surface p-5 rounded-2xl border border-[#26262B] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-sora font-bold text-white">{sup.name}</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-dashed border-[#3D8BFF] text-[#8DBBFF]">
                DEMO
              </span>
            </div>

            <p className="text-[#8B8B95]">{sup.city} / {sup.state}</p>
            <p className="text-[#C9C9CF]">Prazo médio de postagem: {sup.avgLeadTimeDays} dia(s)</p>
            <p className="text-[#5E5E68] text-[11px]">{sup.shippingPolicy}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
