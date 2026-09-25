import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../database/firebase';
import { Logo } from '../../components/ui/Logo';
import { ArrowRight, Building2, Phone, Target, Check } from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [agencyName, setAgencyName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [focus, setFocus] = useState<'sites' | 'ecommerce' | 'both'>('both');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFinish = async () => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/app');
      return;
    }

    setLoading(true);

    try {
      const userRef = doc(db, 'users', user.uid, 'profile', 'data');
      await updateDoc(userRef, {
        agencyName: agencyName.trim() || 'Minha Agência RIDE.IA',
        whatsapp: whatsapp.trim(),
        focus,
        updatedAt: new Date().toISOString(),
      });

      navigate('/app');
    } catch (err) {
      console.error('Erro ao concluir onboarding:', err);
      navigate('/app');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between mb-8">
          <Logo variant="full" size="md" />
          <button
            onClick={() => navigate('/app')}
            className="text-xs text-[#8B8B95] hover:text-white"
          >
            Pular Onboarding
          </button>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-between mb-6 gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full transition-all ${
                s <= step ? 'bg-[#1769FF]' : 'bg-[#26262B]'
              }`}
            />
          ))}
        </div>

        <div className="card-surface p-6 sm:p-8 rounded-2xl border border-[#26262B] bg-[#0A0A0B]">
          {step === 1 && (
            <div className="space-y-4 text-xs">
              <div className="w-10 h-10 rounded-xl bg-[#0D347A]/30 border border-[#3D8BFF]/30 flex items-center justify-center text-[#3D8BFF] mb-2">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-sora text-lg font-bold text-white">Nome da sua Agência ou Negócio</h3>
              <p className="text-[#8B8B95]">Este nome aparecerá na assinatura das suas propostas e prospecções.</p>

              <div>
                <label className="block text-[#C9C9CF] font-medium mb-1">Nome da Agência / Remetente</label>
                <input
                  type="text"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  placeholder="Ex: Agência RIDE Digital"
                  className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-3 outline-none focus:border-[#3D8BFF]"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="btn-primary text-xs font-semibold"
                >
                  Continuar <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 text-xs">
              <div className="w-10 h-10 rounded-xl bg-[#0D347A]/30 border border-[#3D8BFF]/30 flex items-center justify-center text-[#3D8BFF] mb-2">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="font-sora text-lg font-bold text-white">Seu WhatsApp de Atendimento</h3>
              <p className="text-[#8B8B95]">Usado nos links de fechamento de propostas para que os clientes te chamem direto.</p>

              <div>
                <label className="block text-[#C9C9CF] font-medium mb-1">Número do WhatsApp (DDD + Número)</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-3 outline-none focus:border-[#3D8BFF]"
                />
              </div>

              <div className="pt-4 flex justify-between">
                <button onClick={() => setStep(1)} className="btn-ghost">
                  Voltar
                </button>
                <button onClick={() => setStep(3)} className="btn-primary">
                  Continuar <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 text-xs">
              <div className="w-10 h-10 rounded-xl bg-[#0D347A]/30 border border-[#3D8BFF]/30 flex items-center justify-center text-[#3D8BFF] mb-2">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-sora text-lg font-bold text-white">Qual é o seu Foco Principal?</h3>
              <p className="text-[#8B8B95]">Você pode alterar e acessar todas as ferramentas a qualquer momento.</p>

              <div className="space-y-2.5">
                {[
                  { id: 'sites', title: 'Venda de Sites & Serviços', desc: 'Prospecção no Google Maps, propostas e criação de sites' },
                  { id: 'ecommerce', title: 'E-commerce & Marketplaces', desc: 'Catálogo de produtos, Mercado Livre e gestão de pedidos' },
                  { id: 'both', title: 'Ambos (Plataforma Completa)', desc: 'Acesso simultâneo aos dois grandes módulos' },
                ].map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setFocus(opt.id as any)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      focus === opt.id
                        ? 'bg-[#1769FF]/12 border-[#3D8BFF] text-white shadow-[0_0_15px_rgba(23,105,255,0.2)]'
                        : 'bg-[#18181B] border-[#26262B] text-[#C9C9CF] hover:border-[#3D8BFF]/30'
                    }`}
                  >
                    <div>
                      <h4 className="font-sora font-bold text-xs">{opt.title}</h4>
                      <p className="text-[11px] text-[#8B8B95]">{opt.desc}</p>
                    </div>
                    {focus === opt.id && <Check className="w-4 h-4 text-[#3D8BFF] shrink-0" />}
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-between">
                <button onClick={() => setStep(2)} className="btn-ghost">
                  Voltar
                </button>
                <button onClick={handleFinish} disabled={loading} className="btn-primary">
                  {loading ? 'Concluindo...' : 'Acessar RIDE.IA'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
