import React from 'react';
import { ScreenTab } from '../types';
import { CURRENT_USER } from '../data/mockData';

interface BottomNavProps {
  currentTab: ScreenTab;
  onNavigate: (tab: ScreenTab) => void;
  unreadMessagesCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onNavigate,
  unreadMessagesCount = 3,
}) => {
  if (currentTab === 'login') return null;

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#faf8ff]/90 backdrop-blur-xl shadow-[0_-4px_20px_rgba(19,27,46,0.06)] border-t border-[#eaedff]">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
        {/* Feed Tab */}
        <button
          onClick={() => onNavigate('feed')}
          aria-current={currentTab === 'feed' ? 'page' : undefined}
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[44px] transition-colors ${
            currentTab === 'feed'
              ? 'text-[#3525cd] font-bold'
              : 'text-[#464555] hover:text-[#131b2e]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[24px]"
            style={{
              fontVariationSettings: currentTab === 'feed' ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            home
          </span>
          <span className="text-[10px] font-bold">Feed</span>
        </button>

        {/* Grupos Tab */}
        <button
          onClick={() => onNavigate('grupos')}
          aria-current={currentTab === 'grupos' ? 'page' : undefined}
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[44px] transition-colors ${
            currentTab === 'grupos'
              ? 'text-[#3525cd] font-bold'
              : 'text-[#464555] hover:text-[#131b2e]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[24px]"
            style={{
              fontVariationSettings: currentTab === 'grupos' ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            groups
          </span>
          <span className="text-[10px] font-bold">Grupos</span>
        </button>

        {/* Market Tab */}
        <button
          onClick={() => onNavigate('market')}
          aria-current={currentTab === 'market' ? 'page' : undefined}
          className={`relative flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[44px] transition-colors ${
            currentTab === 'market'
              ? 'text-[#3525cd] font-bold'
              : 'text-[#464555] hover:text-[#131b2e]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[24px]"
            style={{
              fontVariationSettings: currentTab === 'market' ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            shopping_bag
          </span>
          <span className="text-[10px] font-bold">Market</span>
          <span className="absolute top-1 right-2 px-1 py-0.2 rounded-full bg-[#712ae2] text-white text-[9px] font-bold leading-none shadow-xs">
            HOT
          </span>
        </button>

        {/* Mensajes Tab */}
        <button
          onClick={() => onNavigate('mensajes')}
          aria-current={currentTab === 'mensajes' ? 'page' : undefined}
          className={`relative flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[44px] transition-colors ${
            currentTab === 'mensajes'
              ? 'text-[#3525cd] font-bold'
              : 'text-[#464555] hover:text-[#131b2e]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[24px]"
            style={{
              fontVariationSettings: currentTab === 'mensajes' ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            forum
          </span>
          <span className="text-[10px] font-bold">Mensajes</span>
          {unreadMessagesCount > 0 && (
            <span className="absolute top-1 right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#3525cd] text-white text-[10px] font-bold flex items-center justify-center leading-none shadow-xs">
              {unreadMessagesCount}
            </span>
          )}
        </button>

        {/* Perfil Tab */}
        <button
          onClick={() => onNavigate('perfil')}
          aria-current={currentTab === 'perfil' ? 'page' : undefined}
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[44px] transition-colors ${
            currentTab === 'perfil'
              ? 'text-[#3525cd] font-bold'
              : 'text-[#464555] hover:text-[#131b2e]'
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full overflow-hidden ring-1 ${
              currentTab === 'perfil' ? 'ring-[#3525cd] ring-2' : 'ring-[#c7c4d8]'
            }`}
          >
            <img
              alt="Profile"
              className="w-full h-full object-cover"
              src={CURRENT_USER.avatar}
            />
          </div>
          <span className="text-[10px] font-bold">Perfil</span>
        </button>
      </div>
    </nav>
  );
};
