import { useState, useEffect } from 'react';
import { ScreenTab, Post, Story, MarketItem, LiveRoom, CommunityGroup, ChatThread } from './types';

import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { LoginScreen } from './components/LoginScreen';
import { FeedScreen } from './components/FeedScreen';
import { MarketScreen } from './components/MarketScreen';
import { GruposScreen } from './components/GruposScreen';
import { MensajesScreen } from './components/MensajesScreen';
import { PerfilScreen } from './components/PerfilScreen';
import { CarnetModal } from './components/CarnetModal';
import { ChatModal } from './components/ChatModal';
import { StoryViewerModal } from './components/StoryViewerModal';
import { PdfViewerModal } from './components/PdfViewerModal';
import { CreatePostModal } from './components/CreatePostModal';
import { SellModal } from './components/SellModal';
import { ItemDetailModal } from './components/ItemDetailModal';
import { LiveRoomModal } from './components/LiveRoomModal';
import { SearchModal } from './components/SearchModal';
import { NotificationsModal } from './components/NotificationsModal';
import { DesktopLeftSidebar } from './components/DesktopLeftSidebar';
import { DesktopRightSidebar } from './components/DesktopRightSidebar';
import { UniversitySelectModal } from './components/UniversitySelectModal';
import { GuestUpgradeModal } from './components/GuestUpgradeModal';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { socketClient } from './services/socketClient';
import { supabaseDataService } from './services/supabaseDataService';
import { apiClient } from './services/apiClient';

