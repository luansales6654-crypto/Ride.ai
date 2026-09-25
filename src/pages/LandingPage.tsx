import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Logo } from '../components/ui/Logo';
import {
  Search,
  MessageSquare,
  Wand2,
  DollarSign,
  Grid,
  Globe,
  ChevronDown,
  Layers,
  Cpu,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqItems = [
    {
      q: 'O que é a RIDE.IA?',
      a: 'A RIDE.IA é uma plataforma SaaS completa que reúne prospecção de empresas reais no Google Maps, CRM de vendas, gerador de propostas e prompt mestre de sites, além de gestão de e-commerce e catálogo com até 1.000 produtos.',
    },
    {
      q: 'Preciso saber programar?',
      a: 'Não. A RIDE.IA foi desenhada para agências, freelancers e empreendedores venderem serviços digitais e e-commerce de forma simples e intuitiva.',
    },
    {
      q: 'De onde vêm as empresas da prospecção?',
      a: 'Vêm diretamente do Google Maps via API oficial da Google Maps Platform. Os dados são reais, existentes e verificáveis.',
    },
    {
      q: 'Os produtos do catálogo são reais?',
      a: 'O catálogo permite importar seus produtos reais por CSV/API. A plataforma disponibiliza também um catálogo de demonstração rotulado como DEMO com 1.000 itens para testes de volume.',
    },
    {
      q: 'Como me conecto ao Mercado Livre?',
      a: 'Você autoriza sua conta via OAuth oficial do Mercado Livre diretamente nas configurações de integrações da RIDE.IA.',
    },
    {
      q: 'A RIDE.IA envia mensagens sozinha para os clientes?',
      a: 'NÃO. Para garantir segurança, entregabilidade e evitar banimentos, a RIDE.IA abre o WhatsApp Web/App com a mensagem pronta para você revisar e enviar com 1 clique.',
    },
    {
      q: 'Meus dados ficam separados dos de outros usuários?',
      a: 'Sim. Todo o seu banco de dados (leads, propostas, produtos e vendas) é isolado por usuário com autenticação e regras estritas no Firestore.',
    },
    {
      q: 'Posso exportar meus dados?',
      a: 'Sim. Você pode exportar seus leads, propostas e histórico de vendas em CSV ou JSON quando desejar nas configurações.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-[#1769FF] selection:text-white font-['Inter',sans-serif]">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-[#000000]/80 backdrop-blur-md border-b border-[#26262B] z-50 flex items-center justify-between px-6 lg:px-12">
        <Logo variant="full" size="md" />

        <nav className="hidden lg:flex items-center gap-8 text-xs font-medium text-[#C9C9CF]">
          <a href="#como-funciona" className="hover:text-white transition-colors">Como funciona</a>
          <a href="#sites" className="hover:text-white transition-colors">Sites</a>
          <a href="#prospeccao" className="hover:text-white transition-colors">Prospecção</a>
          <a href="#ecommerce" className="hover:text-white transition-colors">E-commerce</a>
          <a href="#integracoes" className="hover:text-white transition-colors">Integrações</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </nav>

        <div className="flex items-center gap-4">
          <NavLink to="/entrar" className="btn-secondary h-10 px-4 text-xs">
            Entrar
          </NavLink>
          <NavLink to="/cadastro" className="btn-primary h-10 px-5 text-xs">
            Começar agora
          </NavLink>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-36 pb-20 px-6 lg:px-12 max-w-7xl mx-auto text-center relative overflow-hidden">
        {/* Subtle radial glow background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#1769FF]/12 rounded-full blur-[140px] pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1769FF]/10 border border-[#3D8BFF]/30 text-[#8DBBFF] text-xs font-semibold mb-6 shadow-[0_0_15px_rgba(23,105,255,0.2)]">
          <ShieldCheck className="w-4 h-4 text-[#3D8BFF]" />
          Plataforma Full-Stack SaaS RIDE.IA
        </div>

        <h1 className="font-sora text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] max-w-5xl mx-auto mb-6">
          Encontre clientes, venda sites e lance seu e-commerce em uma{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3D8BFF] via-[#1769FF] to-[#8DBBFF]">
            única plataforma.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-[#C9C9CF] max-w-3xl mx-auto mb-10 leading-relaxed font-light">
          A RIDE.IA prospecta empresas reais no Google Maps, gera mensagens e propostas prontas para o WhatsApp, cria o prompt do site que vende e organiza seu catálogo de produtos e seus marketplaces — tudo em um só lugar.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <NavLink to="/cadastro" className="btn-primary h-12 px-8 text-sm font-bold shadow-[0_0_25px_rgba(23,105,255,0.35)]">
            Começar agora <ArrowRight className="w-4 h-4 ml-1" />
          </NavLink>
          <NavLink to="/entrar" className="btn-secondary h-12 px-8 text-sm font-semibold">
            Já possui conta? Entrar
          </NavLink>
        </div>

        {/* Abstract graphic display */}
        <div className="card-surface p-6 rounded-2xl border border-[#26262B] bg-[#0A0A0B]/90 shadow-2xl relative max-w-4xl mx-auto">
          <div className="flex items-center justify-between border-b border-[#26262B] pb-4 mb-6 text-xs text-[#8B8B95]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF6B57]/60" />
              <span className="w-3 h-3 rounded-full bg-[#F5A524]/60" />
              <span className="w-3 h-3 rounded-full bg-[#2FBF71]/60" />
            </div>
            <span className="font-sora text-[#3D8BFF] font-semibold">Desempenho RIDE.IA em Tempo Real</span>
          </div>
          {/* Abstract SVG line chart upward */}
          <div className="h-48 w-full flex items-end">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 800 200" fill="none">
              <path
                d="M 0 180 Q 200 160 300 120 T 500 80 T 800 20"
                stroke="#3D8BFF"
                strokeWidth="4"
                fill="none"
                className="drop-shadow-[0_0_12px_#1769FF]"
              />
              <path
                d="M 0 180 Q 200 160 300 120 T 500 80 T 800 20 V 200 H 0 Z"
                fill="url(#heroGrad)"
                opacity="0.3"
              />
              <defs>
                <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3D8BFF" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#3D8BFF" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </section>

      {/* Como Funciona Section */}
      <section id="como-funciona" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto border-t border-[#26262B]">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-[#3D8BFF] tracking-wider uppercase">FLUXO SIMPLIFICADO</span>
          <h2 className="font-sora text-3xl sm:text-4xl font-extrabold text-white mt-2">
            Como Funciona a RIDE.IA
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Encontre', desc: 'Busque empresas reais no Google Maps por segmento e localização. Filtre por "sem site".', icon: Search },
            { step: '02', title: 'Aborde', desc: 'Gere mensagens personalizadas com 1 clique e abra o WhatsApp Web com o texto pronto.', icon: MessageSquare },
            { step: '03', title: 'Crie', desc: 'Gere propostas comerciais irresistíveis e o Prompt Mestre completo do site em segundos.', icon: Wand2 },
            { step: '04', title: 'Venda', desc: 'Registre as vendas efetuadas e acompanhe seu faturamento subir no gráfico em tempo real.', icon: DollarSign },
          ].map((item) => (
            <div key={item.step} className="card-surface p-6 rounded-2xl relative border border-[#26262B] hover:border-[#3D8BFF]/40 transition-all">
              <span className="font-sora text-3xl font-extrabold text-[#0D347A] block mb-4">{item.step}</span>
              <item.icon className="w-8 h-8 text-[#3D8BFF] mb-3" />
              <h3 className="font-sora text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-xs text-[#8B8B95] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sites & Criador Section */}
      <section id="sites" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto border-t border-[#26262B]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold text-[#3D8BFF] tracking-wider uppercase">ÁREA 1 — SITES</span>
            <h2 className="font-sora text-3xl sm:text-4xl font-extrabold text-white mt-2 mb-4">
              Criador de Sites & Gerador do Prompt Mestre
            </h2>
            <p className="text-sm text-[#C9C9CF] mb-6 leading-relaxed">
              O assistente RIDE.IA coleta os dados reais do seu cliente em 8 passos e gera um Prompt Mestre cirúrgico pronto para colar no Google AI Studio Build ou executar diretamente na plataforma.
            </p>

            <ul className="space-y-3 text-xs text-[#8B8B95] mb-8">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#3D8BFF]" />
                Prompt Mestre autossuficiente com 15 seções técnicas estruturadas.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#3D8BFF]" />
                Editor de seções com reordenação e alteração de textos e chamadas.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#3D8BFF]" />
                Preview responsivo (Desktop 1280, Tablet 768, Mobile 375).
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#3D8BFF]" />
                Exportação real de código HTML sanitizado e arquivo ZIP.
              </li>
            </ul>

            <NavLink to="/cadastro" className="btn-primary text-xs font-semibold">
              Criar meu primeiro site
            </NavLink>
          </div>

          <div className="card-surface p-6 rounded-2xl border border-[#26262B] bg-[#0A0A0B]">
            <div className="flex items-center gap-3 border-b border-[#26262B] pb-4 mb-4">
              <Globe className="w-5 h-5 text-[#3D8BFF]" />
              <span className="font-sora font-bold text-sm text-white">Prompt Mestre Gerado</span>
            </div>
            <pre className="text-[11px] text-[#8DBBFF] bg-[#111113] p-4 rounded-xl border border-[#26262B] font-mono overflow-x-auto max-h-60 leading-relaxed">
              {`# PROMPT MESTRE DE SITE — RIDE.IA
1. OBJETIVO PRINCIPAL: Vender serviços da barbearia
2. DADOS REAIS: Barbearia Silva - SP (11) 98765-4321
3. PÚBLICO-ALVO: Homens modernos que buscam agilidade
4. PALETA VISUAL: #000000, #3D8BFF, #111113
5. ESTRUTURA: Hero -> Serviços -> Depoimentos -> Mapa
...`}
            </pre>
          </div>
        </div>
      </section>

      {/* Prospecção Section */}
      <section id="prospeccao" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto border-t border-[#26262B]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-[#3D8BFF] tracking-wider uppercase">DADOS 100% REAIS</span>
          <h2 className="font-sora text-3xl sm:text-4xl font-extrabold text-white mt-2 mb-4">
            Prospecção no Google Maps em Tempo Real
          </h2>
          <p className="text-sm text-[#C9C9CF]">
            Busque estabelecimentos comerciais por estado, cidade (via IBGE) e segmento. Identifique empresas sem site e aborde com mensagens preparadas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-surface p-6 rounded-2xl border border-[#26262B]">
            <Search className="w-7 h-7 text-[#3D8BFF] mb-3" />
            <h3 className="font-sora font-bold text-base text-white mb-2">Filtros Estruturados</h3>
            <p className="text-xs text-[#8B8B95]">Seleção de 27 UFs e cidades do IBGE com cache local para buscas ultrarrápidas.</p>
          </div>
          <div className="card-surface p-6 rounded-2xl border border-[#26262B]">
            <MessageSquare className="w-7 h-7 text-[#3D8BFF] mb-3" />
            <h3 className="font-sora font-bold text-base text-white mb-2">Abordagem com 1 Clique</h3>
            <p className="text-xs text-[#8B8B95]">Abre o WhatsApp com número normalizado e mensagem técnica pronta baseada na empresa.</p>
          </div>
          <div className="card-surface p-6 rounded-2xl border border-[#26262B]">
            <Layers className="w-7 h-7 text-[#3D8BFF] mb-3" />
            <h3 className="font-sora font-bold text-base text-white mb-2">CRM de Leads Kanban</h3>
            <p className="text-xs text-[#8B8B95]">Gerencie o funil completo: Novo, Contatado, Proposta, Cliente ou Perdido.</p>
          </div>
        </div>
      </section>

      {/* E-commerce & Marketplace Section */}
      <section id="ecommerce" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto border-t border-[#26262B]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="card-surface p-6 rounded-2xl border border-[#26262B]">
            <div className="flex items-center justify-between border-b border-[#26262B] pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Grid className="w-5 h-5 text-[#3D8BFF]" />
                <span className="font-sora font-bold text-sm text-white">Catálogo de 1.000 Produtos</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-dashed border-[#3D8BFF] text-[#8DBBFF]">
                DEMO
              </span>
            </div>
            <p className="text-xs text-[#8B8B95] leading-relaxed mb-4">
              20 categorias x 50 produtos com foto, SKU único, margem calculada e fornecedor vinculado para testar alta escala de produtos.
            </p>
            <div className="bg-[#18181B] p-3 rounded-xl flex items-center justify-between text-xs">
              <span className="text-white font-medium">Kit Panela Ceramic - Vermelha</span>
              <span className="text-[#2FBF71] font-bold">Margem: 52%</span>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-[#3D8BFF] tracking-wider uppercase">ÁREA 2 — E-COMMERCE</span>
            <h2 className="font-sora text-3xl sm:text-4xl font-extrabold text-white mt-2 mb-4">
              Gestão de Catálogo e Conexão de Marketplaces
            </h2>
            <p className="text-sm text-[#C9C9CF] mb-6 leading-relaxed">
              Cadastre e importe produtos reais por planilha CSV, calcule preços com margem e publique no Mercado Livre via integração oficial OAuth.
            </p>
            <NavLink to="/cadastro" className="btn-primary text-xs font-semibold">
              Explorar E-commerce
            </NavLink>
          </div>
        </div>
      </section>

      {/* Integrações Section */}
      <section id="integracoes" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto border-t border-[#26262B]">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-[#3D8BFF] tracking-wider uppercase">CONEXÕES SEGURAS</span>
          <h2 className="font-sora text-3xl sm:text-4xl font-extrabold text-white mt-2">
            Integrações Oficialmente Preparadas
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Google Places', status: 'API Oficial (Places API New)', icon: Search },
            { name: 'Mercado Livre', status: 'Conexão OAuth 2.0', icon: Layers },
            { name: 'Shopee', status: 'Adaptador de Plataforma', icon: Grid },
            { name: 'Gemini AI', status: 'IA do Google Integrada', icon: Cpu },
          ].map((item) => (
            <div key={item.name} className="card-surface p-5 rounded-xl border border-[#26262B] text-center">
              <item.icon className="w-6 h-6 text-[#3D8BFF] mx-auto mb-2" />
              <h4 className="font-sora font-bold text-sm text-white">{item.name}</h4>
              <p className="text-[10px] text-[#8B8B95] mt-1">{item.status}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="py-20 px-6 lg:px-12 max-w-4xl mx-auto border-t border-[#26262B]">
        <div className="text-center mb-12">
          <HelpCircle className="w-8 h-8 text-[#3D8BFF] mx-auto mb-2" />
          <h2 className="font-sora text-3xl font-extrabold text-white">Perguntas Frequentes (FAQ)</h2>
          <p className="text-xs text-[#8B8B95] mt-2">Respostas diretas e transparentes sobre a RIDE.IA</p>
        </div>

        <div className="space-y-3">
          {faqItems.map((item, idx) => (
            <div key={idx} className="card-surface rounded-xl border border-[#26262B] overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between font-sora text-sm font-semibold text-white hover:text-[#3D8BFF] transition-colors"
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#8B8B95] transition-transform ${
                    openFaq === idx ? 'rotate-180 text-[#3D8BFF]' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-xs text-[#C9C9CF] leading-relaxed border-t border-[#26262B]/50 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#26262B] py-12 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <Logo variant="full" size="sm" />

        <div className="flex items-center gap-6 text-xs text-[#8B8B95]">
          <NavLink to="/entrar" className="hover:text-white">Entrar</NavLink>
          <NavLink to="/cadastro" className="hover:text-white">Criar conta</NavLink>
          <NavLink to="/termos" className="hover:text-white">Termos de Uso</NavLink>
          <NavLink to="/privacidade" className="hover:text-white">Política de Privacidade</NavLink>
        </div>

        <p className="text-xs text-[#5E5E68]">© {new Date().getFullYear()} RIDE.IA. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};
