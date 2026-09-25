import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs, query } from 'firebase/firestore';
import { db, auth } from '../database/firebase';
import { CompanyPlace } from '../types';
import { BRAZIL_STATES, fetchCitiesByUF, IBGECity } from '../database/ibge';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { buildWhatsAppUrl } from '../utils/whatsapp';
import {
  Search,
  MapPin,
  Building2,
  Globe,
  Phone,
  Star,
  UserPlus,
  MessageSquare,
  Wand2,
  ExternalLink,
  CheckCircle,
  Hash,
  Clock,
  Navigation,
} from 'lucide-react';

const CATEGORIES = [
  'Barbearias',
  'Dentistas',
  'Clínicas e Consultórios',
  'Restaurantes e Lanchonetes',
  'Academias e Fitness',
  'Salões de Beleza e Estética',
  'Oficinas Mecânicas e Autocenters',
  'Pet Shops e Veterinárias',
  'Imobiliárias e Corretores',
  'Padarias e Confeitarias',
  'Advogados e Escritórios',
  'Contadores',
  'Escolas e Cursos',
  'Lojas e Comércio Local',
  'Prestadores de Serviço',
  'Empresas locais em geral',
];

export const ProspeccaoPage: React.FC = () => {
  const [selectedState, setSelectedState] = useState('SP');
  const [cities, setCities] = useState<IBGECity[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [category, setCategory] = useState('Barbearias');
  const [customCategory, setCustomCategory] = useState('');
  const [nameQuery, setNameQuery] = useState('');
  const [pageSize, setPageSize] = useState(20);

  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState<CompanyPlace[]>([]);
  const [apiError, setApiError] = useState<{ code: string; message: string } | null>(null);

  // Modals
  const [selectedPlace, setSelectedPlace] = useState<CompanyPlace | null>(null);
  const [approachPlace, setApproachPlace] = useState<CompanyPlace | null>(null);
  const [generatingApproach, setGeneratingApproach] = useState(false);
  const [approachMessage, setApproachMessage] = useState<{ curta: string; padrao: string; consultiva: string } | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<'curta' | 'padrao' | 'consultiva'>('padrao');

  const [savedPlaceIds, setSavedPlaceIds] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Load IBGE cities when UF changes
  useEffect(() => {
    let isMounted = true;
    if (selectedState) {
      fetchCitiesByUF(selectedState).then((res) => {
        if (isMounted) {
          setCities(res);
          if (res.length > 0) setSelectedCity(res[0].nome);
        }
      });
    }
    return () => { isMounted = false; };
  }, [selectedState]);

  // Load existing saved leads to prevent duplicates
  useEffect(() => {
    const user = auth.currentUser;
    const uid = user ? user.uid : 'ride-demo-user';
    const leadsRef = collection(db, 'users', uid, 'leads');
    getDocs(leadsRef).then((snap) => {
      const ids = new Set<string>();
      snap.forEach((doc) => {
        const d = doc.data();
        if (d.place_id) ids.add(d.place_id);
        if (d.companyId) ids.add(d.companyId);
      });
      setSavedPlaceIds(ids);
    }).catch(() => {});
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setApiError(null);
    setPlaces([]);

    const activeCategory = category === 'Outro' ? customCategory : category;

    try {
      const res = await fetch('/api/places/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          segment: activeCategory,
          city: selectedCity,
          state: selectedState,
          neighborhood: neighborhood.trim(),
          nameQuery: nameQuery.trim(),
          pageSize,
        }),
      });

      const json = await res.json();

      if (!json.ok) {
        setApiError(json.error);
      } else {
        setPlaces(json.data || []);
      }
    } catch (err: any) {
      setApiError({
        code: 'NETWORK_ERROR',
        message: 'Erro ao comunicar com o servidor. Verifique sua conexão com a internet.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLead = async (place: CompanyPlace) => {
    const user = auth.currentUser;
    const uid = user ? user.uid : 'ride-demo-user';

    if (savedPlaceIds.has(place.placeId)) {
      showToast({ type: 'info', title: 'Empresa já salva nos seus leads!' });
      return;
    }

    try {
      const nowStr = new Date().toISOString();
      const newLead = {
        id: place.placeId,
        place_id: place.placeId,
        companyId: place.placeId,
        nome: place.name,
        companyName: place.name,
        categoria: place.category,
        category: place.category,
        endereco: place.address,
        address: place.address,
        cidade: place.city || selectedCity,
        city: place.city || selectedCity,
        estado: place.state || selectedState,
        state: place.state || selectedState,
        bairro: place.neighborhood || neighborhood || 'Não informado',
        telefone: place.phone || null,
        phone: place.phone || null,
        website: place.website || null,
        siteStatus: place.siteStatus || (place.website ? 'found' : 'none'),
        avaliacao: place.rating || null,
        quantidade_avaliacoes: place.userRatingsTotal || null,
        latitude: (place as any).latitude || null,
        longitude: (place as any).longitude || null,
        status: 'novo',
        data_da_busca: nowStr,
        createdAt: nowStr,
        updatedAt: nowStr,
        companyData: place,
      };

      await addDoc(collection(db, 'users', uid, 'leads'), newLead);
      setSavedPlaceIds((prev) => new Set(prev).add(place.placeId));

      showToast({
        type: 'success',
        title: 'Lead salvo com sucesso!',
        message: `${place.name} foi adicionado aos seus leads reais.`,
        actionText: 'Ver Leads',
        onAction: () => navigate('/app/leads'),
      });
    } catch (err: any) {
      showToast({ type: 'error', title: 'Erro ao salvar lead', message: err.message });
    }
  };

  const handleGenerateApproach = async (place: CompanyPlace) => {
    setApproachPlace(place);
    setGeneratingApproach(true);
    setApproachMessage(null);

    try {
      const res = await fetch('/api/ai/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: place.name,
          category: place.category,
          city: place.city || selectedCity,
          phone: place.phone,
          siteStatus: place.website ? 'found' : 'none',
          rating: place.rating,
          userRatingsTotal: place.userRatingsTotal,
        }),
      });

      const json = await res.json();
      if (json.ok) {
        setApproachMessage(json.data);
      } else {
        showToast({ type: 'error', title: 'Erro ao gerar abordagem', message: json.error?.message });
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Erro de conexão com a IA' });
    } finally {
      setGeneratingApproach(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Form: "Encontrar Leads" */}
      <div className="card-surface p-6 rounded-2xl border border-[#26262B] bg-[#0A0A0B]">
        <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-[#26262B]">
          <div>
            <h2 className="font-sora text-xl font-bold text-white flex items-center gap-2.5">
              <Search className="w-6 h-6 text-[#3D8BFF]" />
              Encontrar Leads Reais
            </h2>
            <p className="text-xs text-[#8B8B95] mt-1">
              Pesquise estabelecimentos reais diretamente no Google Maps por estado, cidade, bairro e categoria.
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
          {/* Estado */}
          <div>
            <label className="block text-[#C9C9CF] font-medium mb-1">Estado (UF)</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 outline-none focus:border-[#3D8BFF]"
            >
              {BRAZIL_STATES.map((st) => (
                <option key={st.sigla} value={st.sigla}>
                  {st.sigla} - {st.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Cidade */}
          <div>
            <label className="block text-[#C9C9CF] font-medium mb-1">Cidade</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 outline-none focus:border-[#3D8BFF]"
            >
              {cities.map((ct) => (
                <option key={ct.id} value={ct.nome}>
                  {ct.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Bairro */}
          <div>
            <label className="block text-[#C9C9CF] font-medium mb-1">Bairro (opcional)</label>
            <input
              type="text"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              placeholder="Ex: Centro, Moema..."
              className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 outline-none focus:border-[#3D8BFF]"
            />
          </div>

          {/* Nicho/Categoria */}
          <div>
            <label className="block text-[#C9C9CF] font-medium mb-1">Nicho / Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 outline-none focus:border-[#3D8BFF]"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="Outro">Outro nicho específico...</option>
            </select>
          </div>

          {/* Custom category if "Outro" selected */}
          {category === 'Outro' ? (
            <div>
              <label className="block text-[#C9C9CF] font-medium mb-1">Especifique o Nicho</label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Ex: Marmorarias, Lavanderias..."
                className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 outline-none focus:border-[#3D8BFF]"
              />
            </div>
          ) : (
            <div>
              <label className="block text-[#C9C9CF] font-medium mb-1">Nome do Negócio (opcional)</label>
              <input
                type="text"
                value={nameQuery}
                onChange={(e) => setNameQuery(e.target.value)}
                placeholder="Ex: Barbearia do Zé..."
                className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 outline-none focus:border-[#3D8BFF]"
              />
            </div>
          )}

          {/* Quantidade */}
          <div>
            <label className="block text-[#C9C9CF] font-medium mb-1">Quantidade</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 outline-none focus:border-[#3D8BFF]"
            >
              <option value={10}>10 empresas</option>
              <option value={20}>20 empresas</option>
              <option value={30}>30 empresas</option>
              <option value={50}>50 empresas</option>
            </select>
          </div>

          <div className="lg:col-span-6 pt-2 flex justify-end">
            <button type="submit" disabled={loading} className="btn-primary px-8 py-3 text-xs font-bold">
              <Search className="w-4 h-4" />
              {loading ? 'Consultando Google Places API...' : 'Buscar Empresas'}
            </button>
          </div>
        </form>
      </div>

      {/* Error state */}
      {apiError && (
        <ErrorState
          title={apiError.code === 'MISSING_API_KEY' ? 'Chave do Google Maps não configurada' : 'Erro ao consultar Google Maps'}
          reason={apiError.message}
          onRetry={() => handleSearch()}
        />
      )}

      {/* Loading state */}
      {loading && <LoadingState text="Consultando Google Places API em tempo real..." size="lg" />}

      {/* Results Cards List */}
      {!loading && !apiError && places.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs text-[#8B8B95]">
              Encontradas <strong>{places.length}</strong> empresas reais no Google Places em {selectedCity}/{selectedState}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {places.map((place) => {
              const isSaved = savedPlaceIds.has(place.placeId);
              const waRes = place.phone
                ? buildWhatsAppUrl(
                    place.phone,
                    `Olá! Vi seu perfil da ${place.category} no Google em ${place.city || selectedCity}.`
                  )
                : null;

              return (
                <div
                  key={place.placeId}
                  className="card-surface p-5 rounded-2xl border border-[#26262B] flex flex-col justify-between hover:border-[#3D8BFF]/40 transition-all space-y-4 bg-[#0A0A0B]"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-sora font-bold text-sm text-white leading-snug">{place.name}</h3>

                      {isSaved ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#2FBF71]/15 text-[#2FBF71] border border-[#2FBF71]/30 shrink-0 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Lead Salvo
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#3D8BFF]/10 text-[#8DBBFF] border border-[#3D8BFF]/30 shrink-0">
                          Novo Lead
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#3D8BFF] font-semibold flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      {place.category}
                    </p>

                    <p className="text-xs text-[#8B8B95] flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#8B8B95] shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{place.address}</span>
                    </p>

                    {place.website ? (
                      <p className="text-xs text-[#8DBBFF] flex items-center gap-1.5 truncate">
                        <Globe className="w-3.5 h-3.5 text-[#3D8BFF] shrink-0" />
                        <a href={place.website} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                          {place.website}
                        </a>
                      </p>
                    ) : (
                      <p className="text-xs text-[#5E5E68] italic flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 shrink-0" />
                        Website não cadastrado no Google
                      </p>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#C9C9CF] pt-2 border-t border-[#26262B]">
                      {place.phone ? (
                        <span className="flex items-center gap-1 font-mono text-[11px] text-white">
                          <Phone className="w-3 h-3 text-[#2FBF71]" />
                          {place.phone}
                        </span>
                      ) : (
                        <span className="text-[#5E5E68] italic text-[11px]">Telefone não informado</span>
                      )}

                      {place.rating ? (
                        <span className="flex items-center gap-1 text-[11px] text-[#F5A524] font-semibold">
                          <Star className="w-3 h-3 fill-current" />
                          {place.rating} ({place.userRatingsTotal || 0})
                        </span>
                      ) : (
                        <span className="text-[#5E5E68] text-[10px]">Sem avaliação</span>
                      )}
                    </div>

                    <div className="text-[10px] text-[#5E5E68] font-mono flex items-center gap-1 truncate pt-1">
                      <Hash className="w-3 h-3 shrink-0" />
                      Place ID: <span className="truncate">{place.placeId}</span>
                    </div>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="pt-3 border-t border-[#26262B] grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => handleSaveLead(place)}
                      disabled={isSaved}
                      className={`btn-secondary h-8 px-2 text-[11px] font-semibold flex items-center justify-center gap-1 ${
                        isSaved ? 'opacity-50 cursor-not-allowed border-green-500 text-green-400' : ''
                      }`}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      {isSaved ? 'Adicionado' : 'Adicionar aos meus leads'}
                    </button>

                    <button
                      onClick={() => setSelectedPlace(place)}
                      className="btn-ghost h-8 px-2 text-[11px] text-[#3D8BFF] font-semibold border border-[#26262B] hover:border-[#3D8BFF]/40"
                    >
                      Ver detalhes
                    </button>

                    <button
                      onClick={() => handleGenerateApproach(place)}
                      className="btn-ghost h-8 px-2 text-[11px] text-purple-400 hover:text-purple-300 font-semibold border border-[#26262B] hover:border-purple-500/40"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      Gerar abordagem
                    </button>

                    {waRes?.url ? (
                      <a
                        href={waRes.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary h-8 px-2 text-[11px] font-bold flex items-center justify-center gap-1 bg-[#2FBF71] hover:bg-[#28A762] text-white"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                      </a>
                    ) : (
                      <button
                        disabled
                        className="btn-ghost h-8 px-2 text-[11px] text-[#5E5E68] opacity-50 cursor-not-allowed border border-[#26262B]"
                      >
                        Sem WhatsApp
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !apiError && places.length === 0 && (
        <EmptyState
          icon={Search}
          title="Nenhuma empresa pesquisada ainda"
          description="Selecione o estado, cidade e categoria desejados acima e clique em 'Buscar Empresas' para pesquisar negócios reais via Google Places."
        />
      )}

      {/* Place Details Modal */}
      {selectedPlace && (
        <Modal
          isOpen={Boolean(selectedPlace)}
          onClose={() => setSelectedPlace(null)}
          title={selectedPlace.name}
          description="Dados oficiais fornecidos pela Google Places API"
          maxWidth="xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-[#18181B] border border-[#26262B] space-y-2.5">
              <p className="text-white"><strong>Nome:</strong> {selectedPlace.name}</p>
              <p className="text-white"><strong>Categoria:</strong> {selectedPlace.category}</p>
              <p className="text-white"><strong>Endereço completo:</strong> {selectedPlace.address}</p>
              <p className="text-white"><strong>Cidade / UF:</strong> {selectedPlace.city || selectedCity} / {selectedPlace.state || selectedState}</p>
              <p className="text-white"><strong>Bairro:</strong> {selectedPlace.neighborhood || neighborhood || 'Não informado'}</p>
              <p className="text-white"><strong>Telefone:</strong> {selectedPlace.phone || 'Não informado'}</p>
              <p className="text-white"><strong>Website:</strong> {selectedPlace.website || 'Sem website cadastrado'}</p>
              <p className="text-white">
                <strong>Avaliação:</strong> {selectedPlace.rating ? `⭐ ${selectedPlace.rating} (${selectedPlace.userRatingsTotal || 0} avaliações)` : 'Sem avaliações'}
              </p>
              {(selectedPlace as any).latitude && (selectedPlace as any).longitude && (
                <p className="text-white flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-[#3D8BFF]" />
                  <strong>Coordenadas:</strong> {(selectedPlace as any).latitude}, {(selectedPlace as any).longitude}
                </p>
              )}
              {selectedPlace.openingHours && selectedPlace.openingHours.length > 0 && (
                <div>
                  <strong className="text-white block mb-1">Horário de funcionamento:</strong>
                  <ul className="space-y-0.5 text-[#8B8B95] pl-2 border-l border-[#26262B]">
                    {selectedPlace.openingHours.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-[#8B8B95] font-mono text-[10px] pt-1">
                <strong>Place ID:</strong> {selectedPlace.placeId}
              </p>
            </div>

            <div className="pt-4 flex flex-wrap gap-2 justify-end border-t border-[#26262B]">
              <button
                onClick={() => {
                  handleSaveLead(selectedPlace);
                  setSelectedPlace(null);
                }}
                disabled={savedPlaceIds.has(selectedPlace.placeId)}
                className="btn-secondary"
              >
                {savedPlaceIds.has(selectedPlace.placeId) ? 'Já adicionado' : 'Adicionar aos meus leads'}
              </button>

              {selectedPlace.mapsUrl && (
                <a
                  href={selectedPlace.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  Ver no Google Maps <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </a>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Approach Generator Modal */}
      {approachPlace && (
        <Modal
          isOpen={Boolean(approachPlace)}
          onClose={() => setApproachPlace(null)}
          title={`Gerar Abordagem - ${approachPlace.name}`}
          description="Mensagem personalizada gerada por Inteligência Artificial"
          maxWidth="xl"
        >
          <div className="space-y-4 text-xs">
            {generatingApproach && <LoadingState text="Gerando mensagem de abordagem com IA..." />}

            {approachMessage && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  {(['curta', 'padrao', 'consultiva'] as const).map((varKey) => (
                    <button
                      key={varKey}
                      onClick={() => setSelectedVariation(varKey)}
                      className={`px-3 py-1.5 rounded-lg font-semibold text-xs capitalize ${
                        selectedVariation === varKey
                          ? 'bg-[#1769FF] text-white shadow-[0_0_12px_rgba(23,105,255,0.4)]'
                          : 'bg-[#18181B] text-[#8B8B95] hover:text-white'
                      }`}
                    >
                      {varKey}
                    </button>
                  ))}
                </div>

                <div className="p-4 bg-[#18181B] rounded-xl border border-[#26262B] text-white font-mono leading-relaxed whitespace-pre-wrap">
                  {approachMessage[selectedVariation]}
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  {approachPlace.phone && (
                    <a
                      href={buildWhatsAppUrl(approachPlace.phone, approachMessage[selectedVariation]).url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary bg-[#2FBF71] hover:bg-[#28A762] text-white"
                    >
                      <MessageSquare className="w-4 h-4" /> Abrir no WhatsApp
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
