import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../database/firebase';
import { Lead } from '../types';
import { LoadingState } from '../components/ui/LoadingState';
import { useToast } from '../components/ui/Toast';
import DOMPurify from 'dompurify';
import JSZip from 'jszip';
import {
  Wand2,
  Copy,
  Download,
  ExternalLink,
  Globe,
  CheckCircle,
  Monitor,
  Tablet,
  Smartphone,
  Layers,
  Code,
  Sparkles,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

export const CriadorSitesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'wizard' | 'structure' | 'preview' | 'masterPrompt'>('wizard');
  const [wizardStep, setStep] = useState(1);

  // Form Briefing State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [companyName, setCompanyName] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [openingHours, setOpeningHours] = useState('Segunda a Sábado, 08h às 19h');
  const [goal, setGoal] = useState('Receber contatos no WhatsApp');
  const [style, setStyle] = useState('Moderno Escuro (Preto + Roxo Tecnológico)');
  const [services, setServices] = useState('Atendimento VIP, Serviços Especializados, Orçamento Grátis');
  const [differentials, setDifferentials] = useState('Atendimento pontual sem fila, Ambiente climatizado, Garantia de satisfação');
  const [phone, setPhone] = useState('(11) 98765-4321');
  const [detailLevel, setDetailLevel] = useState<'standard' | 'maximum'>('standard');

  const [generating, setGenerating] = useState(false);
  const [masterPromptText, setMasterPromptText] = useState('');
  const [sections, setSections] = useState<any[]>([]);
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const { showToast } = useToast();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    getDocs(collection(db, 'users', user.uid, 'leads')).then((snap) => {
      const docs: Lead[] = [];
      snap.forEach((d) => docs.push({ id: d.id, ...d.data() } as Lead));
      setLeads(docs);
    });
  }, []);

  const handleSelectLead = (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      setCompanyName(lead.companyName);
      setCategory(lead.category);
      setCity(`${lead.city}/${lead.state}`);
      if (lead.phone) setPhone(lead.phone);
      if (lead.address) setAddress(lead.address);
    }
  };

  const handleGenerateSite = async () => {
    if (!companyName.trim()) {
      showToast({ type: 'error', title: 'Preencha o nome da empresa' });
      return;
    }

    setGenerating(true);

    try {
      const briefing = {
        companyName,
        category,
        city,
        address,
        openingHours,
        goal,
        style,
        services,
        differentials,
        phone,
        detailLevel,
      };

      const res = await fetch('/api/ai/site-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ briefing }),
      });

      const json = await res.json();

      if (json.ok && json.data) {
        setMasterPromptText(json.data.masterPrompt || '');
        const generatedSections = json.data.sections || [];
        setSections(generatedSections);

        // Save or update website record in Firestore
        const user = auth.currentUser;
        if (user) {
          const docRef = await addDoc(collection(db, 'users', user.uid, 'websites'), {
            companyName,
            goal,
            segment: category,
            city,
            phone,
            address,
            openingHours,
            style,
            status: 'concluido',
            briefing,
            sections: generatedSections,
            masterPrompt: json.data.masterPrompt,
            seoTitle: `${companyName} — ${category} em ${city}`,
            seoDescription: `Conheça os serviços de ${category} da ${companyName} em ${city}.`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          setCurrentDocId(docRef.id);
        }

        setActiveTab('structure');
        showToast({ type: 'success', title: 'Site e Prompt Mestre gerados com sucesso!' });
      } else {
        showToast({ type: 'error', title: 'Erro ao gerar site', message: json.error?.message });
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Erro de comunicação', message: err.message });
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveWebsiteUpdates = async () => {
    const user = auth.currentUser;
    if (!user || !currentDocId) return;

    try {
      const webRef = doc(db, 'users', user.uid, 'websites', currentDocId);
      await updateDoc(webRef, {
        companyName,
        segment: category,
        city,
        phone,
        sections,
        updatedAt: new Date().toISOString(),
      });

      showToast({ type: 'success', title: 'Edições do site salvas com sucesso!' });
    } catch (err: any) {
      showToast({ type: 'error', title: 'Erro ao salvar alterações', message: err.message });
    }
  };

  // Generate self-contained HTML for preview & download based on real company data & sections
  const generateFullHtml = () => {
    const cleanCompanyName = companyName || 'Empresa';
    const cleanPhone = phone.replace(/\D/g, '') || '5511999999999';
    const waUrl = `https://wa.me/55${cleanPhone}`;

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${cleanCompanyName} — ${category || 'Serviços'}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#000000] text-white font-sans antialiased selection:bg-[#7C3AED]">
  {/* Header */}
  <header class="p-6 border-b border-[#26262B] flex justify-between items-center max-w-6xl mx-auto sticky top-0 bg-[#000000]/90 backdrop-blur-md z-50">
    <h1 class="text-xl font-bold text-[#A855F7]">${cleanCompanyName}</h1>
    <a href="${waUrl}" target="_blank" class="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(124,58,237,0.4)]">
      Falar no WhatsApp 📲
    </a>
  </header>

  <main class="max-w-6xl mx-auto px-6 py-12 space-y-16">
    {/* Dynamic rendered sections or fallbacks */}
    ${sections.length > 0 ? sections.filter(s => s.isVisible !== false).map(sec => {
      if (sec.type === 'hero') {
        return `
          <section class="text-center py-12 space-y-6">
            <span class="text-xs font-bold text-[#A855F7] uppercase tracking-wider">${category || 'Excelência e Qualidade'} em ${city || 'sua região'}</span>
            <h2 class="text-4xl sm:text-6xl font-extrabold text-white max-w-3xl mx-auto leading-tight">${sec.title || cleanCompanyName}</h2>
            <p class="text-base text-[#C9C9CF] max-w-xl mx-auto">${sec.subtitle || differentials}</p>
            <div class="pt-4">
              <a href="${waUrl}" target="_blank" class="bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white px-8 py-4 rounded-xl text-sm font-bold inline-block shadow-lg hover:brightness-110 transition-all">
                ${sec.ctaText || 'Agendar / Solicitar Orçamento via WhatsApp'}
              </a>
            </div>
          </section>
        `;
      }
      if (sec.type === 'services') {
        return `
          <section class="py-12 border-t border-[#26262B]">
            <h3 class="text-2xl font-bold text-white mb-2 text-center">${sec.title || 'Nossos Serviços'}</h3>
            <p class="text-xs text-[#8B8B95] text-center mb-8">${sec.subtitle || 'Soluções completas com atendimento personalizado'}</p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              ${(sec.items || services.split(',')).map((item: any) => `
                <div class="p-6 rounded-2xl bg-[#111113] border border-[#26262B]">
                  <h4 class="font-bold text-white text-lg mb-2">${typeof item === 'string' ? item.trim() : item.title}</h4>
                  <p class="text-xs text-[#8B8B95]">${typeof item === 'string' ? 'Atendimento de alta qualidade e garantia.' : (item.description || item.desc || '')}</p>
                </div>
              `).join('')}
            </div>
          </section>
        `;
      }
      if (sec.type === 'about') {
        return `
          <section class="py-12 border-t border-[#26262B]">
            <div class="p-8 rounded-3xl bg-[#111113] border border-[#7C3AED]/30 space-y-4 max-w-3xl mx-auto text-center">
              <h3 class="text-2xl font-bold text-white">${sec.title || 'Sobre a Empresa'}</h3>
              <p class="text-xs text-[#C9C9CF] leading-relaxed">${sec.content || `A ${cleanCompanyName} é referência em ${category} em ${city}. Nossos diferenciais: ${differentials}.`}</p>
            </div>
          </section>
        `;
      }
      if (sec.type === 'faq') {
        return `
          <section class="py-12 border-t border-[#26262B]">
            <h3 class="text-2xl font-bold text-white mb-8 text-center">${sec.title || 'Perguntas Frequentes'}</h3>
            <div class="space-y-4 max-w-2xl mx-auto">
              ${(sec.items || []).map((faq: any) => `
                <div class="p-5 rounded-2xl bg-[#111113] border border-[#26262B] space-y-2">
                  <h4 class="font-bold text-white text-sm">Q: ${faq.question}</h4>
                  <p class="text-xs text-[#C9C9CF]">A: ${faq.answer}</p>
                </div>
              `).join('')}
            </div>
          </section>
        `;
      }
      return `
        <section class="py-8 text-center border-t border-[#26262B]">
          <h3 class="text-2xl font-bold text-white mb-2">${sec.title || 'Entre em Contato'}</h3>
          <p class="text-xs text-[#C9C9CF] mb-4">${sec.subtitle || 'Estamos prontos para atender você.'}</p>
          <a href="${waUrl}" target="_blank" class="bg-[#7C3AED] text-white px-8 py-3 rounded-xl text-xs font-bold inline-block">
            ${sec.ctaText || 'Falar no WhatsApp'}
          </a>
        </section>
      `;
    }).join('') : `
      <section class="text-center py-12 space-y-6">
        <span class="text-xs font-bold text-[#A855F7] uppercase tracking-wider">${category} em ${city}</span>
        <h2 class="text-4xl sm:text-6xl font-extrabold text-white max-w-3xl mx-auto">${cleanCompanyName}</h2>
        <p class="text-base text-[#C9C9CF] max-w-xl mx-auto">${differentials}</p>
        <div class="pt-4">
          <a href="${waUrl}" target="_blank" class="bg-[#7C3AED] text-white px-8 py-4 rounded-xl text-sm font-bold inline-block shadow-lg">Agendar via WhatsApp</a>
        </div>
      </section>
    `}

    {/* Location & Opening Hours Info Box */}
    <section class="p-8 rounded-3xl bg-[#111113] border border-[#26262B] grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 class="font-bold text-white text-sm mb-2">📍 Endereço & Localização</h4>
        <p class="text-xs text-[#C9C9CF]">${address || `${city} — Atendimento Local`}</p>
      </div>
      <div>
        <h4 class="font-bold text-white text-sm mb-2">🕒 Horário de Atendimento</h4>
        <p class="text-xs text-[#C9C9CF]">${openingHours}</p>
      </div>
    </section>
  </main>

  <footer class="p-8 border-t border-[#26262B] text-center text-xs text-[#8B8B95]">
    © ${new Date().getFullYear()} ${cleanCompanyName}. Todos os direitos reservados.
  </footer>
</body>
</html>`;
  };


  const handleDownloadZip = async () => {
    const zip = new JSZip();
    zip.file('index.html', generateFullHtml());
    zip.file('PROMPT_MESTRE.md', masterPromptText);

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `site-${companyName.toLowerCase().replace(/\s+/g, '-')}.zip`;
    a.click();
    URL.revokeObjectURL(url);
    showToast({ type: 'success', title: 'Arquivo ZIP baixado!' });
  };

  return (
    <div className="space-y-6">
      {/* Informative Header Banner */}
      <div className="card-surface p-5 rounded-2xl border border-[#7C3AED]/40 bg-[#1e0a45]/30 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#A855F7] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="font-sora text-sm font-bold text-white">
            Criador de Sites com IA, Preview Interativo & Prompt Mestre
          </h3>
          <p className="text-xs text-[#C9C9CF] leading-relaxed">
            Responda o briefing para a IA gerar o site completo e personalizado para a empresa! Você pode editar cada seção diretamente na tela, pré-visualizar o site pronto, exportar em ZIP e obter o <strong>Prompt Mestre (~2.000 palavras)</strong>!
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#26262B] pb-3">
        <button
          onClick={() => setActiveTab('wizard')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'wizard'
              ? 'bg-[#7C3AED] text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]'
              : 'bg-[#111113] text-[#8B8B95] hover:text-white'
          }`}
        >
          <Wand2 className="w-4 h-4" /> 1. Briefing da Empresa
        </button>

        {sections.length > 0 && (
          <button
            onClick={() => setActiveTab('structure')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'structure'
                ? 'bg-[#7C3AED] text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]'
                : 'bg-[#111113] text-[#8B8B95] hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" /> 2. Editar Estrutura
          </button>
        )}

        {sections.length > 0 && (
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'preview'
                ? 'bg-[#7C3AED] text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]'
                : 'bg-[#111113] text-[#8B8B95] hover:text-white'
            }`}
          >
            <Monitor className="w-4 h-4" /> 3. Preview do Site
          </button>
        )}

        {masterPromptText && (
          <button
            onClick={() => setActiveTab('masterPrompt')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'masterPrompt'
                ? 'bg-[#7C3AED] text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]'
                : 'bg-[#111113] text-[#8B8B95] hover:text-white'
            }`}
          >
            <Code className="w-4 h-4" /> 4. Prompt Mestre
          </button>
        )}
      </div>


      {/* Tab: Wizard */}
      {activeTab === 'wizard' && (
        <div className="card-surface p-6 sm:p-8 rounded-2xl border border-[#26262B] bg-[#0A0A0B] max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-[#26262B] pb-4">
            <div>
              <span className="text-[10px] font-bold text-[#A855F7] uppercase tracking-wider">Passo {wizardStep} de 5</span>
              <h2 className="font-sora text-lg font-bold text-white">Coleta de Briefing do Site</h2>
            </div>
            <Sparkles className="w-6 h-6 text-[#A855F7]" />
          </div>

          {wizardStep === 1 && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[#C9C9CF] font-medium mb-1">Escolher Lead Salvo (opcional)</label>
                <select
                  onChange={(e) => handleSelectLead(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 outline-none focus:border-[#7C3AED]"
                >
                  <option value="">Selecione um lead do CRM ou digite manualmente</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>{l.companyName} ({l.city})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#C9C9CF] font-medium mb-1">Nome da Empresa *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ex: Barbearia Silva"
                  className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#C9C9CF] font-medium mb-1">Categoria</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Ex: Barbearia"
                    className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 outline-none focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-[#C9C9CF] font-medium mb-1">Cidade / Estado</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ex: São Paulo / SP"
                    className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button onClick={() => setStep(2)} className="btn-primary">
                  Avançar <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[#C9C9CF] font-medium mb-1">Objetivo Principal do Site (CTA Primário)</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 outline-none focus:border-[#7C3AED]"
                >
                  <option value="Receber contatos no WhatsApp">Receber contatos no WhatsApp</option>
                  <option value="Agendamentos online">Agendamentos online</option>
                  <option value="Pedidos de orçamento">Pedidos de orçamento</option>
                  <option value="Vender produtos">Vender produtos</option>
                  <option value="Apresentar a empresa">Apresentar a empresa</option>
                </select>
              </div>

              <div>
                <label className="block text-[#C9C9CF] font-medium mb-1">Estilo Visual Desejado</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 outline-none focus:border-[#7C3AED]"
                >
                  <option value="Moderno Escuro (Preto + Roxo Tecnológico)">Moderno Escuro (Preto + Roxo Tecnológico)</option>
                  <option value="Claro e limpo">Claro e limpo (Minimalista)</option>
                  <option value="Elegante / Luxo">Elegante / Luxo (Dourado/Preto)</option>
                  <option value="Popular e direto">Popular e direto</option>
                </select>
              </div>

              <div className="pt-4 flex justify-between">
                <button onClick={() => setStep(1)} className="btn-ghost">Voltar</button>
                <button onClick={() => setStep(3)} className="btn-primary">
                  Avançar <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          )}

          {wizardStep === 3 && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[#C9C9CF] font-medium mb-1">Serviços / Produtos Oferecidos</label>
                <textarea
                  rows={3}
                  value={services}
                  onChange={(e) => setServices(e.target.value)}
                  placeholder="Liste os principais serviços separados por vírgula..."
                  className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="block text-[#C9C9CF] font-medium mb-1">Diferenciais do Negócio</label>
                <textarea
                  rows={2}
                  value={differentials}
                  onChange={(e) => setDifferentials(e.target.value)}
                  placeholder="O que faz esse negócio se destacar..."
                  className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="pt-4 flex justify-between">
                <button onClick={() => setStep(2)} className="btn-ghost">Voltar</button>
                <button onClick={() => setStep(4)} className="btn-primary">
                  Avançar <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          )}

          {wizardStep === 4 && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[#C9C9CF] font-medium mb-1">Telefone WhatsApp do Cliente</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="block text-[#C9C9CF] font-medium mb-1">Nível de Detalhe do Prompt Mestre</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDetailLevel('standard')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      detailLevel === 'standard'
                        ? 'bg-[#7C3AED]/15 border-[#7C3AED] text-white'
                        : 'bg-[#18181B] border-[#26262B] text-[#8B8B95]'
                    }`}
                  >
                    <span className="font-bold block text-xs">Padrão</span>
                    <span className="text-[10px]">~1.200 palavras</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetailLevel('maximum')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      detailLevel === 'maximum'
                        ? 'bg-[#7C3AED]/15 border-[#7C3AED] text-white'
                        : 'bg-[#18181B] border-[#26262B] text-[#8B8B95]'
                    }`}
                  >
                    <span className="font-bold block text-xs">Máximo</span>
                    <span className="text-[10px]">~2.200 palavras</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button onClick={() => setStep(3)} className="btn-ghost">Voltar</button>
                <button
                  type="button"
                  onClick={handleGenerateSite}
                  disabled={generating}
                  className="btn-primary font-bold shadow-[0_0_20px_rgba(23,105,255,0.4)]"
                >
                  <Wand2 className="w-4 h-4" />
                  {generating ? 'Gerando Prompt e Estrutura...' : 'Gerar Prompt Mestre e Estrutura'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Structure Editor */}
      {activeTab === 'structure' && (
        <div className="card-surface p-6 rounded-2xl border border-[#26262B] bg-[#0A0A0B] space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#26262B] pb-4">
            <div>
              <h2 className="font-sora text-lg font-bold text-white">Editor de Estrutura & Conteúdo do Site</h2>
              <p className="text-xs text-[#8B8B95]">Edite os títulos, chamadas e seções do site de {companyName}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSaveWebsiteUpdates}
                className="btn-primary h-9 text-xs font-bold shadow-[0_0_15px_rgba(124,58,237,0.4)]"
              >
                Salvar Alterações
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className="btn-secondary h-9 text-xs font-bold"
              >
                Ver Preview do Site ↗
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {sections.map((sec, idx) => (
              <div key={sec.id || idx} className="p-5 rounded-2xl bg-[#111113] border border-[#26262B] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#A855F7] uppercase tracking-wider">
                    Seção {idx + 1}: {sec.type || 'Personalizada'}
                  </span>
                  <label className="flex items-center gap-2 text-xs text-[#C9C9CF] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sec.isVisible !== false}
                      onChange={(e) => {
                        const updated = [...sections];
                        updated[idx].isVisible = e.target.checked;
                        setSections(updated);
                      }}
                      className="accent-[#7C3AED] rounded"
                    />
                    Visível no Site
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[#8B8B95] font-medium mb-1">Título da Seção</label>
                    <input
                      type="text"
                      value={sec.title || ''}
                      onChange={(e) => {
                        const updated = [...sections];
                        updated[idx].title = e.target.value;
                        setSections(updated);
                      }}
                      className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2 outline-none focus:border-[#7C3AED]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#8B8B95] font-medium mb-1">Subtítulo / Chamada</label>
                    <input
                      type="text"
                      value={sec.subtitle || ''}
                      onChange={(e) => {
                        const updated = [...sections];
                        updated[idx].subtitle = e.target.value;
                        setSections(updated);
                      }}
                      className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2 outline-none focus:border-[#7C3AED]"
                    />
                  </div>
                </div>

                {sec.content && typeof sec.content === 'string' && (
                  <div>
                    <label className="block text-[#8B8B95] text-xs font-medium mb-1">Texto Principal</label>
                    <textarea
                      rows={3}
                      value={sec.content}
                      onChange={(e) => {
                        const updated = [...sections];
                        updated[idx].content = e.target.value;
                        setSections(updated);
                      }}
                      className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2 text-xs outline-none focus:border-[#7C3AED]"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Master Prompt Viewer */}
      {activeTab === 'masterPrompt' && masterPromptText && (
        <div className="card-surface p-6 sm:p-8 rounded-2xl border border-[#26262B] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#26262B] pb-4">
            <div>
              <h2 className="font-sora text-lg font-bold text-white">Prompt Mestre Gerado</h2>
              <p className="text-xs text-[#8B8B95]">
                {masterPromptText.split(/\s+/).length} palavras • Pronto para colar no Google AI Studio
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(masterPromptText);
                  showToast({ type: 'success', title: 'Prompt Mestre copiado!' });
                }}
                className="btn-secondary h-9 text-xs"
              >
                <Copy className="w-3.5 h-3.5" /> Copiar Prompt
              </button>

              <a
                href="https://aistudio.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary h-9 text-xs"
              >
                Abrir Google AI Studio <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>
            </div>
          </div>

          <pre className="text-xs text-[#C9C9CF] bg-[#0A0A0B] p-6 rounded-xl border border-[#26262B] font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[60vh]">
            {masterPromptText}
          </pre>
        </div>
      )}

      {/* Tab: Interactive Preview */}
      {activeTab === 'preview' && (
        <div className="card-surface p-6 rounded-2xl border border-[#26262B] space-y-4">
          <div className="flex items-center justify-between border-b border-[#26262B] pb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`p-2 rounded-lg border ${previewDevice === 'desktop' ? 'bg-[#7C3AED] text-white' : 'bg-[#18181B] text-[#8B8B95]'}`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewDevice('tablet')}
                className={`p-2 rounded-lg border ${previewDevice === 'tablet' ? 'bg-[#7C3AED] text-white' : 'bg-[#18181B] text-[#8B8B95]'}`}
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`p-2 rounded-lg border ${previewDevice === 'mobile' ? 'bg-[#7C3AED] text-white' : 'bg-[#18181B] text-[#8B8B95]'}`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            <button onClick={handleDownloadZip} className="btn-primary h-9 text-xs">
              <Download className="w-4 h-4" /> Baixar ZIP
            </button>
          </div>

          <div className="flex justify-center bg-[#000000] p-4 rounded-xl border border-[#26262B]">
            <iframe
              srcDoc={DOMPurify.sanitize(generateFullHtml(), { ADD_TAGS: ['script', 'link', 'style'] })}
              className={`bg-black border border-[#26262B] rounded-xl transition-all ${
                previewDevice === 'desktop' ? 'w-full h-[600px]' : previewDevice === 'tablet' ? 'w-[768px] h-[600px]' : 'w-[375px] h-[600px]'
              }`}
              title="Site Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
};