function CampusApp() {
  const {
    user,
    profile,
    token,
    isAuthenticated,
    isGuest,
    isInitialLoading,
    isUpgradeModalOpen,
    upgradeModalFeature,
    closeUpgradeModal,
    openUpgradeModal,
    requireAuthAction,
  } = useAuth();

  // Pantalla activa actual
  const [currentTab, setCurrentTab] = useState<ScreenTab>('feed');

  // Universidad seleccionada
  const [selectedCampus, setSelectedCampus] = useState<string>(() => {
    try {
      return (
        profile?.university ||
        localStorage.getItem('campuslink_user_university') ||
        'Universidad Central (Sede Principal)'
      );
    } catch {
      return 'Universidad Central (Sede Principal)';
    }
  });

  const [showUniversitySelectModal, setShowUniversitySelectModal] = useState<boolean>(() => {
    try {
      return !localStorage.getItem('campuslink_university_confirmed');
    } catch {
      return false;
    }
  });

  const handleConfirmUniversity = (university: string) => {
    setSelectedCampus(university);
    try {
      localStorage.setItem('campuslink_user_university', university);
      localStorage.setItem('campuslink_university_confirmed', 'true');
    } catch (e) {
      console.warn('Storage unavailable', e);
    }
    setShowUniversitySelectModal(false);
    showToast(`¡${university} vinculada a tu perfil y carnet digital!`);
  };

  // Conexión WebSockets cuando hay token y no es invitado
  useEffect(() => {
    if (token && !isGuest) {
      const serverUrl = window.location.origin;
      try {
        socketClient.connect(serverUrl, token);
      } catch (err) {
        console.warn('[Socket] No se pudo inicializar cliente socket:', err);
      }
    }
  }, [token, isGuest]);

  // App Data State
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [marketItems, setMarketItems] = useState<MarketItem[]>([]);
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [liveRooms, setLiveRooms] = useState<LiveRoom[]>([]);
  const [chats, setChats] = useState<ChatThread[]>([]);

  // Sincronización en tiempo real con Supabase
  useEffect(() => {
    let active = true;

    const refreshPosts = async () => {
      if (!user?.id) return;
      try {
        const result = await apiClient.social.fetchPosts();
        if (active && result?.success) setPosts(Array.isArray(result.posts) ? result.posts : []);
      } catch (e) {
        console.warn('[Social] No se pudieron actualizar las publicaciones:', e);
      }
    };

    async function loadData() {
      try {
        const [dbStories, dbMarket, dbGroups, dbChats] = await Promise.all([
          supabaseDataService.fetchStories(),
          supabaseDataService.fetchMarketItems(user?.id),
          supabaseDataService.fetchGroups(user?.id),
          supabaseDataService.fetchChats(),
        ]);

        if (active) {
          if (dbStories?.length) setStories(dbStories);
          if (dbMarket?.length) setMarketItems(dbMarket);
          if (dbGroups?.length) setGroups(dbGroups);
          if (dbChats?.length) setChats(dbChats);
        }
      } catch (e) {
        console.warn('[Supabase] Usando datos locales:', e);
      }
    }

    loadData();
    refreshPosts();
    const postRefreshTimer = window.setInterval(refreshPosts, 15000);

    // Suscripciones Realtime para los demás módulos respaldados por Supabase.
    const unsubStories = supabaseDataService.subscribeToStories(
      (newStory) => setStories((prev) => prev.some((s) => s.id === newStory.id) ? prev : [newStory, ...prev])
    );

    const unsubMarket = supabaseDataService.subscribeToMarket(
      (newItem) => setMarketItems((prev) => prev.some((i) => i.id === newItem.id) ? prev : [newItem, ...prev]),
      (updItem) => setMarketItems((prev) => prev.map((i) => i.id === updItem.id ? { ...i, ...updItem } : i))
    );

    const unsubGroups = supabaseDataService.subscribeToGroups(
      (updGroup) => setGroups((prev) => prev.map((g) => g.id === updGroup.id ? { ...g, ...updGroup } : g))
    );

    const unsubChat = supabaseDataService.subscribeToChat(
      (incomingMsg) => {
        setChats((prev) =>
          prev.map((thread) => {
            if (thread.id === incomingMsg.thread_id) {
              if (thread.messages.some((m) => m.id === incomingMsg.id)) return thread;
              return {
                ...thread,
                lastMessage: incomingMsg.text,
                time: incomingMsg.time || 'Ahora',
                messages: [
                  ...thread.messages,
                  {
                    id: incomingMsg.id,
                    sender: incomingMsg.sender,
                    text: incomingMsg.text,
                    time: incomingMsg.time || 'Ahora',
                  },
                ],
              };
            }
            return thread;
          })
        );
      },
      (updThread) => {
        setChats((prev) =>
          prev.map((t) => t.id === updThread.id ? { ...t, lastMessage: updThread.last_message, time: updThread.time } : t)
        );
      }
    );

    return () => {
      active = false;
      window.clearInterval(postRefreshTimer);
      unsubStories();
      unsubMarket();
      unsubGroups();
      unsubChat();
    };
  }, [user?.id]);

  // Modal States
  const [isCarnetOpen, setIsCarnetOpen] = useState(false);
  const [activeChat, setActiveChat] = useState<ChatThread | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [pdfModalData, setPdfModalData] = useState<{ isOpen: boolean; title: string; content?: string }>({
    isOpen: false,
    title: '',
  });
  const [createPostModal, setCreatePostModal] = useState<{ isOpen: boolean; type?: 'text' | 'pdf' | 'poll' | 'photo' }>({
    isOpen: false,
  });
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [selectedItemDetail, setSelectedItemDetail] = useState<MarketItem | null>(null);
  const [activeLiveRoom, setActiveLiveRoom] = useState<LiveRoom | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Toast System
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle Manifest Shortcut Actions (e.g. ?action=create_post)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    if (action) {
      if (action === 'create_post') {
        setCurrentTab('feed');
        setCreatePostModal({ isOpen: true, type: 'text' });
      } else if (action === 'messages') {
        setCurrentTab('mensajes');
      } else if (action === 'market') {
        setCurrentTab('market');
      } else if (action === 'carnet') {
        setCurrentTab('feed');
        setIsCarnetOpen(true);
      }
    }
  }, []);

  // Interacciones: Feed protegidas con guard de invitado
  const handleToggleLike = (postId: string) => {
    requireAuthAction(() => {
      const currentPost = posts.find((post) => post.id === postId);
      if (!currentPost) return;
      const nextLiked = !currentPost.isLiked;
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              isLiked: nextLiked,
              likes: Math.max(0, p.likes + (nextLiked ? 1 : -1)),
            };
          }
          return p;
        })
      );
      void apiClient.social.setPostLike(postId, nextLiked)
        .then((result) => {
          if (!result?.success) throw new Error('No se pudo guardar el me gusta.');
          setPosts((prev) => prev.map((post) => post.id === postId
            ? { ...post, isLiked: Boolean(result.isLiked), likes: Number(result.likes) || 0 }
            : post));
        })
        .catch(() => setPosts((prev) => prev.map((post) => post.id === postId
          ? { ...post, isLiked: currentPost.isLiked, likes: currentPost.likes }
          : post)));
    }, 'dar me gusta a publicaciones');
  };

  const handleToggleSave = (postId: string) => {
    requireAuthAction(() => {
      let nextSaved = false;
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            nextSaved = !p.isSaved;
            return { ...p, isSaved: nextSaved };
          }
          return p;
        })
      );
      supabaseDataService.toggleSavePost(postId, user?.id || 'guest', nextSaved);
      showToast('Publicación guardada en tu perfil');
    }, 'guardar publicaciones en tu perfil');
  };

  const handleVotePoll = (postId: string, optionId: string) => {
    requireAuthAction(() => {
      let updatedPoll: any = null;
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId && p.poll) {
            const alreadyVoted = p.poll.userVotedOption === optionId;
            const updatedOptions = p.poll.options.map((opt) => {
              if (opt.id === optionId) {
                return { ...opt, votes: alreadyVoted ? opt.votes - 1 : opt.votes + 1 };
              }
              if (p.poll?.userVotedOption === opt.id) {
                return { ...opt, votes: opt.votes - 1 };
              }
              return opt;
            });
            const totalVotes = updatedOptions.reduce((acc, curr) => acc + curr.votes, 0);

            updatedPoll = {
              ...p.poll,
              totalVotes,
              userVotedOption: alreadyVoted ? undefined : optionId,
              options: updatedOptions,
            };

            return {
              ...p,
              poll: updatedPoll,
            };
          }
          return p;
        })
      );
      if (updatedPoll) supabaseDataService.updatePostPoll(postId, updatedPoll);
      showToast('Tu voto ha sido registrado');
    }, 'votar en encuestas académicas');
  };

  const handleToggleEventRsvp = (postId: string) => {
    requireAuthAction(() => {
      let updatedEvent: any = null;
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId && p.event) {
            const nextAttending = !p.event.isAttending;
            updatedEvent = {
              ...p.event,
              isAttending: nextAttending,
              attendeesCount: nextAttending ? p.event.attendeesCount + 1 : p.event.attendeesCount - 1,
            };
            return {
              ...p,
              event: updatedEvent,
            };
          }
          return p;
        })
      );
      if (updatedEvent) supabaseDataService.updatePostEvent(postId, updatedEvent);
      showToast('¡Asistencia confirmada para el evento del campus!');
    }, 'confirmar asistencia a eventos del campus');
  };

  const handleOpenPdf = (title: string, content?: string) => {
    setPdfModalData({
      isOpen: true,
      title,
      content,
    });
  };

  const handleOpenStory = (story: Story) => {
    if (story.isAdd) {
      requireAuthAction(() => {
        setCreatePostModal({ isOpen: true, type: 'photo' });
      }, 'subir una historia al campus');
    } else {
      setActiveStory(story);
      setIsStoryOpen(true);
    }
  };

  // Interacciones: Market
  const handleToggleMarketFav = (itemId: string) => {
    requireAuthAction(() => {
      let nextFav = false;
      setMarketItems((prev) =>
        prev.map((item) => {
          if (item.id === itemId) {
            nextFav = !item.isFav;
            return { ...item, isFav: nextFav };
          }
          return item;
        })
      );
      supabaseDataService.toggleMarketFav(itemId, user?.id || 'guest', nextFav);
    }, 'guardar artículos favoritos');
  };

  const handleOpenChatWithSeller = (sellerName: string, productTitle: string, price: number) => {
    requireAuthAction(() => {
      let targetChat = chats.find((c) => c.name.includes(sellerName.split(' ')[0]));
      if (!targetChat) {
        targetChat = {
          id: `chat-${Date.now()}`,
          name: sellerName,
          avatar:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
          isOnline: true,
          category: 'market',
          badge: 'Market',
          badgeType: 'market',
          productInfo: {
            name: productTitle,
            price,
            icon: 'shopping_bag',
          },
          lastMessage: 'Hola, vi tu publicación en Campus Market. ¿Sigue disponible?',
          time: 'Ahora',
          messages: [
            {
              id: 'm-init',
              sender: 'me',
              text: `Hola, me interesa tu publicación de "${productTitle}". ¿Nos podemos ver en el campus?`,
              time: '12:00 PM',
            },
          ],
        };
        setChats([targetChat, ...chats]);
        supabaseDataService.createChatThread(targetChat);
      }
      setActiveChat(targetChat);
      setIsChatOpen(true);
    }, 'chatear con el vendedor');
  };

  const handleSendMessage = (text: string) => {
    requireAuthAction(() => {
      if (!activeChat) return;
      const newMessage = {
        id: `msg-${Date.now()}`,
        sender: 'me' as const,
        text,
        time: 'Ahora',
      };
      const updatedChat = {
        ...activeChat,
        lastMessage: text,
        time: 'Ahora',
        messages: [...activeChat.messages, newMessage],
      };
      setActiveChat(updatedChat);
      setChats((prev) => prev.map((c) => (c.id === activeChat.id ? updatedChat : c)));
      supabaseDataService.sendChatMessage(activeChat.id, newMessage);
    }, 'enviar mensajes en el chat');
  };

  const handleToggleJoinGroup = (groupId: string) => {
    requireAuthAction(() => {
      let nextJoined = false;
      let nextMembers = 0;
      setGroups((prev) =>
        prev.map((g) => {
          if (g.id === groupId) {
            nextJoined = !g.isJoined;
            nextMembers = nextJoined ? g.membersCount + 1 : g.membersCount - 1;
            showToast(nextJoined ? `¡Te uniste a ${g.title}!` : `Saliste de ${g.title}`);
            return {
              ...g,
              isJoined: nextJoined,
              membersCount: nextMembers,
            };
          }
          return g;
        })
      );
      supabaseDataService.toggleJoinGroup(groupId, user?.id || 'guest', nextJoined, nextMembers);
    }, 'unirte a grupos de estudio');
  };

  const handleJoinLiveRoom = (room: LiveRoom) => {
    requireAuthAction(() => {
      setActiveLiveRoom(room);
    }, 'ingresar a salas de estudio pomodoro');
  };

  // Apertura segura del carnet
  const handleOpenCarnetWithAuth = () => {
    if (isGuest) {
      openUpgradeModal('obtener tu Carnet Digital QR y credencial NFC');
    } else {
      setIsCarnetOpen(true);
    }
  };

  // Estado de carga inicial mientras se valida token / cookies
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-[#faf8ff] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#3525cd]/20 border-t-[#3525cd] rounded-full animate-spin mb-3" />
        <p className="text-xs font-bold text-[#131b2e]">Conectando con Red Social Campus...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] flex flex-col antialiased selection:bg-[#3525cd]/15">
      {/* PWA Prompt */}
      <PWAInstallPrompt />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#131b2e] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <span className="material-symbols-outlined text-[18px] text-[#67f4b7]">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Enrutamiento de Pantallas */}
      {currentTab === 'login' || !isAuthenticated || !profile?.profile_completed ? (
        <LoginScreen
          onLoginSuccess={(university) => {
            const campus = university || profile?.university || selectedCampus;
            setSelectedCampus(campus);
            try {
              localStorage.setItem('campuslink_user_university', campus);
              localStorage.setItem('campuslink_university_confirmed', 'true');
            } catch (e) {
              console.warn(e);
            }
            setShowUniversitySelectModal(false);
            setCurrentTab('feed');
          }}
        />
      ) : (
        <div className="min-h-screen flex flex-col pt-16">
          {/* Main Top Header */}
          <Header
            currentTab={currentTab}
            onNavigate={setCurrentTab}
            selectedCampus={selectedCampus}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenCarnet={handleOpenCarnetWithAuth}
            userAvatar={profile?.avatar_url}
            userName={profile?.full_name}
            isGuest={isGuest}
          />

          {/* Responsive Layout Container */}
          <div className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-4 flex gap-6 justify-center">
            {/* Desktop Left Sidebar */}
            <DesktopLeftSidebar
              currentTab={currentTab}
              onNavigate={setCurrentTab}
              unreadCount={chats.filter((c) => c.unreadCount).length}
              onOpenCarnet={handleOpenCarnetWithAuth}
              onOpenCreatePost={() =>
                requireAuthAction(() => setCreatePostModal({ isOpen: true, type: 'text' }), 'crear publicaciones')
              }
              selectedCampus={selectedCampus}
              userAvatar={profile?.avatar_url}
              userName={profile?.full_name}
              userCareer={profile?.career}
              isGuest={isGuest}
              onOpenUpgrade={() => openUpgradeModal('crear tu cuenta y obtener carnet')}
            />

            {/* Screen Switcher / Main Center Column */}
            <main
              className={`flex-1 min-w-0 w-full transition-all duration-200 ${
                currentTab === 'market' || currentTab === 'grupos'
                  ? 'max-w-4xl'
                  : currentTab === 'perfil'
                  ? 'max-w-3xl'
                  : 'max-w-2xl'
              }`}
            >
              {currentTab === 'feed' && (
                <FeedScreen
                  posts={posts}
                  stories={stories}
                  onToggleLike={handleToggleLike}
                  onToggleSave={handleToggleSave}
                  onVotePoll={handleVotePoll}
                  onToggleEventRsvp={handleToggleEventRsvp}
                  onOpenPdf={(name, content) => handleOpenPdf(name, content)}
                  onOpenStory={handleOpenStory}
                  onOpenCreatePost={(type) =>
                    requireAuthAction(() => setCreatePostModal({ isOpen: true, type }), 'publicar en el feed')
                  }
                  onOpenSearch={() => setIsSearchOpen(true)}
                />
              )}

              {currentTab === 'grupos' && (
                <GruposScreen
                  groups={groups}
                  liveRooms={liveRooms}
                  onToggleJoinGroup={handleToggleJoinGroup}
                  onJoinLiveRoom={handleJoinLiveRoom}
                  onOpenCreateGroupModal={() =>
                    requireAuthAction(
                      () => showToast('Abriendo formulario de creación de comunidad...'),
                      'crear comunidades y materias'
                    )
                  }
                  onOpenTutorModal={() => showToast('Conectando con la Red de Tutorías Académicas...')}
                />
              )}

              {currentTab === 'market' && (
                <MarketScreen
                  items={marketItems}
                  onToggleFav={handleToggleMarketFav}
                  onOpenChatWithSeller={handleOpenChatWithSeller}
                  onOpenSellModal={() =>
                    requireAuthAction(() => setIsSellModalOpen(true), 'vender libros y calculadoras en el Market')
                  }
                  onOpenDonateModal={() => showToast('Abriendo programa de donación de libros y apuntes')}
                  onSelectItemDetails={(item) => setSelectedItemDetail(item)}
                />
              )}

              {currentTab === 'mensajes' && (
                <MensajesScreen
                  chats={chats}
                  onSelectChat={(chat) => {
                    requireAuthAction(() => {
                      setActiveChat(chat);
                      setIsChatOpen(true);
                    }, 'abrir mensajes privados');
                  }}
                  onOpenNewChatModal={() => {
                    requireAuthAction(() => {
                      if (chats.length > 0) {
                        setActiveChat(chats[0]);
                        setIsChatOpen(true);
                      }
                    }, 'iniciar nuevas conversaciones');
                  }}
                />
              )}

              {currentTab === 'perfil' && (
                <PerfilScreen
                  university={selectedCampus}
                  onOpenCarnet={handleOpenCarnetWithAuth}
                  onOpenPdf={(title, content) => handleOpenPdf(title, content)}
                  onLogout={() => setCurrentTab('login')}
                  onNavigateToLogin={() => setCurrentTab('login')}
                />
              )}
            </main>

            {/* Desktop Right Sidebar */}
            {currentTab !== 'mensajes' && (
              <DesktopRightSidebar
                liveRooms={liveRooms}
                onJoinLiveRoom={handleJoinLiveRoom}
                onOpenDonateModal={() => showToast('Abriendo programa de donación de libros y apuntes')}
              />
            )}
          </div>

          {/* Bottom Navigation for Mobile */}
          <BottomNav
            currentTab={currentTab}
            onNavigate={setCurrentTab}
            unreadMessagesCount={chats.filter((c) => c.unreadCount).length}
            userAvatar={profile?.avatar_url}
            userName={profile?.full_name}
          />
        </div>
      )}

      {/* Modal de Upgrade para Invitados */}
      <GuestUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={closeUpgradeModal}
        featureName={upgradeModalFeature}
        onNavigateToRegister={() => setCurrentTab('login')}
      />

      {/* Global Modals & Overlays */}
      <CarnetModal
        isOpen={isCarnetOpen}
        onClose={() => setIsCarnetOpen(false)}
        university={selectedCampus}
      />

      <ChatModal
        chat={activeChat}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onSendMessage={handleSendMessage}
      />

      <StoryViewerModal
        story={activeStory}
        isOpen={isStoryOpen}
        onClose={() => setIsStoryOpen(false)}
      />

      <PdfViewerModal
        isOpen={pdfModalData.isOpen}
        title={pdfModalData.title}
        content={pdfModalData.content}
        onClose={() => setPdfModalData({ isOpen: false, title: '' })}
      />

      <CreatePostModal
        isOpen={createPostModal.isOpen}
        initialType={createPostModal.type}
        onClose={() => setCreatePostModal({ isOpen: false })}
        onAddPost={async (newPost) => {
          const result = await apiClient.social.createPost(newPost);
          if (!result?.success || !result.post) throw new Error(result?.message || 'No se pudo guardar la publicación.');
          setPosts((current) => [result.post, ...current.filter((post) => post.id !== result.post.id)]);
          showToast('Publicación compartida con la comunidad');
        }}
        authorName={profile?.full_name || user?.email || 'Mi cuenta'}
        authorAvatar={profile?.avatar_url}
        authorTag={profile?.career}
      />

      <SellModal
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
        onAddItem={(newItem) => {
          setMarketItems([newItem, ...marketItems]);
          supabaseDataService.createMarketItem(newItem, user?.id);
          showToast('Artículo publicado en el Market');
        }}
      />

      <ItemDetailModal
        item={selectedItemDetail}
        isOpen={!!selectedItemDetail}
        onClose={() => setSelectedItemDetail(null)}
        onChat={handleOpenChatWithSeller}
      />

      <LiveRoomModal
        room={activeLiveRoom}
        isOpen={!!activeLiveRoom}
        onClose={() => setActiveLiveRoom(null)}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={setCurrentTab}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* One-time University Onboarding Modal */}
      <UniversitySelectModal
        isOpen={showUniversitySelectModal}
        currentUniversity={selectedCampus}
        onConfirm={handleConfirmUniversity}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CampusApp />
    </AuthProvider>
  );
}
