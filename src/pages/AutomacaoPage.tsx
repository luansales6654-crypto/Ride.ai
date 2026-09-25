import React from 'react';
import { Cpu, Play } from 'lucide-react';
import { useToast } from '../components/ui/Toast';

export const AutomacaoPage: React.FC = () => {
  const { showToast } = useToast();

  const handleRunNow = (jobName: string) => {
    showToast({
      type: 'info',
      title: `Automação executada: ${jobName}`,
      message: 'Execução concluída com sucesso. 0 erros encontrados.',
    });
  };

  const jobs = [
    { name: 'Atualização de Estoque', freq: 'A cada 1 hora', desc: 'Sincroniza saldos entre fornecedores e marketplaces' },
    { name: 'Sincronização de Pedidos', freq: 'A cada 15 min', desc: 'Baixa novos pedidos do Mercado Livre e atualiza faturamento' },
    { name: 'Verificação de Links de Fotos', freq: 'Diário', desc: 'Verifica se alguma imagem de produto está indisponível' },
    { name: 'Lembretes de Follow-up CRM', freq: 'Diário às 08:00', desc: 'Gera notificações para leads com data de retorno hoje' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-sora text-xl font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-[#3D8BFF]" /> Automações e Logs de Execução
        </h2>
        <p className="text-xs text-[#8B8B95] mt-1">Rotinas periódicas em segundo plano da plataforma RIDE.IA</p>
      </div>

      <div className="space-y-3">
        {jobs.map((job) => (
          <div key={job.name} className="card-surface p-4 rounded-xl border border-[#26262B] flex items-center justify-between gap-4 text-xs">
            <div>
              <h3 className="font-sora font-bold text-white text-sm">{job.name}</h3>
              <p className="text-[#8B8B95] mt-0.5">{job.desc}</p>
              <span className="text-[10px] text-[#3D8BFF] font-semibold mt-1 inline-block">Frequência: {job.freq}</span>
            </div>

            <button
              onClick={() => handleRunNow(job.name)}
              className="btn-secondary h-8 px-3 text-xs shrink-0"
            >
              <Play className="w-3.5 h-3.5" /> Rodar agora
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
