import { useState } from 'react';
import { ScreenTab, Post, Story, MarketItem, LiveRoom, CommunityGroup, ChatThread } from './types';
import {
  INITIAL_POSTS,
  STORIES,
  INITIAL_MARKET_ITEMS,
  LIVE_ROOMS,
  COMMUNITY_GROUPS,
  INITIAL_CHATS,
} from './data/mockData';
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

export default function App() {
  // Current Active Screen
  const [currentTab, setCurrentTab] = useState<ScreenTab>('feed');

  // University Selection (Asked only once, saved to profile & localStorage)
  const [selectedCampus, setSelectedCampus] = useState<string>(() => {
    try {
      return localStorage.getItem('campuslink_user_university') || 'Universidad Central (Sede Principal)';
    } catch {
      return 'Universidad Central (Sede Principal)';
    }
  });

  const [showUniversitySelectModal, setShowUniversitySelectModal] = useState<boolean>(() => {
    try {
      // If user has already confirmed, don't show the modal
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

  // App Data State
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [stories] = useState<Story[]>(STORIES);
  const [marketItems, setMarketItems] = useState<MarketItem[]>(INITIAL_MARKET_ITEMS);
  const [groups, setGroups] = useState<CommunityGroup[]>(COMMUNITY_GROUPS);
  const [liveRooms, setLiveRooms] = useState<LiveRoom[]>(LIVE_ROOMS);
  const [chats, setChats] = useState<ChatThread[]>(INITIAL_CHATS);

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

  // Interactions: Feed
  const handleToggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          return {
            ...p,
            isLiked,
            likes: isLiked ? p.likes + 1 : p.likes - 1,
          };
        }
        return p;
      })
    );
  };

  const handleToggleSave = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isSaved: !p.isSaved } : p))
    );
    showToast('Publicación guardada en tu perfil');
  };

  const handleVotePoll = (postId: string, optionId: string) => {
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

          return {
            ...p,
            poll: {
              ...p.poll,
              totalVotes,
              userVotedOption: alreadyVoted ? undefined : optionId,
              options: updatedOptions,
            },
          };
        }
        return p;
      })
    );
    showToast('Tu voto ha sido registrado');
  };

  const handleToggleEventRsvp = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId && p.event) {
          const nextAttending = !p.event.isAttending;
          return {
            ...p,
            event: {
              ...p.event,
              isAttending: nextAttending,
              attendeesCount: nextAttending ? p.event.attendeesCount + 1 : p.event.attendeesCount - 1,
            },
          };
        }
        return p;
      })
    );
    showToast('¡Asistencia confirmada para el evento del campus!');
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
      setCreatePostModal({ isOpen: true, type: 'photo' });
    } else {
      setActiveStory(story);
      setIsStoryOpen(true);
    }
  };

  // Interactions: Market
  const handleToggleMarketFav = (itemId: string) => {
    setMarketItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, isFav: !item.isFav } : item))
    );
  };

  const handleOpenChatWithSeller = (sellerName: string, productTitle: string, price: number) => {
    // Check if chat thread exists or create new one
    let targetChat = chats.find((c) => c.name.includes(sellerName.split(' ')[0]));
    if (!targetChat) {
      targetChat = {
        id: `chat-${Date.now()}`,
        name: sellerName,
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAtb9b4zzzvwKITUqbWGkuxZHLdxSLMk9_1yvlvYEhC8FX9ziGREf-YduFUkrzzaxB_QjX1RBt_CGqZBK2nnihbfqpmibOkDSsf_KtYrwFAvFPF_MYlcIwRQU4ntGCr0rjsS46MYEXjuMQhaYMBn0KotM7MXBem9f8viC68Q6ghZ7JVCXVQjMySjYsZGysPSV70oql8JLOgnp2VWsh4cs7Bbz7Cug-1VDP56ayBfPIseCXv2iKd_1c1',
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
            sender: 'Sofía',
            text: `Hola, me interesa tu publicación de "${productTitle}". ¿Nos podemos ver en el Hall de la biblioteca?`,
            time: '12:00 PM',
            isSender: true,
          },
        ],
      };
      setChats((prev) => [targetChat!, ...prev]);
    }
    setActiveChat(targetChat);
    setIsChatOpen(true);
  };

  // Interactions: Grupos
  const handleToggleJoinGroup = (groupId: string) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          const next = !g.isJoined;
          return {
            ...g,
            isJoined: next,
            membersCount: next ? g.membersCount + 1 : g.membersCount - 1,
          };
        }
        return g;
      })
    );
    showToast('Membresía del grupo actualizada');
  };

  const handleJoinLiveRoom = (room: LiveRoom) => {
    setLiveRooms((prev) =>
      prev.map((r) => (r.id === room.id ? { ...r, isConnected: true } : r))
    );
    setActiveLiveRoom(room);
  };

  // Interactions: Chat messages
  const handleSendMessage = (chatId: string, text: string) => {
    const newMessage = {
      id: `msg-${Date.now()}`,
      sender: 'Sofía',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSender: true,
    };

    setChats((prev) =>
      prev.map((c) => {
        if (c.id === chatId) {
          return {
            ...c,
            lastMessage: text,
            time: 'Ahora',
            messages: [...c.messages, newMessage],
          };
        }
        return c;
      })
    );

    // Simulated reply after 1.2 seconds!
    setTimeout(() => {
      const replies = [
        '¡Perfecto! Nos vemos en el punto seguro de la Biblioteca Central.',
        'Excelente, llevo el carnet y el material listo.',
        'Quedamos a esa hora, ¡muchas gracias!',
        'Anotado. Ahí nos encontramos en la entrada principal.',
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      const responseMsg = {
        id: `msg-resp-${Date.now()}`,
        sender: 'Compañero',
        text: randomReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSender: false,
      };

      setChats((prev) =>
        prev.map((c) => {
          if (c.id === chatId) {
            return {
              ...c,
              lastMessage: randomReply,
              time: 'Ahora',
              messages: [...c.messages, responseMsg],
            };
          }
          return c;
        })
      );
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] font-sans antialiased selection:bg-[#3525cd]/20 selection:text-[#3525cd]">
      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#131b2e] text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-[18px] text-[#6ffbbe]">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen Routing */}
      {currentTab === 'login' ? (
        <LoginScreen
          onLoginSuccess={() => {
            try {
              localStorage.setItem('campuslink_user_university', selectedCampus);
              localStorage.setItem('campuslink_university_confirmed', 'true');
            } catch (e) {
              console.warn(e);
            }
            setShowUniversitySelectModal(false);
            setCurrentTab('feed');
            showToast('¡Bienvenida de vuelta, Sofía!');
          }}
          selectedCampus={selectedCampus}
          onSelectCampus={(camp) => {
            setSelectedCampus(camp);
            try {
              localStorage.setItem('campuslink_user_university', camp);
            } catch (e) {
              console.warn(e);
            }
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
            onOpenCarnet={() => setIsCarnetOpen(true)}
          />

          {/* Responsive Layout Container */}
          <div className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-4 flex gap-6 justify-center">
            {/* Desktop Left Sidebar (Navigation, Student Credential, Quick Actions) */}
            <DesktopLeftSidebar
              currentTab={currentTab}
              onNavigate={setCurrentTab}
              unreadCount={chats.filter((c) => c.unreadCount).length}
              onOpenCarnet={() => setIsCarnetOpen(true)}
              onOpenCreatePost={() => setCreatePostModal({ isOpen: true, type: 'text' })}
              selectedCampus={selectedCampus}
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
                  onOpenCreatePost={(type) => setCreatePostModal({ isOpen: true, type })}
                />
              )}

              {currentTab === 'grupos' && (
                <GruposScreen
                  groups={groups}
                  liveRooms={liveRooms}
                  onToggleJoinGroup={handleToggleJoinGroup}
                  onJoinLiveRoom={handleJoinLiveRoom}
                  onOpenCreateGroupModal={() => showToast('Abriendo formulario de creación de comunidad...')}
                  onOpenTutorModal={() => showToast('Conectando con la Red de Tutorías Académicas...')}
                />
              )}

              {currentTab === 'market' && (
                <MarketScreen
                  items={marketItems}
                  onToggleFav={handleToggleMarketFav}
                  onOpenChatWithSeller={handleOpenChatWithSeller}
                  onOpenSellModal={() => setIsSellModalOpen(true)}
                  onOpenDonateModal={() => showToast('Abriendo programa de donación de libros y apuntes')}
                  onSelectItemDetails={(item) => setSelectedItemDetail(item)}
                />
              )}

              {currentTab === 'mensajes' && (
                <MensajesScreen
                  chats={chats}
                  onSelectChat={(chat) => {
                    setActiveChat(chat);
                    setIsChatOpen(true);
                  }}
                  onOpenNewChatModal={() => {
                    if (chats.length > 0) {
                      setActiveChat(chats[0]);
                      setIsChatOpen(true);
                    }
                  }}
                />
              )}

              {currentTab === 'perfil' && (
                <PerfilScreen
                  university={selectedCampus}
                  onOpenCarnet={() => setIsCarnetOpen(true)}
                  onOpenPdf={(title, content) => handleOpenPdf(title, content)}
                  onLogout={() => setCurrentTab('login')}
                  onEditBio={() => showToast('Biografía actualizada exitosamente')}
                />
              )}
            </main>

            {/* Desktop Right Sidebar (Active Study Rooms, Safety Zones, Events, Trends) */}
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
          />
        </div>
      )}

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
        onAddPost={(newPost) => {
          setPosts([newPost, ...posts]);
          showToast('Publicación compartida con el campus');
        }}
      />

      <SellModal
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
        onAddItem={(newItem) => {
          setMarketItems([newItem, ...marketItems]);
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
