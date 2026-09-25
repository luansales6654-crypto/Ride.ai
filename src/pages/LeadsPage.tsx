import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db, auth } from '../database/firebase';
import { Lead, LeadStatus, LeadInteraction } from '../types';
import { RegisterSaleModal } from '../components/ui/RegisterSaleModal';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../components/ui/Toast';
import { formatBRL, formatDateBR } from '../utils/formatters';
import { buildWhatsAppUrl } from '../utils/whatsapp';
import {
  Users,
  LayoutGrid,
  List,
  Search,
  Star,
  Phone,
  MessageSquare,
  FileText,
  DollarSign,
  Clock,
  ChevronRight,
  MoreVertical,
  Wand2,
  Calendar,
  MapPin,
  ExternalLink,
} from 'lucide-react';

const STATUS_COLUMNS: { id: LeadStatus; label: string; color: string }[] = [
  { id: 'novo', label: 'Novo', color: 'border-l-blue-500' },
  { id: 'contatado', label: 'Em contato', color: 'border-l-yellow-500' },
  { id: 'respondeu', label: 'Respondeu', color: 'border-l-indigo-500' },
  { id: 'proposta_enviada', label: 'Proposta enviada', color: 'border-l-purple-500' },
  { id: 'negociacao', label: 'Negociação', color: 'border-l-orange-500' },
  { id: 'cliente', label: 'Cliente', color: 'border-l-green-500' },
  { id: 'perdido', label: 'Perdido', color: 'border-l-red-500' },
];

