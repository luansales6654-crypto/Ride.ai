import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../database/firebase';
import { PublicProposalView } from '../types';
import { Logo } from '../components/ui/Logo';
import { formatBRL, formatDateBR } from '../utils/formatters';
import { buildWhatsAppUrl } from '../utils/whatsapp';
import { CheckCircle, MessageSquare, ShieldCheck, Clock } from 'lucide-react';

export const ProposalPublicPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [proposal, setProposal] = useState<PublicProposalView | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchPublicProposal = async () => {
      try {
        const q = query(collection(db, 'publicProposals'), where('token', '==', token));
        const snap = await getDocs(q);

        if (snap.empty) {
          setNotFound(true);
        } else {
          const docSnap = snap.docs[0];
          const data = docSnap.data() as PublicProposalView;
          setProposal(data);

          // Increment view counter
          await updateDoc(doc(db, 'publicProposals', docSnap.id), {
            viewsCount: (data.viewsCount || 0) + 1,
          });
        }
      } catch (err) {
        console.error('Erro ao buscar proposta pública:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProposal();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] text-white flex items-center justify-center p-4 font-['Inter',sans-serif]">
        <p className="font-sora text-sm animate-pulse text-[#3D8BFF]">Carregando proposta comercial...</p>
      </div>
    );
  }

  if (notFound || !proposal) {
    return (
      <div className="min-h-screen bg-[#000000] text-white flex flex-col items-center justify-center p-4 font-['Inter',sans-serif]">
        <Logo variant="full" size="md" className="mb-6" />
        <h2 className="font-sora text-xl font-bold text-white mb-2">Proposta não encontrada ou expirada</h2>
        <p className="text-xs text-[#8B8B95] text-center max-w-sm">
          Este link público de proposta é inválido ou foi revogado pelo remetente.
        </p>
      </div>
    );
  }

  const waRes = buildWhatsAppUrl(
    proposal.contactPhone || '',
    `Olá! Quero aprovar e seguir com a proposta comercial para ${proposal.companyName}.`
  );

  return (
    <div className="min-h-screen bg-[#000000] text-white p-4 sm:p-8 lg:p-12 font-['Inter',sans-serif] selection:bg-[#1769FF]">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Branding */}
        <div className="flex items-center justify-between border-b border-[#26262B] pb-6">
          <Logo variant="full" size="md" />
          <span className="text-xs text-[#8B8B95] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#3D8BFF]" /> Documento Verificado
          </span>
        </div>

        {/* Document Card */}
        <div className="card-surface p-6 sm:p-10 rounded-2xl border border-[#26262B] bg-[#0A0A0B] shadow-2xl space-y-8">
          <div>
            <span className="text-xs font-bold text-[#3D8BFF] uppercase tracking-wider block mb-1">
              PROPOSTA COMERCIAL
            </span>
            <h1 className="font-sora text-2xl sm:text-4xl font-extrabold text-white">
              {proposal.companyName}
            </h1>
            <p className="text-xs text-[#8B8B95] mt-2">
              Emitida em: {formatDateBR(proposal.createdAt)} • Serviço: <strong>{proposal.service}</strong>
            </p>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="font-sora text-base font-bold text-white">Diagnóstico e Escopo do Projeto</h3>
            <p className="text-xs text-[#C9C9CF] leading-relaxed bg-[#18181B] p-4 rounded-xl border border-[#26262B]">
              {proposal.description}
            </p>
          </div>

          {/* Deliverables */}
          <div className="space-y-3">
            <h3 className="font-sora text-base font-bold text-white">O que será entregue</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {proposal.deliverables?.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#18181B] p-3 rounded-xl border border-[#26262B] flex items-center gap-2.5 text-xs text-white"
                >
                  <CheckCircle className="w-4 h-4 text-[#3D8BFF] shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Investment box */}
          <div className="p-6 rounded-2xl bg-[#0D347A]/20 border border-[#3D8BFF]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-[0_0_30px_rgba(23,105,255,0.15)]">
            <div>
              <span className="text-xs text-[#8DBBFF] font-medium block">Investimento Total</span>
              <span className="font-sora text-3xl sm:text-4xl font-extrabold text-white tabular-nums">
                {formatBRL(proposal.price)}
              </span>
              <p className="text-xs text-[#8B8B95] mt-1">{proposal.paymentConditions}</p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-[#8DBBFF] font-medium block flex items-center gap-1 sm:justify-end">
                <Clock className="w-3.5 h-3.5" /> Prazo de Entrega
              </span>
              <span className="font-sora text-xl font-bold text-white">{proposal.deliveryDays} dias úteis</span>
            </div>
          </div>

          {/* Action CTA Button */}
          <div className="text-center pt-4 border-t border-[#26262B]">
            <a
              href={waRes.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary h-14 px-8 text-sm font-bold w-full sm:w-auto shadow-[0_0_25px_rgba(23,105,255,0.4)]"
            >
              <MessageSquare className="w-5 h-5 mr-2" /> Aprovar Proposta e Falar no WhatsApp
            </a>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-[#5E5E68]">
          © {new Date().getFullYear()} RIDE.IA — Plataforma SaaS de Venda de Sites e E-commerce.
        </footer>
      </div>
    </div>
  );
};
