import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo.tsx';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Accueil', path: '/' },
    { label: 'Nos programmes', path: '/programmes' },
    { label: 'Circuits touristiques', path: '/circuits' },
    { label: 'Réalisations', path: '/realisations' },
    { label: 'Contactez-nous', path: '/contact' },
  ];

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" onClick={closeMenu} className="focus:outline-none">
            <Logo variant="dark" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2" aria-label="Navigation principale">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`px-3.5 py-2 text-[14px] lg:text-[15px] font-medium transition-colors duration-150 relative ${
                    isActive
                      ? 'text-[#1B2A5E] font-bold border-b-2 border-[#1B2A5E]'
                      : 'text-[#4A4A4A] hover:text-[#1B2A5E]'
                  }`}
                >
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Right Action: S'inscrire */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/contact#inscription"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-md font-semibold text-sm bg-[#E6B325] text-[#1B2A5E] hover:bg-[#d4a21d] transition-colors duration-150 shadow-sm"
            >
              S'inscrire
            </Link>
          </div>

          {/* Mobile menu button (simple functional burger) */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-[#1B2A5E] hover:bg-[#F7F7F5] focus:outline-none focus:ring-2 focus:ring-[#E6B325]"
              aria-expanded={mobileMenuOpen}
              aria-label="Ouvrir le menu de navigation"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5E7EB] bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg">
          {navLinks.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                className={`block px-3 py-2.5 rounded-md text-base font-medium transition-colors ${
                  isActive
                    ? 'bg-[#FDF6E3] text-[#1B2A5E] font-bold border-l-4 border-[#E6B325]'
                    : 'text-[#4A4A4A] hover:bg-[#F7F7F5] hover:text-[#1B2A5E]'
                }`}
              >
                {item.label}
              </NavLink>
            );
          })}
          <div className="pt-3 border-t border-[#E5E7EB]">
            <Link
              to="/contact#inscription"
              onClick={closeMenu}
              className="block w-full text-center px-4 py-3 rounded-md font-semibold text-base bg-[#E6B325] text-[#1B2A5E] hover:bg-[#d4a21d]"
            >
              S'inscrire au programme
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
