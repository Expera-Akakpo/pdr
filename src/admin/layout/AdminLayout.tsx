import React, { useState } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { ADMIN_BASE_PATH } from '../config.ts';

export const AdminLayout: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'Tableau de bord', path: ADMIN_BASE_PATH },
    { label: 'Réalisations', path: `${ADMIN_BASE_PATH}/realisations` },
    { label: 'Circuits', path: `${ADMIN_BASE_PATH}/circuits` },
    { label: 'Programme (semaines)', path: `${ADMIN_BASE_PATH}/programme` },
    { label: 'Piliers', path: `${ADMIN_BASE_PATH}/piliers` },
    { label: 'Témoignages', path: `${ADMIN_BASE_PATH}/temoignages` },
    { label: 'Partenaires', path: `${ADMIN_BASE_PATH}/partenaires` },
    { label: 'Statistiques', path: `${ADMIN_BASE_PATH}/statistiques` },
    { label: 'Inscriptions', path: `${ADMIN_BASE_PATH}/inscriptions` },
    { label: 'Messages de contact', path: `${ADMIN_BASE_PATH}/messages`, adminOnly: true },
    { label: 'Newsletter', path: `${ADMIN_BASE_PATH}/newsletter` },
    { label: 'Médiathèque', path: `${ADMIN_BASE_PATH}/medias` },
    { label: 'Utilisateurs', path: `${ADMIN_BASE_PATH}/utilisateurs`, adminOnly: true },
    { label: 'Paramètres', path: `${ADMIN_BASE_PATH}/parametres`, adminOnly: true },
  ];

  const visibleNav = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col md:flex-row text-[#1A1A1A]">
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex flex-col w-64 bg-[#1B2A5E] text-white flex-shrink-0 border-r border-[#131F45]">
        {/* Brand Header */}
        <div className="p-5 border-b border-white/10 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-[#E6B325] text-[#1B2A5E] font-extrabold flex items-center justify-center text-xs">
            PDR
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-white leading-tight">
              Console ProGen
            </h1>
            <span className="text-[10px] text-[#E6B325] uppercase tracking-wider block">
              Pont des Deux Rives
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto text-xs" aria-label="Menu d'administration">
          {visibleNav.map((item) => {
            const isExact = location.pathname === item.path;
            const isSub = item.path !== ADMIN_BASE_PATH && location.pathname.startsWith(item.path);
            const isActive = isExact || isSub;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === ADMIN_BASE_PATH}
                className={`flex items-center px-3 py-2 rounded-md font-medium transition-colors ${
                  isActive
                    ? 'bg-[#131F45] text-[#E6B325] font-bold border-l-2 border-[#E6B325]'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User status in sidebar footer */}
        <div className="p-4 border-t border-white/10 bg-[#131F45]/60 text-xs text-gray-300">
          <div className="font-semibold text-white truncate">{user?.name}</div>
          <div className="text-[10px] text-[#E6B325] capitalize">Rôle : {user?.role}</div>
        </div>
      </aside>

      {/* MOBILE HEADER & DRAWER */}
      <div className="md:hidden bg-[#1B2A5E] text-white p-4 flex items-center justify-between sticky top-0 z-40 border-b border-white/10">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-full bg-[#E6B325] text-[#1B2A5E] font-bold flex items-center justify-center text-xs">
            PDR
          </div>
          <span className="font-bold text-sm">Console Admin</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-1.5 rounded text-gray-300 hover:text-white focus:outline-none"
        >
          <svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 flex">
          <div className="w-64 bg-[#1B2A5E] text-white flex flex-col h-full p-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="font-bold text-sm">Menu Administration</span>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="text-gray-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto text-xs">
              {visibleNav.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === ADMIN_BASE_PATH}
                  onClick={() => setMobileSidebarOpen(false)}
                  className="block px-3 py-2 rounded text-gray-300 hover:text-[#E6B325] hover:bg-white/5"
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setMobileSidebarOpen(false);
                  logout();
                }}
                className="w-full py-2 bg-red-900/60 text-red-200 text-xs font-bold rounded"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-[#E5E7EB] px-6 py-3.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-3">
            <span className="text-xs uppercase font-bold tracking-wider text-gray-400">
              Back-Office ProGen Bénin
            </span>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded border border-[#1B2A5E] text-[#1B2A5E] hover:bg-[#FDF6E3] font-semibold transition-colors"
            >
              <span>Voir le site public</span>
              <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            <button
              type="button"
              onClick={logout}
              className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-colors"
            >
              Se déconnecter
            </button>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
