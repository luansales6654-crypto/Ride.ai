import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../database/firebase';
import { UserProfile, Sale, Lead, Proposal, UserProduct, AppNotification } from '../types';
import { RevenueChart } from '../components/charts/RevenueChart';
import { RegisterSaleModal } from '../components/ui/RegisterSaleModal';
import { formatBRL, formatDateBR, formatDateTimeBR } from '../utils/formatters';
import { buildWhatsAppUrl } from '../utils/whatsapp';
import {
  DollarSign,
  Search,
  Users,
  FileText,
  Wand2,
  Grid,
  Layers,
  Calendar,
  MessageSquare,
  Clock,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { currentUser, profile } = useOutletContext<{ currentUser: any; profile: UserProfile }>();
  const navigate = useNavigate();

  const [selectedPeriod, setSelectedPeriod] = useState<'today' | '7days' | '30days'>('7days');
  const [sales, setSales] = useState<Sale[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [products, setProducts] = useState<UserProduct[]>([]);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  // Real-time listener for sales collection per rule 8.3
  useEffect(() => {
    if (!currentUser?.uid) return;

    const salesRef = collection(db, 'users', currentUser.uid, 'sales');
    const q = query(salesRef, orderBy('createdAt', 'desc'));

    const unsub = onSnapshot(q, (snapshot) => {
      const docs: Sale[] = [];
      snapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() } as Sale);
      });
      setSales(docs);
    }, (err) => {
      console.warn('Erro ao escutar coleção sales:', err);
    });

    return () => unsub();
  }, [currentUser?.uid]);

  // Real-time listener for leads
  useEffect(() => {
    if (!currentUser?.uid) return;
    const leadsRef = collection(db, 'users', currentUser.uid, 'leads');
    const unsub = onSnapshot(leadsRef, (snapshot) => {
      const docs: Lead[] = [];
      snapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() } as Lead);
      });
      setLeads(docs);
    });
    return () => unsub();
  }, [currentUser?.uid]);

  // Real-time listener for proposals
  useEffect(() => {
    if (!currentUser?.uid) return;
    const propRef = collection(db, 'users', currentUser.uid, 'proposals');
    const unsub = onSnapshot(propRef, (snapshot) => {
      const docs: Proposal[] = [];
      snapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() } as Proposal);
      });
      setProposals(docs);
    });
    return () => unsub();
  }, [currentUser?.uid]);

  const firstName = profile?.name?.split(' ')[0] || currentUser?.email?.split('@')[0] || 'Usuário';

  const todayStr = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  // Filter confirmed sales for calculation
  const confirmedSales = sales.filter((s) => s.status === 'confirmada');
  const siteSales = confirmedSales.filter((s) => s.source === 'site');
  const ecommerceSales = confirmedSales.filter((s) => s.source === 'ecommerce');

  const totalRevenue = confirmedSales.reduce((acc, curr) => acc + curr.amount, 0);
  const siteRevenue = siteSales.reduce((acc, curr) => acc + curr.amount, 0);
  const ecommerceRevenue = ecommerceSales.reduce((acc, curr) => acc + curr.amount, 0);
  const ticketMedio = confirmedSales.length > 0 ? totalRevenue / confirmedSales.length : 0;

  // Filter follow-ups for today or delayed
  const now = new Date();
  const followUpLeads = leads.filter((l) => {
    if (!l.followUpAt) return false;
    const fDate = new Date(l.followUpAt);
    return fDate <= now;
  });

  return (
    <div className="space-y-8">
      {/* 8.1 Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-sora text-2xl sm:text-3xl font-extrabold text-white">
            Olá, {firstName}
          </h1>
          <p className="text-xs text-[#8B8B95] mt-1 capitalize">{todayStr}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setRegisterModalOpen(true)}
            className="btn-primary text-xs font-bold"
          >
            <DollarSign className="w-4 h-4" />
            Registrar Venda
          </button>
          <button
            onClick={() => navigate('/app/prospeccao')}
            className="btn-secondary text-xs font-semibold"
          >
            <Search className="w-4 h-4" />
            Buscar Empresas
          </button>
        </div>
      </div>

      {/* 8.2 Three Period Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { id: 'today', label: 'HOJE', periodText: 'Hoje (00:00 até agora)' },
          { id: '7days', label: 'ÚLTIMOS 7 DIAS', periodText: 'Hoje + 6 dias anteriores' },
          { id: '30days', label: 'ÚLTIMOS 30 DIAS', periodText: 'Hoje + 29 dias anteriores' },
        ].map((card) => {
          const isSelected = selectedPeriod === card.id;
          return (
            <div
              key={card.id}
              onClick={() => setSelectedPeriod(card.id as any)}
              className={`card-surface p-5 rounded-2xl cursor-pointer transition-all border ${
                isSelected
                  ? 'border-[#3D8BFF] bg-[#0A1F4D]/20 shadow-[0_0_20px_rgba(23,105,255,0.25)]'
                  : 'border-[#26262B] hover:border-[#3D8BFF]/40'
              }`}
            >
              <span className="text-[10px] font-bold text-[#8B8B95] tracking-wider uppercase block mb-1">
                {card.label}
              </span>
              <p className="text-xs text-[#5E5E68] mb-3">{card.periodText}</p>

              <div className="flex items-baseline justify-between">
                <span className="font-sora text-xl sm:text-2xl font-bold text-white tabular-nums">
                  {formatBRL(totalRevenue)}
                </span>
                <span className="text-xs font-semibold text-[#3D8BFF]">
                  {confirmedSales.length} {confirmedSales.length === 1 ? 'venda' : 'vendas'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 8.3 Revenue Chart (Central Piece) */}
      <RevenueChart sales={sales} selectedPeriod={selectedPeriod} />

      {/* 8.5 Secondary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-surface p-4 rounded-xl border border-[#26262B]">
          <span className="text-[10px] text-[#8B8B95] font-semibold block">Faturado com Sites</span>
          <p className="font-sora text-lg font-bold text-white mt-1 tabular-nums">
            {formatBRL(siteRevenue)}
          </p>
        </div>
        <div className="card-surface p-4 rounded-xl border border-[#26262B]">
          <span className="text-[10px] text-[#8B8B95] font-semibold block">Faturado E-commerce</span>
          <p className="font-sora text-lg font-bold text-white mt-1 tabular-nums">
            {formatBRL(ecommerceRevenue)}
          </p>
        </div>
        <div className="card-surface p-4 rounded-xl border border-[#26262B]">
          <span className="text-[10px] text-[#8B8B95] font-semibold block">Ticket Médio</span>
          <p className="font-sora text-lg font-bold text-[#3D8BFF] mt-1 tabular-nums">
            {formatBRL(ticketMedio)}
          </p>
        </div>
        <div className="card-surface p-4 rounded-xl border border-[#26262B]">
          <span className="text-[10px] text-[#8B8B95] font-semibold block">Nº de Vendas</span>
          <p className="font-sora text-lg font-bold text-[#2FBF71] mt-1 tabular-nums">
            {confirmedSales.length}
          </p>
        </div>
      </div>

      {/* Counter metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#0A0A0B] p-4 rounded-xl border border-[#26262B] flex items-center gap-3">
          <Users className="w-5 h-5 text-[#3D8BFF]" />
          <div>
            <span className="text-[10px] text-[#8B8B95] block">Leads no CRM</span>
            <span className="font-sora text-base font-bold text-white">{leads.length}</span>
          </div>
        </div>
        <div className="bg-[#0A0A0B] p-4 rounded-xl border border-[#26262B] flex items-center gap-3">
          <FileText className="w-5 h-5 text-[#3D8BFF]" />
          <div>
            <span className="text-[10px] text-[#8B8B95] block">Propostas Enviadas</span>
            <span className="font-sora text-base font-bold text-white">
              {proposals.filter((p) => p.status === 'enviada' || p.status === 'aceita').length}
            </span>
          </div>
        </div>
        <div className="bg-[#0A0A0B] p-4 rounded-xl border border-[#26262B] flex items-center gap-3">
          <Grid className="w-5 h-5 text-[#3D8BFF]" />
          <div>
            <span className="text-[10px] text-[#8B8B95] block">Produtos</span>
            <span className="font-sora text-base font-bold text-white">{products.length}</span>
          </div>
        </div>
        <div className="bg-[#0A0A0B] p-4 rounded-xl border border-[#26262B] flex items-center gap-3">
          <Layers className="w-5 h-5 text-[#3D8BFF]" />
          <div>
            <span className="text-[10px] text-[#8B8B95] block">Integrações Conectadas</span>
            <span className="font-sora text-base font-bold text-white">0</span>
          </div>
        </div>
      </div>

      {/* 8.6 Bottom Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Follow-ups */}
        <div className="card-surface p-6 rounded-2xl border border-[#26262B]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#3D8BFF]" />
              <h3 className="font-sora text-base font-bold text-white">Follow-ups de Hoje / Atrasados</h3>
            </div>
            <span className="text-xs text-[#8B8B95] font-semibold">{followUpLeads.length} pendentes</span>
          </div>

          {followUpLeads.length === 0 ? (
            <p className="text-xs text-[#8B8B95] py-6 text-center border border-dashed border-[#26262B] rounded-xl">
              Nenhum lembrete de follow-up pendente para hoje.
            </p>
          ) : (
            <div className="space-y-3">
              {followUpLeads.map((lead) => {
                const waRes = buildWhatsAppUrl(
                  lead.phone || '',
                  `Olá ${lead.companyName}, gostaria de dar continuidade à nossa conversa.`
                );

                return (
                  <div
                    key={lead.id}
                    className="bg-[#18181B] p-3.5 rounded-xl border border-[#26262B] flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-sora text-xs font-bold text-white">{lead.companyName}</h4>
                      <p className="text-[10px] text-[#8B8B95]">{lead.category} • {lead.city}/{lead.state}</p>
                    </div>

                    <a
                      href={waRes.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary h-8 px-3 text-[11px] font-semibold"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Abrir WhatsApp
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card-surface p-6 rounded-2xl border border-[#26262B]">
          <h3 className="font-sora text-base font-bold text-white mb-4">Ações Rápidas</h3>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/app/prospeccao')}
              className="p-3.5 bg-[#18181B] hover:bg-[#26262B] border border-[#26262B] rounded-xl text-left text-xs font-medium text-white flex items-center gap-2.5 transition-all group"
            >
              <Search className="w-4 h-4 text-[#3D8BFF] group-hover:scale-110 transition-transform" />
              <span>Buscar Empresas</span>
            </button>

            <button
              onClick={() => navigate('/app/propostas')}
              className="p-3.5 bg-[#18181B] hover:bg-[#26262B] border border-[#26262B] rounded-xl text-left text-xs font-medium text-white flex items-center gap-2.5 transition-all group"
            >
              <FileText className="w-4 h-4 text-[#3D8BFF] group-hover:scale-110 transition-transform" />
              <span>Nova Proposta</span>
            </button>

            <button
              onClick={() => navigate('/app/criador-de-sites')}
              className="p-3.5 bg-[#18181B] hover:bg-[#26262B] border border-[#26262B] rounded-xl text-left text-xs font-medium text-white flex items-center gap-2.5 transition-all group"
            >
              <Wand2 className="w-4 h-4 text-[#3D8BFF] group-hover:scale-110 transition-transform" />
              <span>Criar Site</span>
            </button>

            <button
              onClick={() => navigate('/app/catalogo')}
              className="p-3.5 bg-[#18181B] hover:bg-[#26262B] border border-[#26262B] rounded-xl text-left text-xs font-medium text-white flex items-center gap-2.5 transition-all group"
            >
              <Grid className="w-4 h-4 text-[#3D8BFF] group-hover:scale-110 transition-transform" />
              <span>Abrir Catálogo</span>
            </button>

            <button
              onClick={() => navigate('/app/integracoes')}
              className="p-3.5 bg-[#18181B] hover:bg-[#26262B] border border-[#26262B] rounded-xl text-left text-xs font-medium text-white flex items-center gap-2.5 transition-all group"
            >
              <Layers className="w-4 h-4 text-[#3D8BFF] group-hover:scale-110 transition-transform" />
              <span>Conectar Marketplace</span>
            </button>

            <button
              onClick={() => setRegisterModalOpen(true)}
              className="p-3.5 bg-[#1769FF]/15 border border-[#3D8BFF]/40 rounded-xl text-left text-xs font-bold text-[#8DBBFF] flex items-center gap-2.5 transition-all group"
            >
              <DollarSign className="w-4 h-4 text-[#3D8BFF] group-hover:scale-110 transition-transform" />
              <span>Registrar Venda</span>
            </button>
          </div>
        </div>
      </div>

      {/* Register Sale Modal */}
      <RegisterSaleModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        userId={currentUser.uid}
      />
    </div>
  );
};
