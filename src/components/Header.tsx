import React from 'react';
import { ScreenTab } from '../types';
import { CURRENT_USER } from '../data/mockData';

interface HeaderProps {
  currentTab: ScreenTab;
  onNavigate: (tab: ScreenTab) => void;
  onOpenNotifications: () => void;
  onOpenSearch: () => void;
  onOpenCarnet?: () => void;
  selectedCampus?: string;
  userAvatar?: string;
  userName?: string;
  isGuest?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  onOpenNotifications,
  onOpenSearch,
  onOpenCarnet,
  userAvatar,
  userName,
  isGuest,
}) => {
  const navLinks: { id: ScreenTab; label: string; icon: string }[] = [
    { id: 'feed', label: 'Feed', icon: 'home' },
    { id: 'grupos', label: 'Grupos', icon: 'groups' },
    { id: 'market', label: 'Market', icon: 'shopping_bag' },
    { id: 'mensajes', label: 'Mensajes', icon: 'chat' },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#faf8ff]/95 backdrop-blur-xl shadow-[0_1px_12px_rgba(19,27,46,0.04)] border-b border-[#eaedff] pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => onNavigate('feed')}
            className="flex items-center gap-2 text-left focus:outline-none group"
            title="Inicio CampusLink"
          >
            <img
              alt="CampusLink Logo"
              className="h-8 w-auto object-contain shrink-0 transition-transform group-hover:scale-105"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6gRafboGZpiXWJibXgTkHN8n4OUwNAZsp9ORX6mac0-TU5lb8hEFJRtxOnZD_xwuY3cj-jsaXKYDgJ0sAfr1Y0po9uTKT7Bt-tX6YCtIFKeCru3NsyG6UMyVm2UYODTUoQb-zXQ4ftQsEP9FNGJyWhqoLp1s5qFzKQTer0hUvF3ugMMu98wt-HBWyvnPMfCFVc5aYMHT9jR_n9X49l2_Su9FRyQNh1n6PE3Wt7id5XPz1FNkuYZbL"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-[18px] font-bold tracking-tight text-[#3525cd] leading-none">
                CampusLink
              </span>
            </div>
          </button>
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-sm mx-2">
          <button
            onClick={onOpenSearch}
            type="button"
            className="w-full flex items-center gap-2.5 px-3.5 py-2 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#464555] rounded-full border border-[#e2e7ff] text-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-[#3525cd]">search</span>
            <span className="truncate text-[11px]">Buscar materias, apuntes, profesores...</span>
            <kbd className="ml-auto text-[10px] bg-white text-[#777587] px-1.5 py-0.5 rounded-md border border-[#eaedff]">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Desktop Navigation Links (Tablet & Desktop) */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-[#3525cd] text-white shadow-xs'
                    : 'text-[#464555] hover:bg-[#eaedff] hover:text-[#131b2e]'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Icons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenCarnet && (
            <button
              onClick={onOpenCarnet}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#6ffbbe]/25 hover:bg-[#6ffbbe]/40 text-[#005338] text-xs font-bold transition-colors"
              title="Mi Carnet Digital"
            >
              <span className="material-symbols-outlined text-[16px]">badge</span>
              <span>Carnet</span>
            </button>
          )}

          <button
            onClick={onOpenSearch}
            aria-label="Buscar"
            className="md:hidden w-10 h-10 rounded-full flex items-center justify-center text-[#464555] hover:bg-[#eaedff] transition-colors active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>

          <button
            onClick={onOpenNotifications}
            aria-label="Notificaciones"
            className="relative w-10 h-10 rounded-full flex items-center justify-center text-[#464555] hover:bg-[#eaedff] transition-colors active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#ba1a1a] ring-2 ring-[#faf8ff]"></span>
          </button>

          {/* User Profile Avatar */}
          <button
            onClick={() => onNavigate('perfil')}
            className={`pl-1 flex items-center gap-2 p-1 rounded-full hover:bg-[#eaedff] transition-all group ${
              currentTab === 'perfil' ? 'ring-2 ring-[#3525cd]' : ''
            }`}
            title="Ver Perfil"
          >
            <div className="relative">
              <img
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-[#4f46e5]/30 group-hover:ring-[#3525cd] transition-all"
                src={userAvatar || CURRENT_USER.avatar}
              />
              {isGuest && (
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-[8px] text-white font-bold" title="Modo Invitado">
                  👁
                </span>
              )}
            </div>
            <span className="hidden lg:inline text-xs font-bold text-[#131b2e] pr-1">
              {isGuest ? 'Invitado' : (userName ? userName.split(' ')[0] : 'Sofía')}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
