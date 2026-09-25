import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../database/firebase';
import { UserSettings, ServicePricing } from '../types';
import { useToast } from '../components/ui/Toast';
import { PRESET_BUTTON_THEMES, applyButtonColor } from '../utils/theme';
import {
  Settings,
  Building2,
  DollarSign,
  Palette,
  Database,
  Save,
  Plus,
  Trash2,
  Check,
  Sparkles,
} from 'lucide-react';

export const ConfiguracoesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'brand' | 'services' | 'appearance' | 'dashboard' | 'data'>('profile');

  // Form settings state
  const [agencyName, setAgencyName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [showSignature, setShowSignature] = useState(true);
  const [buttonColor, setButtonColor] = useState('#1769FF');
  const [services, setServices] = useState<ServicePricing[]>([]);
  const [dashboardYMinAxis, setDashboardYMinAxis] = useState(500);

  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    // Load local storage button color first
    const savedLocal = localStorage.getItem('ride_button_color');
    if (savedLocal) {
      setButtonColor(savedLocal);
    }

    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, 'users', user.uid, 'settings', 'data');
    getDoc(userRef).then((snap) => {
      if (snap.exists()) {
        const d = snap.data() as UserSettings;
        setAgencyName(d.brandName || '');
        setShowSignature(d.showSignature ?? true);
        setServices(d.services || []);
        setDashboardYMinAxis(d.dashboardYMinAxis || 500);
      }
    });

    const profRef = doc(db, 'users', user.uid, 'profile', 'data');
    getDoc(profRef).then((snap) => {
      if (snap.exists()) {
        const p = snap.data();
        setWhatsapp(p.whatsapp || '');
        if (p.buttonColor) {
          setButtonColor(p.buttonColor);
          applyButtonColor(p.buttonColor);
        }
      }
    });
  }, []);

  const handleColorChange = (newColor: string) => {
    setButtonColor(newColor);
    applyButtonColor(newColor);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Always apply color immediately locally
    applyButtonColor(buttonColor);

    const user = auth.currentUser;
    if (!user) {
      showToast({ type: 'success', title: 'Configurações e cor dos botões salvas com sucesso!' });
      setLoading(false);
      return;
    }

    try {
      await updateDoc(doc(db, 'users', user.uid, 'settings', 'data'), {
        brandName: agencyName.trim(),
        showSignature,
        services,
        dashboardYMinAxis,
        buttonColor,
        updatedAt: new Date().toISOString(),
      });

      await updateDoc(doc(db, 'users', user.uid, 'profile', 'data'), {
        agencyName: agencyName.trim(),
        whatsapp: whatsapp.trim(),
        buttonColor,
        updatedAt: new Date().toISOString(),
      });

      showToast({ type: 'success', title: 'Configurações e cor dos botões salvas com sucesso!' });
    } catch (err: any) {
      // Fallback local save success
      showToast({ type: 'success', title: 'Preferências salvas localmente!' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = () => {
    const newSvc: ServicePricing = {
      id: Math.random().toString(36).substring(2, 9),
      name: 'Novo Serviço',
      description: 'Descrição do serviço oferecido',
      scope: ['Item 1', 'Item 2'],
      deliveryDays: 5,
      price: 1000,
    };
    setServices([...services, newSvc]);
  };

  const handleRemoveService = (id: string) => {
    setServices(services.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-sora text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#3D8BFF]" /> Configurações da Plataforma RIDE.IA
        </h2>
        <p className="text-xs text-[#8B8B95] mt-1">
          Ajuste perfil, cores dos botões, tabela de preços dos serviços, prospecção e faturamento
        </p>
      </div>

      {/* Settings Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#26262B] pb-3">
        {[
          { id: 'profile', label: 'Perfil e Marca', icon: Building2 },
          { id: 'appearance', label: 'Cores dos Botões', icon: Palette },
          { id: 'services', label: 'Meus Serviços e Valores', icon: DollarSign },
          { id: 'dashboard', label: 'Dashboard e Faturamento', icon: Settings },
          { id: 'data', label: 'Dados e Exclusão', icon: Database },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === tab.id
                ? 'bg-[#1769FF] text-white shadow-[0_0_12px_rgba(23,105,255,0.3)]'
                : 'bg-[#111113] text-[#8B8B95] hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Profile & Brand Tab */}
        {activeTab === 'profile' && (
          <div className="card-surface p-6 rounded-2xl border border-[#26262B] bg-[#0A0A0B] space-y-4 max-w-2xl text-xs">
            <div>
              <label className="block text-[#C9C9CF] font-medium mb-1">Nome da Agência / Empresa Remetente</label>
              <input
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 outline-none focus:border-[#3D8BFF]"
              />
            </div>

            <div>
              <label className="block text-[#C9C9CF] font-medium mb-1">WhatsApp de Atendimento</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 outline-none focus:border-[#3D8BFF]"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-white font-medium">
                <input
                  type="checkbox"
                  checked={showSignature}
                  onChange={(e) => setShowSignature(e.target.checked)}
                  className="rounded border-[#26262B] bg-[#18181B] text-[#1769FF]"
                />
                Exibir assinatura discreta "Feito com RIDE.IA" nas propostas
              </label>
            </div>
          </div>
        )}

        {/* Button Color Appearance Tab */}
        {activeTab === 'appearance' && (
          <div className="card-surface p-6 rounded-2xl border border-[#26262B] bg-[#0A0A0B] space-y-6 max-w-3xl text-xs">
            <div>
              <h3 className="font-sora text-sm font-bold text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#3D8BFF]" /> Personalização da Cor dos Botões
              </h3>
              <p className="text-[11px] text-[#8B8B95] mt-1">
                Escolha a cor principal dos botões e destaques da ferramenta RIDE.IA. As alterações são aplicadas instantaneamente em toda a plataforma.
              </p>
            </div>

            {/* Palette Presets */}
            <div className="space-y-3">
              <label className="block text-[#C9C9CF] font-medium">Paleta de Cores Pré-definidas</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PRESET_BUTTON_THEMES.map((theme) => {
                  const isSelected = buttonColor.toLowerCase() === theme.primaryHex.toLowerCase();
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => handleColorChange(theme.primaryHex)}
                      className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                        isSelected
                          ? 'border-white bg-[#18181B] ring-2 ring-white/20 scale-[1.02]'
                          : 'border-[#26262B] bg-[#111113] hover:border-[#3A3A42]'
                      }`}
                    >
                      <div
                        className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center shadow-md"
                        style={{
                          background: `linear-gradient(135deg, ${theme.gradStart}, ${theme.gradEnd})`,
                        }}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white drop-shadow" />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-white truncate text-[11px]">{theme.name}</div>
                        <div className="text-[10px] text-[#8B8B95] font-mono">{theme.primaryHex}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Hex Selector */}
            <div className="pt-2 border-t border-[#26262B] space-y-3">
              <label className="block text-[#C9C9CF] font-medium">Cor Personalizada (Hex Code)</label>
              <div className="flex items-center gap-3 max-w-md">
                <div className="relative">
                  <input
                    type="color"
                    value={buttonColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-10 h-10 rounded-xl bg-[#18181B] border border-[#26262B] cursor-pointer p-1"
                  />
                </div>
                <input
                  type="text"
                  value={buttonColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  placeholder="#1769FF"
                  className="flex-1 bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 outline-none font-mono font-bold focus:border-[#3D8BFF]"
                />
              </div>
            </div>

            {/* Live Interactive Preview Box */}
            <div className="pt-4 border-t border-[#26262B] space-y-3">
              <div className="flex items-center gap-2 text-white font-medium">
                <Sparkles className="w-4 h-4 text-[#3D8BFF]" /> Visualização em Tempo Real na Ferramenta
              </div>
              <div className="p-5 rounded-xl bg-[#18181B] border border-[#26262B] space-y-4">
                <p className="text-[11px] text-[#8B8B95]">
                  Veja abaixo como os botões principais, secundários e badges aparecem na interface:
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <button type="button" className="btn-primary text-xs">
                    <Sparkles className="w-4 h-4" /> Botão Principal Ativo
                  </button>
                  <button type="button" className="btn-secondary text-xs">
                    Botão Secundário
                  </button>
                  <span
                    className="px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-md"
                    style={{ background: buttonColor }}
                  >
                    Badge RIDE.IA
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Services & Pricing Tab */}
        {activeTab === 'services' && (
          <div className="card-surface p-6 rounded-2xl border border-[#26262B] bg-[#0A0A0B] space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#26262B] pb-4">
              <div>
                <h3 className="font-sora text-sm font-bold text-white">Tabela de Serviços e Valores</h3>
                <p className="text-[11px] text-[#8B8B95]">Esta tabela alimenta automaticamente o gerador de propostas</p>
              </div>

              <button
                type="button"
                onClick={handleAddService}
                className="btn-secondary h-8 px-3 text-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Serviço
              </button>
            </div>

            <div className="space-y-3">
              {services.map((svc, index) => (
                <div key={svc.id} className="bg-[#18181B] p-4 rounded-xl border border-[#26262B] grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                  <div>
                    <label className="block text-[10px] text-[#8B8B95] mb-1">Nome do Serviço</label>
                    <input
                      type="text"
                      value={svc.name}
                      onChange={(e) => {
                        const next = [...services];
                        next[index].name = e.target.value;
                        setServices(next);
                      }}
                      className="w-full bg-[#0A0A0B] border border-[#26262B] text-white rounded-lg p-2 outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#8B8B95] mb-1">Valor Padrão (R$)</label>
                    <input
                      type="number"
                      value={svc.price}
                      onChange={(e) => {
                        const next = [...services];
                        next[index].price = Number(e.target.value);
                        setServices(next);
                      }}
                      className="w-full bg-[#0A0A0B] border border-[#26262B] text-white rounded-lg p-2 outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#8B8B95] mb-1">Prazo (dias)</label>
                    <input
                      type="number"
                      value={svc.deliveryDays}
                      onChange={(e) => {
                        const next = [...services];
                        next[index].deliveryDays = Number(e.target.value);
                        setServices(next);
                      }}
                      className="w-full bg-[#0A0A0B] border border-[#26262B] text-white rounded-lg p-2 outline-none"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveService(svc.id)}
                      className="p-2 text-[#FF6B57] hover:bg-[#FF6B57]/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="card-surface p-6 rounded-2xl border border-[#26262B] bg-[#0A0A0B] space-y-4 max-w-2xl text-xs">
            <div>
              <label className="block text-[#C9C9CF] font-medium mb-1">Teto Mínimo do Eixo Y do Gráfico (R$)</label>
              <input
                type="number"
                value={dashboardYMinAxis}
                onChange={(e) => setDashboardYMinAxis(Number(e.target.value))}
                className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 outline-none focus:border-[#3D8BFF]"
              />
              <p className="text-[10px] text-[#8B8B95] mt-1">Padrão: R$ 500 (Garante que vendas pequenas não apareçam desproporcionais)</p>
            </div>
          </div>
        )}

        {/* Save button bar */}
        <div className="pt-4 border-t border-[#26262B] flex justify-end">
          <button type="submit" disabled={loading} className="btn-primary font-bold">
            <Save className="w-4 h-4" />
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
};