export const LeadsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // AI Message Generator state inside Lead modal
  const [generatedMsg, setGeneratedMsg] = useState<{ curta: string; padrao: string; consultiva: string } | null>(null);
  const [generatingMsg, setGeneratingMsg] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<'curta' | 'padrao' | 'consultiva'>('padrao');

  // Register sale modal state
  const [saleModalOpen, setRegisterSaleModalOpen] = useState(false);
  const [saleModalLead, setSaleModalLead] = useState<Lead | null>(null);

  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const uid = user.uid;

    const leadsRef = collection(db, 'users', uid, 'leads');
    const q = query(leadsRef, orderBy('createdAt', 'desc'));

    const unsub = onSnapshot(q, (snapshot) => {
      const docs: Lead[] = [];
      snapshot.forEach((doc) => {
        const d = doc.data();
        docs.push({
          id: doc.id,
          ...d,
          companyName: d.companyName || d.nome || 'Empresa sem nome',
          category: d.category || d.categoria || 'Negócio Local',
          city: d.city || d.cidade || 'Não informado',
          state: d.state || d.estado || 'BR',
          phone: d.phone || d.telefone,
          website: d.website,
        } as Lead);
      });
      setLeads(docs);
    });

    return () => unsub();
  }, []);

  const handleUpdateStatus = async (leadId: string, newStatus: LeadStatus) => {
    const user = auth.currentUser;
    if (!user) return;
    const uid = user.uid;

    try {
      const leadRef = doc(db, 'users', uid, 'leads', leadId);
      const nowStr = new Date().toISOString();

      await updateDoc(leadRef, {
        status: newStatus,
        updatedAt: nowStr,
      });

      // Log interaction
      await addDoc(collection(db, 'users', uid, 'leadInteractions'), {
        leadId,
        type: 'status_change',
        text: `Status alterado para ${newStatus}`,
        createdAt: nowStr,
      });

      showToast({ type: 'success', title: 'Status atualizado com sucesso' });

      // Automation: if status changed to 'cliente', open Register Sale modal per rule 11
      if (newStatus === 'cliente') {
        const targetLead = leads.find((l) => l.id === leadId);
        if (targetLead) {
          setSaleModalLead(targetLead);
          setRegisterSaleModalOpen(true);
        }
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Erro ao atualizar status', message: err.message });
    }
  };

  const handleToggleFavorite = async (lead: Lead) => {
    const user = auth.currentUser;
    if (!user) return;
    const uid = user.uid;

    try {
      const leadRef = doc(db, 'users', uid, 'leads', lead.id);
      await updateDoc(leadRef, { isFavorite: !lead.isFavorite });
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleGenerateMessage = async (lead: Lead) => {
    setGeneratingMsg(true);
    setGeneratedMsg(null);

    try {
      const res = await fetch('/api/ai/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: lead.companyName,
          category: lead.category,
          city: lead.city,
          siteStatus: lead.siteStatus,
          rating: lead.companyData?.rating,
          userRatingsTotal: lead.companyData?.userRatingsTotal,
        }),
      });

      const json = await res.json();
      if (json.ok) {
        setGeneratedMsg(json.data);
      } else {
        showToast({ type: 'error', title: 'Erro ao gerar mensagem', message: json.error?.message });
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Erro na API de IA' });
    } finally {
      setGeneratingMsg(false);
    }
  };

  const filteredLeads = leads.filter((l) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      l.companyName.toLowerCase().includes(q) ||
      l.category.toLowerCase().includes(q) ||
      l.city.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8B8B95] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por empresa, categoria ou cidade..."
            className="w-full bg-[#0A0A0B] border border-[#26262B] text-white text-xs rounded-xl p-2.5 pl-9 outline-none focus:border-[#3D8BFF]"
          />
        </div>

        {/* View toggle */}
        <div className="bg-[#0A0A0B] p-1 rounded-xl border border-[#26262B] flex items-center self-start sm:self-auto">
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              viewMode === 'kanban'
                ? 'bg-[#1769FF] text-white shadow-[0_0_12px_rgba(23,105,255,0.4)]'
                : 'text-[#8B8B95] hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Kanban
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              viewMode === 'list'
                ? 'bg-[#1769FF] text-white shadow-[0_0_12px_rgba(23,105,255,0.4)]'
                : 'text-[#8B8B95] hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" /> Lista
          </button>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory">
          {STATUS_COLUMNS.map((col) => {
            const colLeads = filteredLeads.filter((l) => l.status === col.id);

            return (
              <div
                key={col.id}
                className="w-72 shrink-0 bg-[#0A0A0B] border border-[#26262B] rounded-2xl p-4 flex flex-col max-h-[75vh] snap-start"
              >
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#26262B]">
                  <h3 className="font-sora text-xs font-bold text-white flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.color.replace('border-l-', 'bg-')}`} />
                    {col.label}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#18181B] text-[#8B8B95]">
                    {colLeads.length}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {colLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="card-surface p-4 rounded-xl border border-[#26262B] hover:border-[#3D8BFF]/40 cursor-pointer transition-all space-y-2 group"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-sora font-bold text-xs text-white group-hover:text-[#3D8BFF] transition-colors leading-snug">
                          {lead.companyName}
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(lead);
                          }}
                          className="p-1 text-[#8B8B95] hover:text-[#F5A524]"
                        >
                          <Star className={`w-3.5 h-3.5 ${lead.isFavorite ? 'fill-[#F5A524] text-[#F5A524]' : ''}`} />
                        </button>
                      </div>

                      <p className="text-[11px] text-[#8B8B95]">
                        {lead.category} • {lead.city}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-[#26262B] text-[10px]">
                        <span className="text-[#8B8B95]">{formatDateBR(lead.createdAt)}</span>
                        {lead.phone && (
                          <span className="text-[#2FBF71] font-mono flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5" /> WhatsApp
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {colLeads.length === 0 && (
                    <div className="p-4 text-center text-[11px] text-[#5E5E68] border border-dashed border-[#26262B] rounded-xl">
                      Nenhum lead
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="card-surface rounded-2xl border border-[#26262B] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#C9C9CF]">
              <thead className="bg-[#18181B] text-[#8B8B95] uppercase font-sora text-[10px] tracking-wider border-b border-[#26262B]">
                <tr>
                  <th className="p-4">Empresa</th>
                  <th className="p-4">Categoria</th>
                  <th className="p-4">Cidade/UF</th>
                  <th className="p-4">Telefone</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26262B]">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[#18181B]/50 transition-colors">
                    <td className="p-4 font-sora font-bold text-white">{lead.companyName}</td>
                    <td className="p-4">{lead.category}</td>
                    <td className="p-4">{lead.city}/{lead.state}</td>
                    <td className="p-4 font-mono text-[11px]">{lead.phone || '-'}</td>
                    <td className="p-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleUpdateStatus(lead.id, e.target.value as any)}
                        className="bg-[#18181B] border border-[#26262B] text-white rounded-lg p-1.5 text-xs outline-none"
                      >
                        {STATUS_COLUMNS.map((c) => (
                          <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="btn-ghost h-8 px-3 text-xs text-[#3D8BFF]"
                      >
                        Abrir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State if no leads */}
      {leads.length === 0 && (
        <EmptyState
          icon={Users}
          title="Nenhum lead no seu CRM ainda"
          description="Acesse a área de Prospecção para encontrar empresas reais no Google Maps e salvá-las diretamente no seu funil de vendas."
          actionText="Ir para Prospecção"
          onAction={() => navigate('/app/prospeccao')}
        />
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <Modal
          isOpen={Boolean(selectedLead)}
          onClose={() => setSelectedLead(null)}
          title={selectedLead.companyName}
          description={`${selectedLead.category} • ${selectedLead.city}/${selectedLead.state}`}
          maxWidth="2xl"
        >
          <div className="space-y-6 text-xs">
            {/* Lead summary details */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-[#18181B] rounded-xl border border-[#26262B]">
              <div>
                <p className="text-[#8B8B95]">Telefone:</p>
                <p className="text-white font-mono font-bold">{selectedLead.phone || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-[#8B8B95]">Status no CRM:</p>
                <select
                  value={selectedLead.status}
                  onChange={(e) => {
                    handleUpdateStatus(selectedLead.id, e.target.value as any);
                    setSelectedLead({ ...selectedLead, status: e.target.value as any });
                  }}
                  className="bg-[#0A0A0B] border border-[#26262B] text-white rounded-lg p-1.5 mt-1 outline-none"
                >
                  {STATUS_COLUMNS.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Google Maps View Embed */}
            <div className="p-4 bg-[#18181B] rounded-xl border border-[#26262B] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8B8B95] font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#4285F4]" /> Mapa da Empresa no Google Maps
                </span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    selectedLead.companyName + ' ' + selectedLead.city + ' ' + selectedLead.state + ' Brasil'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#4285F4] hover:underline flex items-center gap-1 text-[11px]"
                >
                  Abrir no Google Maps <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="overflow-hidden rounded-xl border border-[#26262B] bg-[#0A0A0B] h-48 w-full">
                <iframe
                  title={`Google Map - ${selectedLead.companyName}`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                    selectedLead.companyName + ', ' + selectedLead.city + ' ' + selectedLead.state + ' Brasil'
                  )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                />
              </div>
            </div>

            {/* AI Generator Button inside Lead modal */}
            <div className="p-4 rounded-xl border border-[#3D8BFF]/30 bg-[#0D347A]/10 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-sora font-bold text-white flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-[#3D8BFF]" /> Gerar Mensagem de Abordagem com IA
                </h4>
                <button
                  onClick={() => handleGenerateMessage(selectedLead)}
                  disabled={generatingMsg}
                  className="btn-primary h-8 px-3 text-xs"
                >
                  {generatingMsg ? 'Gerando...' : 'Gerar Abordagem'}
                </button>
              </div>

              {generatedMsg && (
                <div className="space-y-3 pt-3 border-t border-[#26262B]">
                  <div className="flex gap-2">
                    {(['curta', 'padrao', 'consultiva'] as const).map((varKey) => (
                      <button
                        key={varKey}
                        onClick={() => setSelectedVariation(varKey)}
                        className={`px-3 py-1 rounded-lg font-semibold text-[11px] capitalize ${
                          selectedVariation === varKey
                            ? 'bg-[#1769FF] text-white'
                            : 'bg-[#18181B] text-[#8B8B95]'
                        }`}
                      >
                        {varKey}
                      </button>
                    ))}
                  </div>

                  <div className="p-3 bg-[#18181B] rounded-xl text-white font-mono leading-relaxed">
                    {generatedMsg[selectedVariation]}
                  </div>

                  {selectedLead.phone && (
                    <a
                      href={buildWhatsAppUrl(selectedLead.phone, generatedMsg[selectedVariation]).url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary h-9 px-4 text-xs font-bold inline-flex"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Abrir no WhatsApp
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Actions for this lead */}
            <div className="pt-4 flex flex-wrap gap-2 justify-end border-t border-[#26262B]">
              <button
                onClick={() => {
                  setSaleModalLead(selectedLead);
                  setRegisterSaleModalOpen(true);
                  setSelectedLead(null);
                }}
                className="btn-primary"
              >
                <DollarSign className="w-4 h-4" /> Marcar Cliente e Registrar Venda
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Register Sale Modal for Lead */}
      {saleModalLead && (
        <RegisterSaleModal
          isOpen={saleModalOpen}
          onClose={() => {
            setRegisterSaleModalOpen(false);
            setSaleModalLead(null);
          }}
          userId={auth.currentUser?.uid || ''}
          initialData={{
            leadId: saleModalLead.id,
            customerName: saleModalLead.companyName,
            source: 'site',
            amount: saleModalLead.estimatedValue || 1500,
          }}
        />
      )}
    </div>
  );
};
