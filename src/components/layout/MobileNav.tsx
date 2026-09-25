import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Search, Grid, FileText, Menu, X } from 'lucide-react';
import { Sidebar } from './Sidebar';

export const MobileNav: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const mainItems = [
    { label: 'Início', path: '/app', icon: LayoutDashboard },
    { label: 'Empresas', path: '/app/prospeccao', icon: Search },
    { label: 'Catálogo', path: '/app/catalogo', icon: Grid },
    { label: 'Propostas', path: '/app/propostas', icon: FileText },
  ];

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0A0A0B] border-t border-[#26262B] flex items-center justify-around px-2 z-40 backdrop-blur-md bg-opacity-95">
        {mainItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/app'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 w-full h-full text-[10px] font-medium transition-colors ${
                  isActive ? 'text-[#3D8BFF] font-bold' : 'text-[#8B8B95]'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center justify-center gap-1 w-full h-full text-[10px] font-medium text-[#8B8B95] hover:text-white"
        >
          <Menu className="w-5 h-5" />
          <span>Menu</span>
        </button>
      </nav>

      {/* Mobile Menu Drawer */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-[#0A0A0B] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between p-4 border-b border-[#26262B]">
              <span className="font-sora text-sm font-bold text-white">Menu Navegação</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1 text-[#8B8B95] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto" onClick={() => setDrawerOpen(false)}>
              <Sidebar className="w-full border-r-0 h-full" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
