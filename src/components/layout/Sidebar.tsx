import React from 'react';
import { NavLink } from 'react-router-dom';
import { Logo } from '../ui/Logo';
import {
  LayoutDashboard,
  Search,
  Users,
  FileText,
  Wand2,
  Globe,
  ShoppingBag,
  Grid,
  PackageCheck,
  Truck,
  Layers,
  CheckCircle2,
  ShoppingCart,
  DollarSign,
  Cpu,
  Folder,
  Settings,
  Shield,
  LifeBuoy,
} from 'lucide-react';

interface SidebarProps {
  role?: string;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, className = '' }) => {
  const groups = [
    {
      title: 'VISÃO GERAL',
      items: [
        { label: 'Visão Geral', path: '/app', icon: LayoutDashboard },
      ],
    },
    {
      title: 'SITES & EMPRESAS',
      items: [
        { label: 'Prospecção', path: '/app/prospeccao', icon: Search },
        { label: 'Leads (CRM)', path: '/app/leads', icon: Users },
        { label: 'Propostas', path: '/app/propostas', icon: FileText },
        { label: 'Criador de Sites', path: '/app/criador-de-sites', icon: Wand2 },
        { label: 'Meus Sites', path: '/app/sites', icon: Globe },
      ],
    },
    {
      title: 'E-COMMERCE',
      items: [
        { label: 'Visão Geral', path: '/app/ecommerce', icon: ShoppingBag },
        { label: 'Catálogo', path: '/app/catalogo', icon: Grid },
        { label: 'Meus Produtos', path: '/app/produtos', icon: PackageCheck },
        { label: 'Fornecedores', path: '/app/fornecedores', icon: Truck },
        { label: 'Produtos Publicados', path: '/app/publicados', icon: CheckCircle2 },
        { label: 'Pedidos', path: '/app/pedidos', icon: ShoppingCart },
      ],
    },
    {
      title: 'FINANCEIRO',
      items: [
        { label: 'Vendas', path: '/app/vendas', icon: DollarSign },
      ],
    },
    {
      title: 'SISTEMA',
      items: [
        { label: 'Automação', path: '/app/automacao', icon: Cpu },
        { label: 'Arquivos', path: '/app/arquivos', icon: Folder },
        { label: 'Configurações', path: '/app/configuracoes', icon: Settings },
      ],
    },
  ];

  if (role === 'admin' || role === 'support') {
    groups.push({
      title: 'ADMINISTRAÇÃO',
      items: [
        { label: 'Painel Plataforma', path: '/app/admin/plataforma', icon: Shield },
        { label: 'Painel Operação', path: '/app/admin/operacao', icon: LifeBuoy },
      ],
    });
  }

  return (
    <aside
      className={`w-64 bg-[#09090B] border-r border-[#27272A] flex flex-col h-screen sticky top-0 shrink-0 ${className}`}
    >
      {/* Top Header Logo */}
      <div className="p-5 border-b border-[#27272A]">
        <NavLink to="/app" className="inline-block">
          <Logo variant="full" size="md" />
        </NavLink>
      </div>

      {/* Navigation list */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {groups.map((group) => (
          <div key={group.title}>
            <h4 className="px-3 text-[10px] font-bold text-[#71717A] tracking-wider uppercase mb-2">
              {group.title}
            </h4>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      end={item.path === '/app'}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all relative ${
                          isActive
                            ? 'bg-[#7C3AED]/20 text-[#E9D5FF] font-semibold border border-[#7C3AED]/30'
                            : 'text-[#D4D4D8] hover:bg-[#18181C] hover:text-white'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {/* Active left indicator bar */}
                          {isActive && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#A855F7] rounded-r-full shadow-[0_0_10px_#A855F7]" />
                          )}
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#C084FC]' : 'text-[#A1A1AA]'}`} />
                          <span className="truncate">{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
};
