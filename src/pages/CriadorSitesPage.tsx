import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
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
  const [activeTab, setActiveTab] = useState<'wizard' | 'masterPrompt' | 'structure' | 'preview' | 'seo'>('wizard');
  const [wizardStep, setStep] = useState(1);

  // Form Briefing State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [companyName, setCompanyName] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [goal, setGoal] = useState('Receber contatos no WhatsApp');
  const [style, setStyle] = useState('Moderno Escuro (Preto + Azul Elétrico)');
  const [services, setServices] = useState('Corte de cabelo, Barba completa, Selagem, Tratamento VIP');
  const [differentials, setDifferentials] = useState('Atendimento pontual sem fila, Cerveja cortesia, Espaço climatizado');
  const [phone, setPhone] = useState('(11) 98765-4321');
  const [detailLevel, setDetailLevel] = useState<'standard' | 'maximum'>('standard');

  const [generating, setGenerating] = useState(false);
  const [masterPromptText, setMasterPromptText] = useState('');
  const [sections, setSections] = useState<any[]>([]);
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

      if (json.ok) {
        setMasterPromptText(json.data.masterPrompt);
        setSections(json.data.sections || []);
        setActiveTab('masterPrompt');
        showToast({ type: 'success', title: 'Prompt Mestre e Estrutura gerados com sucesso!' });

        // Save website record in Firestore
        const user = auth.currentUser;
        if (user) {
          await addDoc(collection(db, 'users', user.uid, 'websites'), {
            companyName,
            goal,
            segment: category,
            style,
            status: 'concluido',
            briefing,
            masterPrompt: json.data.masterPrompt,
            seoTitle: `${companyName} — ${category} em ${city}`,
            seoDescription: `Conheça os serviços de ${category} da ${companyName} em ${city}.`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      } else {
        showToast({ type: 'error', title: 'Erro ao gerar site', message: json.error?.message });
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Erro de comunicação', message: err.message });
    } finally {
      setGenerating(false);
    }
  };

  // Generate self-contained HTML for preview & download
  const generateFullHtml = () => {
    const cleanCompanyName = companyName || 'Empresa';
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${cleanCompanyName} — ${category || 'Serviços'}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#000000] text-white font-sans antialiased">
  <header class="p-6 border-b border-[#26262B] flex justify-between items-center max-w-6xl mx-auto">
    <h1 class="text-xl font-bold text-[#3D8BFF]">${cleanCompanyName}</h1>
    <a href="https://wa.me/55${phone.replace(/\D/g, '')}" target="_blank" class="bg-[#1769FF] text-white px-4 py-2 rounded-xl text-xs font-bold">Falar no WhatsApp</a>
  </header>

  <main class="max-w-6xl mx-auto px-6 py-16 space-y-16">
    <!-- Hero -->
    <section className="text-center py-12 space-y-6">
      <span className="text-xs font-bold text-[#3D8BFF] uppercase tracking-wider">${category} em ${city}</span>
      <h2 class="text-4xl sm:text-6xl font-extrabold text-white max-w-3xl mx-auto">${cleanCompanyName}</h2>
      <p class="text-base text-[#C9C9CF] max-w-xl mx-auto">Excelência e atendimento especializado com diferenciais únicos para você.</p>
      <div class="pt-4">
        <a href="https://wa.me/55${phone.replace(/\D/g, '')}" target="_blank" class="bg-gradient-to-r from-[#3D8BFF] to-[#1769FF] text-white px-8 py-4 rounded-xl text-sm font-bold inline-block shadow-lg">Agendar via WhatsApp</a>
      </div>
    </section>

    <!-- Services -->
    <section class="py-12 border-t border-[#26262B]">
      <h3 class="text-2xl font-bold text-white mb-8 text-center">Nossos Serviços</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${services.split(',').map((s) => `
          <div class="p-6 rounded-2xl bg-[#111113] border border-[#26262B]">
            <h4 class="font-bold text-white text-lg mb-2">${s.trim()}</h4>
            <p class="text-xs text-[#8B8B95]">Atendimento de alta qualidade com agendamento rápido.</p>
          </div>
        `).join('')}
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
      <div className="card-surface p-5 rounded-2xl border border-[#3D8BFF]/30 bg-[#0D347A]/15 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#3D8BFF] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="font-sora text-sm font-bold text-white">
            Gerador de Prompt Mestre e Estrutura de Sites
          </h3>
          <p className="text-xs text-[#C9C9CF] leading-relaxed">
            Responda o briefing rápido abaixo para a IA criar o <strong>Prompt Mestre completo (~2.000 palavras)</strong>,
            com cópias de alta conversão, estrutura de seções, palavras-chave de SEO e código pronto para você colar no AI Studio ou usar onde preferir!
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#26262B] pb-3">
        <button
          onClick={() => setActiveTab('wizard')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'wizard' ? 'bg-[#1769FF] text-white' : 'bg-[#111113] text-[#8B8B95] hover:text-white'
          }`}
        >
          <Wand2 className="w-4 h-4" /> Assistente de Briefing
        </button>

        {masterPromptText && (
          <>
            <button
              onClick={() => setActiveTab('masterPrompt')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'masterPrompt' ? 'bg-[#1769FF] text-white' : 'bg-[#111113] text-[#8B8B95] hover:text-white'
              }`}
            >
              <Code className="w-4 h-4" /> Prompt Mestre
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'preview' ? 'bg-[#1769FF] text-white' : 'bg-[#111113] text-[#8B8B95] hover:text-white'
              }`}
            >
              <Monitor className="w-4 h-4" /> Preview do Site
            </button>
          </>
        )}
      </div>

      {/* Tab: Wizard */}
      {activeTab === 'wizard' && (
        <div className="card-surface p-6 sm:p-8 rounded-2xl border border-[#26262B] bg-[#0A0A0B] max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-[#26262B] pb-4">
            <div>
              <span className="text-[10px] font-bold text-[#3D8BFF] uppercase tracking-wider">Passo {wizardStep} de 5</span>
              <h2 className="font-sora text-lg font-bold text-white">Coleta de Briefing do Site</h2>
            </div>
            <Sparkles className="w-6 h-6 text-[#3D8BFF]" />
          </div>

          {wizardStep === 1 && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[#C9C9CF] font-medium mb-1">Escolher Lead Salvo (opcional)</label>
                <select
                  onChange={(e) => handleSelectLead(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 outline-none focus:border-[#3D8BFF]"
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
                  className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 outline-none focus:border-[#3D8BFF]"
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
                  className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 outline-none focus:border-[#3D8BFF]"
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
                  className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 outline-none focus:border-[#3D8BFF]"
                >
                  <option value="Moderno Escuro (Preto + Azul Elétrico)">Moderno Escuro (Preto + Azul Elétrico)</option>
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
                  className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 outline-none focus:border-[#3D8BFF]"
                />
              </div>

              <div>
                <label className="block text-[#C9C9CF] font-medium mb-1">Diferenciais do Negócio</label>
                <textarea
                  rows={2}
                  value={differentials}
                  onChange={(e) => setDifferentials(e.target.value)}
                  placeholder="O que faz esse negócio se destacar..."
                  className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 outline-none focus:border-[#3D8BFF]"
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
                  className="w-full bg-[#18181B] border border-[#26262B] text-white rounded-xl p-2.5 outline-none focus:border-[#3D8BFF]"
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
                        ? 'bg-[#1769FF]/15 border-[#3D8BFF] text-white'
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
                        ? 'bg-[#1769FF]/15 border-[#3D8BFF] text-white'
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
                className={`p-2 rounded-lg border ${previewDevice === 'desktop' ? 'bg-[#1769FF] text-white' : 'bg-[#18181B] text-[#8B8B95]'}`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewDevice('tablet')}
                className={`p-2 rounded-lg border ${previewDevice === 'tablet' ? 'bg-[#1769FF] text-white' : 'bg-[#18181B] text-[#8B8B95]'}`}
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`p-2 rounded-lg border ${previewDevice === 'mobile' ? 'bg-[#1769FF] text-white' : 'bg-[#18181B] text-[#8B8B95]'}`}
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
