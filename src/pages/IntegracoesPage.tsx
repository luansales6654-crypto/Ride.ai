import React, { useState, useEffect } from 'react';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import {
  Layers,
  Search,
  Cpu,
  ShoppingBag,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

export const IntegracoesPage: React.FC = () => {
  const [configStatus, setConfigStatus] = useState({
    googlePlaces: false,
    mercadolivre: false,
    shopee: false,
    tiktok: false,
    gemini: true,
  });

  const [drawerOpen, setDrawerOpen] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchStatus = () => {
    fetch('/api/config/status')
      .then((res) => res.json())
      .then((data) => setConfigStatus(data))
      .catch((err) => console.warn('Erro ao carregar status:', err));
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-sora text-xl font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#3D8BFF]" /> Integrações e Marketplaces
        </h2>
        <p className="text-xs text-[#8B8B95] mt-1">
          Gerencie suas conexões oficiais com Google Maps, Mercado Livre, Shopee e Gemini AI
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Google Places */}
        <div className="card-surface p-6 rounded-2xl border border-[#26262B] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Search className="w-6 h-6 text-[#3D8BFF]" />
                <h3 className="font-sora font-bold text-base text-white">Google Maps Places</h3>
              </div>

              {configStatus.googlePlaces ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#2FBF71]/15 text-[#2FBF71] border border-[#2FBF71]/30">
                  Conectado
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FF6B57]/15 text-[#FF6B57] border border-[#FF6B57]/30">
                  Não configurado
                </span>
              )}
            </div>

            <p className="text-xs text-[#8B8B95] leading-relaxed">
              Utilizado na área de prospecção para buscar empresas reais com dados atualizados e geolocalizados.
            </p>
          </div>

          <div className="pt-3 border-t border-[#26262B] flex items-center justify-between">
            <span className="text-[10px] text-[#5E5E68]">Secret: GOOGLE_MAPS_API_KEY</span>
            <button
              onClick={() => setDrawerOpen('googlePlaces')}
              className="btn-secondary h-8 px-3 text-xs"
            >
              Configurar
            </button>
          </div>
        </div>

        {/* Mercado Livre */}
        <div className="card-surface p-6 rounded-2xl border border-[#26262B] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-[#F5A524]" />
                <h3 className="font-sora font-bold text-base text-white">Mercado Livre</h3>
              </div>

              {configStatus.mercadolivre ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#2FBF71]/15 text-[#2FBF71] border border-[#2FBF71]/30">
                  Pronto para OAuth
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FF6B57]/15 text-[#FF6B57] border border-[#FF6B57]/30">
                  Não configurado
                </span>
              )}
            </div>

            <p className="text-xs text-[#8B8B95] leading-relaxed">
              Publicação de anúncios, sincronização de estoque e recebimento de pedidos automáticos via OAuth 2.0.
            </p>
          </div>

          <div className="pt-3 border-t border-[#26262B] flex items-center justify-between">
            <span className="text-[10px] text-[#5E5E68]">Secrets: ML_CLIENT_ID, ML_CLIENT_SECRET</span>
            <button
              onClick={() => setDrawerOpen('mercadolivre')}
              className="btn-secondary h-8 px-3 text-xs"
            >
              Configurar
            </button>
          </div>
        </div>

        {/* Gemini AI */}
        <div className="card-surface p-6 rounded-2xl border border-[#26262B] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-6 h-6 text-[#3D8BFF]" />
                <h3 className="font-sora font-bold text-base text-white">Gemini AI (Google)</h3>
              </div>

              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#2FBF71]/15 text-[#2FBF71] border border-[#2FBF71]/30">
                Ativo
              </span>
            </div>

            <p className="text-xs text-[#8B8B95] leading-relaxed">
              Motor de inteligência artificial para geração de mensagens, propostas comerciais e o Prompt Mestre.
            </p>
          </div>

          <div className="pt-3 border-t border-[#26262B] flex items-center justify-between">
            <span className="text-[10px] text-[#5E5E68]">Secret: GEMINI_API_KEY</span>
            <span className="text-xs text-[#2FBF71] font-semibold">Injetado pelo AI Studio</span>
          </div>
        </div>
      </div>

      {/* Config Drawer / Modal */}
      {drawerOpen && (
        <Modal
          isOpen={Boolean(drawerOpen)}
          onClose={() => setDrawerOpen(null)}
          title={`Configuração da Integração — ${drawerOpen}`}
          description="Siga o passo a passo para conectar as credenciais com segurança no servidor"
        >
          <div className="space-y-4 text-xs">
            <p className="text-[#C9C9CF] leading-relaxed">
              Para ativar esta funcionalidade na RIDE.IA, cadastre os valores dos segredos necessários na aba <strong>Secrets</strong> do painel lateral do AI Studio.
            </p>

            <div className="p-4 rounded-xl bg-[#18181B] border border-[#26262B] space-y-2">
              <h4 className="font-sora font-bold text-white">Checklist de Segredos Necessários:</h4>
              <ul className="space-y-1 text-[#8B8B95]">
                {drawerOpen === 'googlePlaces' && (
                  <li className="flex items-center gap-2">
                    <span className={configStatus.googlePlaces ? 'text-green-400' : 'text-red-400'}>
                      {configStatus.googlePlaces ? '✓' : '✗'} GOOGLE_MAPS_API_KEY
                    </span>
                  </li>
                )}
                {drawerOpen === 'mercadolivre' && (
                  <>
                    <li className="flex items-center gap-2">
                      <span className={configStatus.mercadolivre ? 'text-green-400' : 'text-red-400'}>
                        {configStatus.mercadolivre ? '✓' : '✗'} ML_CLIENT_ID
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={configStatus.mercadolivre ? 'text-green-400' : 'text-red-400'}>
                        {configStatus.mercadolivre ? '✓' : '✗'} ML_CLIENT_SECRET
                      </span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            <div className="pt-4 flex justify-end">
              <button onClick={() => setDrawerOpen(null)} className="btn-primary">
                Entendido
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
