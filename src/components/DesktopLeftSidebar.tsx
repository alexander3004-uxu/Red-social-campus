import React from 'react';
import { ScreenTab } from '../types';
import { CURRENT_USER } from '../data/mockData';

interface DesktopLeftSidebarProps {
  currentTab: ScreenTab;
  onNavigate: (tab: ScreenTab) => void;
  unreadCount?: number;
  onOpenCarnet: () => void;
  onOpenCreatePost: () => void;
  selectedCampus?: string;
  userAvatar?: string;
  userName?: string;
  userCareer?: string;
  isGuest?: boolean;
  onOpenUpgrade?: () => void;
}

export const DesktopLeftSidebar: React.FC<DesktopLeftSidebarProps> = ({
  currentTab,
  onNavigate,
  unreadCount = 0,
  onOpenCarnet,
  onOpenCreatePost,
  selectedCampus,
  userAvatar,
  userName,
  userCareer,
  isGuest,
  onOpenUpgrade,
}) => {
  const navItems: { id: ScreenTab; label: string; icon: string; badge?: number }[] = [
    { id: 'feed', label: 'Feed del Campus', icon: 'home' },
    { id: 'grupos', label: 'Grupos & Materias', icon: 'groups' },
    { id: 'market', label: 'Campus Market', icon: 'shopping_bag' },
    { id: 'mensajes', label: 'Mensajes', icon: 'chat', badge: unreadCount },
    { id: 'perfil', label: 'Mi Perfil Académico', icon: 'person' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 space-y-4 sticky top-20 self-start">
      {/* Student Profile Card */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#eaedff] flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={userAvatar || CURRENT_USER.avatar}
              alt={userName || CURRENT_USER.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-[#3525cd]/20"
            />
            <span
              className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ring-2 ring-white ${
                isGuest ? 'bg-amber-500' : 'bg-[#006e4b]'
              }`}
              title={isGuest ? 'Modo Invitado' : 'En línea en el campus'}
            />
          </div>
          <div className="flex flex-col min-w-0">
            <h3 className="text-sm font-bold text-[#131b2e] truncate">
              {userName || CURRENT_USER.name}
            </h3>
            <span className="text-[11px] text-[#464555] truncate">
              {isGuest ? 'Modo Lectura (Invitado)' : (userCareer || CURRENT_USER.career)}
            </span>
            <span className="text-[10px] text-[#3525cd] font-semibold truncate">
              {selectedCampus || CURRENT_USER.university}
            </span>
          </div>
        </div>

        {/* Action Button: Upgrade or Carnet */}
        {isGuest ? (
          <button
            onClick={onOpenUpgrade}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#3525cd] to-[#712ae2] text-white text-xs font-bold flex items-center justify-center gap-2 hover:opacity-95 active:scale-98 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
            <span>Crear Cuenta Estudiante</span>
          </button>
        ) : (
          <button
            onClick={onOpenCarnet}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#3525cd] to-[#712ae2] text-white text-xs font-bold flex items-center justify-center gap-2 hover:opacity-95 active:scale-98 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">badge</span>
            <span>Ver Carnet Digital NFC</span>
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="bg-white rounded-3xl p-3 shadow-sm border border-[#eaedff] flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-[#3525cd] text-white shadow-sm'
                  : 'text-[#464555] hover:bg-[#f2f3ff] hover:text-[#131b2e]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {!!item.badge && item.badge > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white text-[#3525cd]' : 'bg-[#ba1a1a] text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-2 mt-1 border-t border-[#f2f3ff]">
          <button
            onClick={onOpenCreatePost}
            className="w-full py-2.5 px-3 rounded-2xl bg-[#eaedff] hover:bg-[#dfe4ff] text-[#3525cd] text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Crear Publicación</span>
          </button>
        </div>
      </div>

      {/* Safety and Verification Banner */}
      <div className="bg-[#e2dfff]/40 rounded-3xl p-4 border border-[#eaedff] flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[#0f0069]">
          <span className="material-symbols-outlined text-[18px]">verified_user</span>
          <span className="text-xs font-bold">Comunidad Verificada</span>
        </div>
        <p className="text-[11px] text-[#464555] leading-relaxed">
          Solo estudiantes con correo institucional activo. Entregas en puntos seguros con vigilancia universitaria.
        </p>
      </div>
    </aside>
  );
};
