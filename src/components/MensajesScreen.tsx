import React, { useState } from 'react';
import { ChatThread } from '../types';

interface MensajesScreenProps {
  chats: ChatThread[];
  onSelectChat: (chat: ChatThread) => void;
  onOpenNewChatModal: () => void;
}

export const MensajesScreen: React.FC<MensajesScreenProps> = ({
  chats,
  onSelectChat,
  onOpenNewChatModal,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'grupos' | 'directos' | 'market'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const activeCampusUsers = [
    {
      name: 'Mateo S.',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtb9b4zzzvwKITUqbWGkuxZHLdxSLMk9_1yvlvYEhC8FX9ziGREf-YduFUkrzzaxB_QjX1RBt_CGqZBK2nnihbfqpmibOkDSsf_KtYrwFAvFPF_MYlcIwRQU4ntGCr0rjsS46MYEXjuMQhaYMBn0KotM7MXBem9f8viC68Q6ghZ7JVCXVQjMySjYsZGysPSV70oql8JLOgnp2VWsh4cs7Bbz7Cug-1VDP56ayBfPIseCXv2iKd_1c1',
      online: true,
    },
    {
      name: 'Lucía G.',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSIAEbk8Wz8xDSwmI7zKMxia2KFH0zyDW3AUuWhrKbCEDSp_Wh8Dsqyx39c0nfMpWDQGFTyBV-LxrZU7ClidPmudhzGDZ-Bp-53j0hglv9klDua-LpuOxM-uWX2cWAUT07z6HZsuYLdG651mU409GocJsrJ9TnYA1ZihVSYvEsHi5eQ5814vvfYr4mLNTyuTjKRAKTBdugiGjPj0SPGSErGHPBdiTvq3ICa1BFcJQobwjtdIBSVls4',
      online: true,
    },
    {
      name: 'Carlos M.',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8WhNYG8JTEzG9a_WGy_5j2aagwcLnBpDQAP5-cy43xccE2eMhc9rtBXcKO2Y4zlRzfAX46WEIWm3rIeMxQF4xP7xyGABDpPpFhhKyNr5X4Wn03HoFDgdU7eU5JArnDrT-4k8_2mJZC5vOGyJicXtS8CDO2ZlC3B6ARtAgOhzyt1CHDjxrN0l2rkfNuwOnBsqkkXlmLPY9ur8S9HeTcd17QeMnb1vLPhpRBGTp9PqkWGjfd1eegD1J',
      online: true,
    },
    {
      name: 'Valeria R.',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbSCeWZbjuuVjqpp9HbSi88rI-1u15FV7J8DeymlHvxr-nck4-e-CqXoiZ72yewaDv6znbuLoYkVLwLXQlySJxWBKj6OTLLChVdFmMTv4RfaVQQmjEXPsGtjwKlRqWYPhSfD6VuN-FpPfSAJRQ6KCO9D_XK_Pw9GUAlNusyT_3gLKfMtDxkCBJmzEcFlZrFXdRdxrwRU0lRJIsjGI0KWm4DWgtsNICcIuGnDtRU0rDyNrfHmHAd9Bf',
      online: true,
    },
    {
      name: 'Andrés F.',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdVsSHniqEUQrI159P9249GqsSCJLXaVprYKlTx6_-o0ZdOO6LFf9a0ok7sdQCvqEM-pCy3S0zV6J6eT14Eq2tAg0d27O34QjTPi7YCakTbWJQMKMCvvGk8pf9X1gvDS5YvxCSfP5mRmCeaBPhDwd6H9uMj4W2GKn7AVoL-xDZIZXaaJQN9nldhtQGnG6R5i48rEBFVfKtk727Or7o8KVQVL6vvy0beYxSsT8b8qGZ5o3BzFkna7WB',
      online: true,
    },
  ];

  const filteredChats = chats.filter((c) => {
    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'market' && c.category === 'market') ||
      (activeFilter === 'grupos' && c.category === 'grupos') ||
      (activeFilter === 'directos' && c.category === 'directos');

    const matchesSearch =
      !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.productInfo?.name.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex flex-col w-full mx-auto pt-1 pb-20 md:pb-8 relative">
      {/* Search & Action Bar */}
      <div className="px-4 pt-1 pb-2">
        <div className="relative flex items-center w-full">
          <span className="material-symbols-outlined absolute left-3.5 text-[#464555] text-[20px] pointer-events-none">
            search
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-10 rounded-xl bg-[#f2f3ff] text-[#131b2e] text-xs placeholder:text-[#464555]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3525cd]/20 transition-all border border-[#eaedff]"
            placeholder="Buscar chats, grupos o por carnet..."
            type="text"
          />
          <button
            className="absolute right-2.5 p-1 rounded-lg text-[#464555] hover:text-[#3525cd] transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">tune</span>
          </button>
        </div>
      </div>

      {/* Active on Campus Stories / Rail */}
      <div className="py-2 flex flex-col gap-2">
        <div className="px-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-[#005236] animate-pulse"></span>
            <span className="text-xs text-[#131b2e] font-bold tracking-tight">
              En el campus ahora
            </span>
          </div>
          <span className="text-[10px] text-[#3525cd] font-semibold">18 activos</span>
        </div>

        {/* Horizontal scroll rail */}
        <div className="flex items-center gap-3.5 overflow-x-auto px-4 py-1 no-scrollbar">
          {/* Create Story / Status pill */}
          <div
            onClick={onOpenNewChatModal}
            className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group"
          >
            <div className="relative w-14 h-14 rounded-full bg-[#e2e7ff] flex items-center justify-center group-active:scale-95 transition-transform">
              <span className="material-symbols-outlined text-[#3525cd] text-[24px]">
                add
              </span>
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#3525cd] text-white flex items-center justify-center font-bold text-[10px] shadow-xs">
                +
              </span>
            </div>
            <span className="text-[10px] font-semibold text-[#464555] truncate max-w-[58px]">
              Mi estado
            </span>
          </div>

          {/* Active Users */}
          {activeCampusUsers.map((user, idx) => (
            <div
              key={idx}
              onClick={() => {
                const existing = chats.find((c) => c.name.includes(user.name.split(' ')[0]));
                if (existing) onSelectChat(existing);
              }}
              className="flex flex-col items-center gap-1 shrink-0 cursor-pointer active:scale-95 transition-transform"
            >
              <div className="relative w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-[#3525cd] to-[#712ae2]">
                <div className="w-full h-full rounded-full overflow-hidden bg-[#faf8ff]">
                  <img
                    className="w-full h-full object-cover"
                    src={user.avatar}
                    alt={user.name}
                  />
                </div>
                <span className="absolute bottom-0 right-0.5 w-3.5 h-3.5 rounded-full bg-[#006e4b] ring-2 ring-white"></span>
              </div>
              <span className="text-[10px] font-semibold text-[#131b2e] truncate max-w-[62px]">
                {user.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Category Tabs */}
      <div className="mt-1 px-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 py-1">
          <button
            onClick={() => setActiveFilter('all')}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xs transition-all ${
              activeFilter === 'all'
                ? 'bg-[#3525cd] text-white'
                : 'bg-[#eaedff] text-[#464555] hover:bg-[#dae2fd]'
            }`}
            type="button"
          >
            Todos
          </button>
          <button
            onClick={() => setActiveFilter('grupos')}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeFilter === 'grupos'
                ? 'bg-[#3525cd] text-white shadow-xs'
                : 'bg-[#eaedff] text-[#464555] hover:bg-[#dae2fd]'
            }`}
            type="button"
          >
            Grupos de Materia
          </button>
          <button
            onClick={() => setActiveFilter('directos')}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeFilter === 'directos'
                ? 'bg-[#3525cd] text-white shadow-xs'
                : 'bg-[#eaedff] text-[#464555] hover:bg-[#dae2fd]'
            }`}
            type="button"
          >
            Compañeros
          </button>
          <button
            onClick={() => setActiveFilter('market')}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeFilter === 'market'
                ? 'bg-[#3525cd] text-white shadow-xs'
                : 'bg-[#eaedff] text-[#464555] hover:bg-[#dae2fd]'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[15px] text-[#712ae2]">
              storefront
            </span>
            <span>Negociaciones Market</span>
            <span className="w-4 h-4 rounded-full bg-[#712ae2] text-white text-[10px] font-bold inline-flex items-center justify-center leading-none">
              2
            </span>
          </button>
        </div>
      </div>

      {/* Quick Pinned Safe Delivery Banner */}
      <div className="mx-4 mt-3 p-3 rounded-2xl bg-gradient-to-r from-[#e2dfff] to-[#dae2fd] flex items-center justify-between shadow-xs border border-[#c7c4d8]/40">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#3525cd]/10 text-[#3525cd] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-[#0f0069] truncate">
              Puntos de Entrega Seguros
            </span>
            <span className="text-[10px] text-[#464555] truncate">
              Hall Biblioteca & Edificio C verificados
            </span>
          </div>
        </div>
        <span className="material-symbols-outlined text-[#3525cd] shrink-0 text-[18px]">
          chevron_right
        </span>
      </div>

      {/* Chat List Container */}
      <div className="flex flex-col px-4 mt-3.5 space-y-2.5">
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat)}
            className="p-3 rounded-2xl bg-white hover:bg-[#f2f3ff] transition-all duration-150 shadow-xs border border-[#eaedff] flex items-center gap-3 relative overflow-hidden cursor-pointer active:scale-[0.99]"
          >
            {/* Avatar / Icon Container */}
            <div className="relative shrink-0">
              {chat.avatar ? (
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-[#eaedff]">
                  <img
                    className="w-full h-full object-cover"
                    src={chat.avatar}
                    alt={chat.name}
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-[#e2dfff] flex items-center justify-center text-[#0f0069]">
                  <span className="material-symbols-outlined text-[24px]">school</span>
                </div>
              )}

              {/* Badge Icon (Market / Verified / Group) */}
              {chat.badgeType === 'market' && (
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#8a4cfc] text-white flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[12px]">shopping_bag</span>
                </span>
              )}

              {chat.badgeType === 'oficial' && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#005338] text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[10px]">verified</span>
                </span>
              )}

              {chat.category === 'directos' && chat.isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#006e4b] ring-2 ring-white"></span>
              )}
            </div>

            {/* Chat Text Info */}
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h3 className="text-xs font-bold text-[#131b2e] truncate">
                    {chat.name}
                  </h3>
                  {chat.badge && (
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        chat.badgeType === 'market'
                          ? 'bg-[#eaddff] text-[#25005a]'
                          : chat.badgeType === 'oficial'
                          ? 'bg-[#e2dfff] text-[#0f0069]'
                          : 'bg-[#dae2fd] text-[#3323cc]'
                      }`}
                    >
                      {chat.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-[#3525cd] font-bold shrink-0">
                  {chat.time}
                </span>
              </div>

              {/* Product Info pill if Market chat */}
              {chat.productInfo && (
                <div className="flex items-center gap-1 text-[#712ae2] text-[10px] font-bold mb-0.5">
                  <span className="material-symbols-outlined text-[14px]">
                    {chat.productInfo.icon}
                  </span>
                  <span className="truncate">{chat.productInfo.name}</span>
                  {chat.productInfo.price && <span>(${chat.productInfo.price})</span>}
                </div>
              )}

              {/* Group code if Group chat */}
              {chat.groupInfo && (
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-[#e2e7ff] text-[#464555] text-[9px] font-bold">
                    {chat.groupInfo.code}
                  </span>
                  <span className="text-[10px] text-[#464555]">
                    {chat.groupInfo.members} integrantes
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <p className="text-[11px] text-[#464555] truncate pr-2 font-normal">
                  {chat.lastMessage}
                </p>

                {chat.unreadCount ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3525cd] shrink-0 animate-pulse"></span>
                ) : (
                  <span className="material-symbols-outlined text-[16px] text-[#3525cd] shrink-0">
                    done_all
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredChats.length === 0 && (
          <div className="flex flex-col items-center justify-center px-8 py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-[#eaedff] flex items-center justify-center text-[#3525cd] mb-3">
              <span className="material-symbols-outlined text-[32px]">forum</span>
            </div>
            <h4 className="text-sm font-bold text-[#131b2e] mb-1">
              Sin conversaciones en esta categoría
            </h4>
            <p className="text-xs text-[#464555]">
              Inicia un nuevo chat con tus compañeros o busca por carnet universitario.
            </p>
          </div>
        )}
      </div>

      {/* Floating Action Button for New Chat */}
      <div className="fixed right-4 bottom-20 z-40 max-w-md mx-auto">
        <button
          onClick={onOpenNewChatModal}
          aria-label="Nuevo mensaje"
          className="flex items-center gap-2 h-13 pl-4 pr-5 rounded-full bg-gradient-to-r from-[#4f46e5] to-[#712ae2] text-white shadow-[0_8px_24px_-4px_rgba(79,70,229,0.35)] active:scale-95 transition-all duration-200 hover:brightness-110"
          type="button"
        >
          <span className="material-symbols-outlined text-[22px]">chat</span>
          <span className="text-xs font-bold">Nuevo Chat</span>
        </button>
      </div>
    </div>
  );
};
