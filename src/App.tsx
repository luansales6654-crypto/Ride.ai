import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import { AppLayout } from './components/layout/AppLayout';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { OnboardingPage } from './pages/auth/OnboardingPage';

import { Dashboard } from './pages/Dashboard';
import { ProspeccaoPage } from './pages/ProspeccaoPage';
import { LeadsPage } from './pages/LeadsPage';
import { PropostasPage } from './pages/PropostasPage';
import { ProposalPublicPage } from './pages/ProposalPublicPage';
import { CriadorSitesPage } from './pages/CriadorSitesPage';
import { MeusSitesPage } from './pages/MeusSitesPage';
import { EcommerceOverviewPage } from './pages/EcommerceOverviewPage';
import { CatalogoPage } from './pages/CatalogoPage';
import { MeusProdutosPage } from './pages/MeusProdutosPage';
import { FornecedoresPage } from './pages/FornecedoresPage';
import { IntegracoesPage } from './pages/IntegracoesPage';
import { ProdutosPublicadosPage } from './pages/ProdutosPublicadosPage';
import { PedidosPage } from './pages/PedidosPage';
import { VendasPage } from './pages/VendasPage';
import { AutomacaoPage } from './pages/AutomacaoPage';
import { ArquivosPage } from './pages/ArquivosPage';
import { ConfiguracoesPage } from './pages/ConfiguracoesPage';
import { NotificacoesPage } from './pages/NotificacoesPage';
import { TermosPage } from './pages/TermosPage';
import { PrivacidadePage } from './pages/PrivacidadePage';
import { AdminPlataformaPage } from './pages/admin/AdminPlataformaPage';
import { AdminOperacaoPage } from './pages/admin/AdminOperacaoPage';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Entry & Public Routes -> Direct Access to /app */}
          <Route path="/" element={<Navigate to="/app" replace />} />
          <Route path="/entrar" element={<Navigate to="/app" replace />} />
          <Route path="/cadastro" element={<Navigate to="/app" replace />} />
          <Route path="/recuperar-senha" element={<Navigate to="/app" replace />} />
          <Route path="/onboarding" element={<Navigate to="/app" replace />} />
          <Route path="/termos" element={<TermosPage />} />
          <Route path="/privacidade" element={<PrivacidadePage />} />
          <Route path="/p/:token" element={<ProposalPublicPage />} />


          {/* Protected Application Routes */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="prospeccao" element={<ProspeccaoPage />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="propostas" element={<PropostasPage />} />
            <Route path="criador-de-sites" element={<CriadorSitesPage />} />
            <Route path="sites" element={<MeusSitesPage />} />
            <Route path="ecommerce" element={<EcommerceOverviewPage />} />
            <Route path="catalogo" element={<CatalogoPage />} />
            <Route path="produtos" element={<MeusProdutosPage />} />
            <Route path="fornecedores" element={<FornecedoresPage />} />
            <Route path="integracoes" element={<Navigate to="/app/configuracoes" replace />} />
            <Route path="publicados" element={<ProdutosPublicadosPage />} />
            <Route path="pedidos" element={<PedidosPage />} />
            <Route path="vendas" element={<VendasPage />} />
            <Route path="automacao" element={<AutomacaoPage />} />
            <Route path="arquivos" element={<ArquivosPage />} />
            <Route path="configuracoes" element={<ConfiguracoesPage />} />
            <Route path="notificacoes" element={<NotificacoesPage />} />
            <Route path="admin/plataforma" element={<AdminPlataformaPage />} />
            <Route path="admin/operacao" element={<AdminOperacaoPage />} />
          </Route>

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
