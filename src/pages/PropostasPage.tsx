import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../database/firebase';
import { Proposal, ProposalStatus } from '../types';
import { Modal } from '../components/ui/Modal';
import { RegisterSaleModal } from '../components/ui/RegisterSaleModal';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../components/ui/Toast';
import { formatBRL, formatDateBR } from '../utils/formatters';
import { buildWhatsAppUrl } from '../utils/whatsapp';
import {
  FileText,
  Plus,
  Wand2,
  Share2,
  Printer,
  MessageSquare,
  CheckCircle,
  Clock,
  DollarSign,
  Copy,
  ExternalLink,
} from 'lucide-react';

export const PropostasPage: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [newModalOpen, setNewModalOpen] = useState(false);

  // New proposal form fields
  const [companyName, setCompanyName] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [service, setService] = useState('Site Institucional Completo');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(1500);
  const [deliveryDays, setDeliveryDays] = useState(5);
  const [loading, setLoading] = useState(false);

  // Proposal detail/preview state
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Register sale modal
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [saleProposal, setSaleProposal] = useState<Proposal | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const propRef = collection(db, 'users', user.uid, 'proposals');
    const q = query(propRef, orderBy('createdAt', 'desc'));

    const unsub = onSnapshot(q, (snapshot) => {
      const docs: Proposal[] = [];
      snapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() } as Proposal);
      });
      setProposals(docs);
    });

    return () => unsub();
  }, []);

  const handleGenerateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      showToast({ type: 'error', title: 'Informe o nome da empresa' });
      return;
    }

    setLoading(true);

    try {
      // Call AI to structure proposal
      const res = await fetch('/api/ai/proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          category,
          city,
          service,
          description,
          price,
          deliveryDays,
        }),
      });

      const json = await res.json();
      const aiData = json.data || {};

      const token = Math.random().toString(36).substring(2, 12);
      const nowStr = new Date().toISOString();

      const newProp: Omit<Proposal, 'id'> = {
        companyName: companyName.trim(),
        service,
        description: aiData.problemIdentified || description || 'Criação de presença digital de alta conversão.',
        scope: ['Design Exclusivo', 'Botão WhatsApp', 'SEO Local', 'Hospedagem e Domínio'],
        deliverables: aiData.deliverables || ['Site responsivo', 'Painel de edição', 'Treinamento de uso'],
        benefits: aiData.benefits || ['Mais agendamentos e contatos', 'Posicionamento profissional no Google'],
        nextSteps: aiData.nextSteps || ['Aprovação da proposta', 'Coleta do briefing', 'Entrega em até 5 dias'],
        deliveryDays,
        price,
        paymentConditions: aiData.paymentConditions || '50% de entrada e 50% na entrega',
        contactName: 'Atendimento RIDE.IA',
        contactPhone: '(11) 99999-9999',
        status: 'rascunho',
        theme: 'dark',
        version: 1,
        publicToken: token,
        viewsCount: 0,
        createdAt: nowStr,
        updatedAt: nowStr,
      };

      const user = auth.currentUser;
      if (user) {
        // Save user proposal
        await addDoc(collection(db, 'users', user.uid, 'proposals'), newProp);

        // Also save public snapshot in publicProposals/{token}
        const publicSnap = {
          token,
          companyName: newProp.companyName,
          service: newProp.service,
          description: newProp.description,
          deliverables: newProp.deliverables,
          benefits: newProp.benefits,
          price: newProp.price,
          deliveryDays: newProp.deliveryDays,
          paymentConditions: newProp.paymentConditions,
          contactPhone: newProp.contactPhone,
          createdAt: nowStr,
          viewsCount: 0,
        };
        await addDoc(collection(db, 'publicProposals'), publicSnap);
      }

      showToast({ type: 'success', title: 'Proposta gerada com sucesso!' });
      setNewModalOpen(false);
    } catch (err: any) {
      showToast({ type: 'error', title: 'Erro ao gerar proposta', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptProposal = async (proposal: Proposal) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const propRef = doc(db, 'users', user.uid, 'proposals', proposal.id);
      await updateDoc(propRef, {
        status: 'aceita',
        acceptedAt: new Date().toISOString(),
      });

      showToast({ type: 'success', title: 'Proposta marcada como Aceita!' });
      setSaleProposal(proposal);
      setSaleModalOpen(true);
    } catch (err: any) {
      showToast({ type: 'error', title: 'Erro ao atualizar proposta' });
    }
  };

  const filteredProposals = proposals.filter((p) => {
    if (filterStatus === 'all') return true;
    return p.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-sora text-xl font-bold text-white">Propostas Comerciais</h2>
          <p className="text-xs text-[#8B8B95] mt-1">Gere propostas irresistíveis com IA e link público</p>
        </div>

        <button
          onClick={() => setNewModalOpen(true)}
          className="btn-primary text-xs font-semibold"
        >
          <Plus className="w-4 h-4" /> Nova Proposta com IA
        </button>
      </div>

      {/* Proposals Grid */}
      {filteredProposals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProposals.map((prop) => {
            const publicUrl = `${window.location.origin}/p/${prop.publicToken}`;
            const waRes = buildWhatsAppUrl(
              prop.contactPhone,
              `Olá! Preparei uma proposta comercial para ${prop.companyName}: ${publicUrl}`
            );

            return (
              <div
                key={prop.id}
                className="card-surface p-5 rounded-2xl border border-[#26262B] flex flex-col justify-between space-y-4 hover:border-[#3D8BFF]/40 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-sora font-bold text-sm text-white">{prop.companyName}</h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        prop.status === 'aceita'
                          ? 'bg-[#2FBF71]/15 text-[#2FBF71] border border-[#2FBF71]/30'
                          : prop.status === 'enviada'
                          ? 'bg-[#1769FF]/15 text-[#8DBBFF] border border-[#3D8BFF]/30'
                          : 'bg-[#18181B] text-[#8B8B95] border border-[#26262B]'
                      }`}
                    >
                      {prop.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#3D8BFF] font-semibold mb-1">{prop.service}</p>
                  <p className="text-xs text-[#8B8B95] line-clamp-2">{prop.description}</p>

                  <div className="mt-4 pt-3 border-t border-[#26262B] flex items-center justify-between">
                    <span className="font-sora text-base font-extrabold text-white">
                      {formatBRL(prop.price)}
                    </span>
                    <span className="text-[11px] text-[#8B8B95]">Prazo: {prop.deliveryDays} dias</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-2 border-t border-[#26262B]">
                  <button
                    onClick={() => setSelectedProposal(prop)}
                    className="btn-secondary h-8 px-3 text-[11px] flex-1"
                  >
                    <FileText className="w-3.5 h-3.5" /> Ver Proposta
                  </button>

                  {prop.status !== 'aceita' && (
                    <button
                      onClick={() => handleAcceptProposal(prop)}
                      className="btn-ghost h-8 px-2 text-[11px] text-[#2FBF71]"
                    >
                      Marcar Aceita
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="Nenhuma proposta criada"
          description="Clique em 'Nova Proposta com IA' para redigir uma proposta comercial personalizada e profissional em poucos segundos."
          actionText="Nova Proposta"
          onAction={() => setNewModalOpen(true)}
        />
      )}

      {/* New Proposal Modal */}
      <Modal
        isOpen={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        title="Gerar Proposta Comercial com IA"
        description="Preencha os dados do cliente e deixe a IA formular a proposta"
      >
        <form onSubmit={handleGenerateProposal} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#C9C9CF] font-medium mb-1">Nome da Empresa *</label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Ex: Barbearia Silva"
              className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 outline-none focus:border-[#3D8BFF]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#C9C9CF] font-medium mb-1">Categoria / Segmento</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: Barbearia"
                className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 outline-none focus:border-[#3D8BFF]"
              />
            </div>

            <div>
              <label className="block text-[#C9C9CF] font-medium mb-1">Cidade / Estado</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex: São Paulo / SP"
                className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 outline-none focus:border-[#3D8BFF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#C9C9CF] font-medium mb-1">Serviço Oferecido</label>
            <input
              type="text"
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 outline-none focus:border-[#3D8BFF]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#C9C9CF] font-medium mb-1">Investimento (R$)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 outline-none focus:border-[#3D8BFF]"
              />
            </div>

            <div>
              <label className="block text-[#C9C9CF] font-medium mb-1">Prazo de Entrega (dias)</label>
              <input
                type="number"
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(Number(e.target.value))}
                className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 outline-none focus:border-[#3D8BFF]"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-[#26262B]">
            <button type="button" onClick={() => setNewModalOpen(false)} className="btn-ghost">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              <Wand2 className="w-4 h-4" />
              {loading ? 'Gerando com IA...' : 'Gerar Proposta'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Selected Proposal Preview Modal */}
      {selectedProposal && (
        <Modal
          isOpen={Boolean(selectedProposal)}
          onClose={() => setSelectedProposal(null)}
          title={`Proposta — ${selectedProposal.companyName}`}
          maxWidth="4xl"
        >
          <div className="space-y-6 text-xs">
            {/* Theme switcher */}
            <div className="flex items-center justify-between pb-3 border-b border-[#26262B]">
              <span className="text-[#8B8B95]">Tema do Documento:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setTheme('dark')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    theme === 'dark' ? 'bg-[#1769FF] text-white' : 'bg-[#18181B] text-[#8B8B95]'
                  }`}
                >
                  Escuro (RIDE.IA)
                </button>
                <button
                  onClick={() => setTheme('light')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    theme === 'light' ? 'bg-white text-black' : 'bg-[#18181B] text-[#8B8B95]'
                  }`}
                >
                  Claro (Impressão)
                </button>
              </div>
            </div>

            {/* Document body */}
            <div
              className={`p-8 rounded-2xl border transition-all ${
                theme === 'dark'
                  ? 'bg-[#000000] border-[#26262B] text-white'
                  : 'bg-white border-gray-300 text-slate-900'
              }`}
            >
              <div className="border-b pb-6 mb-6 flex justify-between items-center">
                <div>
                  <h1 className="font-sora text-2xl font-bold">Proposta Comercial</h1>
                  <p className={theme === 'dark' ? 'text-[#8B8B95]' : 'text-slate-600'}>
                    Para: {selectedProposal.companyName}
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#3D8BFF]">Feito com RIDE.IA</span>
              </div>

              <div className="space-y-6 text-xs leading-relaxed">
                <div>
                  <h3 className="font-sora text-sm font-bold mb-2">1. Diagnóstico e Solução</h3>
                  <p>{selectedProposal.description}</p>
                </div>

                <div>
                  <h3 className="font-sora text-sm font-bold mb-2">2. Entregáveis do Projeto</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedProposal.deliverables?.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-sora text-sm font-bold mb-2">3. Investimento e Prazos</h3>
                  <p className="font-sora text-xl font-bold text-[#3D8BFF] my-1">
                    {formatBRL(selectedProposal.price)}
                  </p>
                  <p>Prazo estimado: {selectedProposal.deliveryDays} dias úteis</p>
                  <p>Condições: {selectedProposal.paymentConditions}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#26262B]">
              <button onClick={() => window.print()} className="btn-secondary">
                <Printer className="w-4 h-4" /> Imprimir / Salvar PDF
              </button>

              <button
                onClick={() => {
                  const url = `${window.location.origin}/p/${selectedProposal.publicToken}`;
                  navigator.clipboard.writeText(url);
                  showToast({ type: 'success', title: 'Link público copiado!' });
                }}
                className="btn-primary"
              >
                <Copy className="w-4 h-4" /> Copiar Link Público
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Sale modal when proposal accepted */}
      {saleProposal && (
        <RegisterSaleModal
          isOpen={saleModalOpen}
          onClose={() => {
            setSaleModalOpen(false);
            setSaleProposal(null);
          }}
          userId={auth.currentUser?.uid || ''}
          initialData={{
            proposalId: saleProposal.id,
            customerName: saleProposal.companyName,
            description: `Proposta Aceita - ${saleProposal.service}`,
            amount: saleProposal.price,
            source: 'site',
          }}
        />
      )}
    </div>
  );
};
