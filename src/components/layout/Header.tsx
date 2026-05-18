import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/productos', label: 'Productos' },
  { to: '/categorias', label: 'Categorías' },
  { to: '/ingredientes', label: 'Ingredientes' },
];

export const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? 'text-white font-semibold bg-white/20 px-3 py-1.5 rounded-md transition-all'
      : 'text-blue-100 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-md transition-all';

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-blue-50 text-blue-700'
        : 'text-gray-700 hover:bg-gray-50'
    }`;

  return (
    <header className="relative bg-gradient-to-r from-blue-700 to-blue-500 shadow-lg z-40">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FS</span>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Food Store</span>
          </NavLink>

          <div className="hidden md:flex items-center gap-1">
            {links.map(({ to, label }) => (
              <NavLink key={to} to={to} className={navLinkClass}>
                {label}
              </NavLink>
            ))}
          </div>

          <button
            className="md:hidden p-2 rounded-md text-white hover:bg-white/10 transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menú"
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Dropdown mobile — absoluto, cae fuera del gradiente */}
      {menuOpen && (
        <>
          {/* Backdrop para cerrar al tocar afuera */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setMenuOpen(false)}
          />
          <div className="md:hidden absolute top-full left-0 right-0 z-40 px-4 pt-2 pb-4">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-2 space-y-0.5">
                {links.map(({ to, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={mobileLinkClass}
                    onClick={() => setMenuOpen(false)}
                  >
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
};
