import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Bell, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../database/firebase';

interface TopbarProps {
  userName?: string;
  userEmail?: string;
  unreadNotificationsCount?: number;
}

export const Topbar: React.FC<TopbarProps> = ({
  userName = 'Usuário',
  userEmail = '',
  unreadNotificationsCount = 0,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getPageTitle = (pathname: string) => {
    if (pathname === '/app') return 'Visão Geral (Faturamento)';
    if (pathname.startsWith('/app/prospeccao')) return 'Prospecção de Empresas';
    if (pathname.startsWith('/app/leads')) return 'CRM de Leads';
    if (pathname.startsWith('/app/propostas')) return 'Propostas Comerciais';
    if (pathname.startsWith('/app/criador-de-sites')) return 'Criador de Sites & Prompt Mestre';
    if (pathname.startsWith('/app/sites')) return 'Meus Sites';
    if (pathname.startsWith('/app/ecommerce')) return 'E-commerce & Marketplace';
    if (pathname.startsWith('/app/catalogo')) return 'Catálogo de Produtos (1.000 itens)';
    if (pathname.startsWith('/app/produtos')) return 'Meus Produtos';
    if (pathname.startsWith('/app/fornecedores')) return 'Fornecedores';
    if (pathname.startsWith('/app/integracoes')) return 'Integrações & Marketplaces';
    if (pathname.startsWith('/app/publicados')) return 'Produtos Publicados';
    if (pathname.startsWith('/app/pedidos')) return 'Pedidos do Marketplace';
    if (pathname.startsWith('/app/vendas')) return 'Gestão de Vendas';
    if (pathname.startsWith('/app/automacao')) return 'Automações e Logs';
    if (pathname.startsWith('/app/arquivos')) return 'Arquivos & Documentos';
    if (pathname.startsWith('/app/configuracoes')) return 'Configurações da Plataforma';
    if (pathname.startsWith('/app/notificacoes')) return 'Central de Notificações';
    if (pathname.startsWith('/app/admin/plataforma')) return 'Painel Admin — Plataforma';
    if (pathname.startsWith('/app/admin/operacao')) return 'Painel Admin — Operação';
    return 'RIDE.IA';
  };

  const handleResetSession = () => {
    navigate('/app');
  };


  return (
    <header className="h-16 bg-[#0A0A0B] border-b border-[#26262B] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="font-sora text-base sm:text-lg font-bold text-white truncate">
          {getPageTitle(location.pathname)}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications Bell */}
        <NavLink
          to="/app/notificacoes"
          className="relative w-10 h-10 rounded-xl bg-[#111113] border border-[#26262B] hover:border-[#3D8BFF]/40 text-[#C9C9CF] hover:text-white flex items-center justify-center transition-all"
          title="Notificações"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#1769FF] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-[0_0_8px_#1769FF]">
              {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
            </span>
          )}
        </NavLink>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-[#111113] border border-[#26262B] hover:border-[#3D8BFF]/40 text-left transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-[#0D347A] border border-[#3D8BFF]/40 text-[#3D8BFF] flex items-center justify-center font-sora font-bold text-xs uppercase">
              {userName.slice(0, 2)}
            </div>
            <div className="hidden sm:block text-xs">
              <p className="font-semibold text-white truncate max-w-[120px]">{userName}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#8B8B95]" />
          </button>

          {userMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-[#111113] border border-[#26262B] rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95"
              onClick={() => setUserMenuOpen(false)}
            >
              <div className="px-4 py-2.5 border-b border-[#26262B]">
                <p className="text-xs font-bold text-white truncate">{userName}</p>
                <p className="text-[11px] text-[#8B8B95] truncate">{userEmail}</p>
              </div>

              <NavLink
                to="/app/configuracoes"
                className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#C9C9CF] hover:text-white hover:bg-[#18181B] transition-colors"
              >
                <Settings className="w-4 h-4 text-[#8B8B95]" />
                Configurações
              </NavLink>

              <button
                onClick={handleResetSession}
                className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs text-[#3D8BFF] hover:bg-[#1769FF]/10 transition-colors border-t border-[#26262B] mt-1 font-semibold"
              >
                <Settings className="w-4 h-4" />
                Painel Principal
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
