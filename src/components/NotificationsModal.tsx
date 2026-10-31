import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabaseDataService } from '../services/supabaseDataService';
import { CampusNotification } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch?: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onOpenSearch,
}) => {
  const { user, isGuest } = useAuth();
  const [notifications, setNotifications] = useState<CampusNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);

  const loadNotifications = async () => {
    if (!user?.id || isGuest) return;
    setIsLoading(true);
    try {
      const data = await supabaseDataService.fetchNotifications(user.id);
      setNotifications(data);
    } catch (err) {
      console.warn('[Notifications] Error cargando notificaciones:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !user?.id || isGuest) return;

    loadNotifications();

    const unsub = supabaseDataService.subscribeToNotifications(user.id, (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id)]);
    });

    return () => {
      unsub();
    };
  }, [isOpen, user?.id, isGuest]);

  if (!isOpen) return null;

  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await supabaseDataService.markAllNotificationsAsRead(user.id);
  };

  const handleAcceptRequestFromNotif = async (notif: CampusNotification) => {
    if (!user?.id || !notif.actor_id) return;
    setActionBusyId(notif.id);
    try {
      await supabaseDataService.acceptFriendRequest(
        notif.entity_id || '',
        notif.actor_id,
        user.id
      );
      await supabaseDataService.markNotificationAsRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notif.id ? { ...n, is_read: true, body: '¡Has aceptado la solicitud de amistad!' } : n
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setActionBusyId(null);
    }
  };

  const handleRejectRequestFromNotif = async (notif: CampusNotification) => {
    if (!user?.id) return;
    setActionBusyId(notif.id);
    try {
      await supabaseDataService.rejectFriendRequest(notif.entity_id || '', notif.actor_id, user.id);
      await supabaseDataService.markNotificationAsRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notif.id ? { ...n, is_read: true, body: 'Solicitud rechazada.' } : n
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setActionBusyId(null);
    }
  };

  // Fallback demo notifications si no hay registros aún
  const displayList = notifications.length > 0 ? notifications : [
    {
      id: 'demo-1',
      user_id: user?.id || 'demo',
      type: 'CAMPUS_ANNOUNCEMENT',
      title: 'Bienvenido al CampusLink',
      body: 'Utiliza el buscador para encontrar compañeros de carrera y conectar con tu red.',
      is_read: false,
      created_at: new Date().toISOString(),
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0c1022]/60 backdrop-blur-xs flex items-start justify-center p-3 pt-16 sm:pt-20"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-md bg-white rounded-[2rem] overflow-hidden shadow-2xl border border-[#eaedff] flex flex-col animate-in fade-in"
        role="dialog"
        aria-modal="true"
        aria-label="Notificaciones"
      >
        <div className="p-4 sm:p-5 border-b border-[#eaedff] bg-gradient-to-r from-[#faf8ff] to-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#eaedff] flex items-center justify-center text-[#3525cd]">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#131b2e]">Notificaciones del Campus</h3>
              <p className="text-[11px] text-[#6d6a7d]">Alertas de amistad y comunidad</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#555267] hover:bg-[#eaedff] transition active:scale-95"
            aria-label="Cerrar notificaciones"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="p-3 sm:p-4 flex flex-col gap-2.5 max-h-[420px] overflow-y-auto">
          {isLoading ? (
            <p className="text-center py-8 text-xs text-[#6e6b7f]">Cargando notificaciones...</p>
          ) : (
            displayList.map((notif) => {
              const isFriendRequest = notif.type === 'FRIEND_REQUEST';
              const isFriendAccepted = notif.type === 'FRIEND_ACCEPTED';

              return (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-2xl flex flex-col gap-2 transition-all border ${
                    !notif.is_read
                      ? 'bg-[#f4f2ff] border-[#3525cd]/25 shadow-2xs'
                      : 'bg-white border-[#edf0ff]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isFriendRequest || isFriendAccepted
                          ? 'bg-[#e2dfff] text-[#3525cd]'
                          : 'bg-[#6ffbbe]/25 text-[#005338]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {isFriendRequest ? 'person_add' : isFriendAccepted ? 'how_to_reg' : 'campaign'}
                      </span>
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-bold text-[#131b2e] truncate">
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-[#787588] shrink-0">
                          {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#4d4a5d] leading-snug">{notif.body}</p>
                    </div>
                  </div>

                  {/* Acciones directas para solicitudes de amistad recibidas */}
                  {isFriendRequest && !notif.is_read && (
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#e8e4f5]">
                      <button
                        type="button"
                        onClick={() => void handleAcceptRequestFromNotif(notif)}
                        disabled={actionBusyId === notif.id}
                        className="px-3 py-1 rounded-lg bg-[#3525cd] text-white text-[11px] font-bold hover:bg-[#271aa8] transition active:scale-95 disabled:opacity-60"
                      >
                        Aceptar
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleRejectRequestFromNotif(notif)}
                        disabled={actionBusyId === notif.id}
                        className="px-2.5 py-1 rounded-lg border border-[#ded9ec] text-[#555267] text-[11px] font-semibold hover:bg-red-50 hover:text-red-600 transition active:scale-95 disabled:opacity-60"
                      >
                        Rechazar
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="p-3 bg-[#faf8ff] text-center border-t border-[#eaedff] flex items-center justify-between px-4">
          <button
            onClick={handleMarkAllRead}
            className="text-xs text-[#3525cd] font-bold hover:underline"
          >
            Marcar leídas
          </button>
          {onOpenSearch && (
            <button
              onClick={() => {
                onClose();
                onOpenSearch();
              }}
              className="text-xs text-[#555267] font-semibold hover:text-[#3525cd] flex items-center gap-1"
            >
              <span>Buscar amigos</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
