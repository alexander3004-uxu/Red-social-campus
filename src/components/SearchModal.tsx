import React, { useEffect, useState, useCallback } from 'react';
import { ScreenTab, UserSearchResult, FriendRequest } from '../types';
import { supabaseDataService } from '../services/supabaseDataService';
import { apiClient } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: ScreenTab) => void;
  onOpenPublicProfile?: (user: UserSearchResult) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenPublicProfile,
}) => {
  const { user, profile, isGuest, requireAuthAction } = useAuth();

  const [activeTab, setActiveTab] = useState<'explore' | 'requests' | 'friends'>('explore');
  const [query, setQuery] = useState('');
  const [people, setPeople] = useState<UserSearchResult[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [friendsList, setFriendsList] = useState<UserSearchResult[]>([]);
  const [selectedUserDetail, setSelectedUserDetail] = useState<UserSearchResult | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const currentUserId = user?.id;

  // Cargar solicitudes pendientes y amigos
  const loadRequestsAndFriends = useCallback(async () => {
    if (!currentUserId || isGuest) return;
    try {
      const [{ received, sent }, friends] = await Promise.all([
        supabaseDataService.getFriendRequests(currentUserId),
        supabaseDataService.getFriends(currentUserId),
      ]);
      setReceivedRequests(received);
      setSentRequests(sent);
      setFriendsList(friends);
    } catch (err) {
      console.warn('[SearchModal] Error cargando relaciones:', err);
    }
  }, [currentUserId, isGuest]);

  // Búsqueda de personas
  const executeSearch = useCallback(async (searchTerm: string) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      // 1. Intentar con Supabase directamente
      let results: UserSearchResult[] = await supabaseDataService.searchUsers(searchTerm, currentUserId);

      // 2. Si Supabase no devolvió resultados o no está configurado, consultar API / fallback
      if (!results || results.length === 0) {
        const apiRes = await apiClient.social.searchPeople(searchTerm);
        if (apiRes?.success && Array.isArray(apiRes.people)) {
          results = apiRes.people.map((p: any) => ({
            id: p.id,
            user_id: p.id,
            username: p.username,
            full_name: p.full_name,
            avatar_url: p.avatar_url,
            university: p.university,
            career: p.career,
            faculty: p.faculty,
            friendship_status: p.friendship_status || (p.is_following ? 'friends' : 'none'),
            request_id: p.request_id,
          }));
        }
      }

      setPeople(results || []);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudieron cargar los usuarios.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  // Debounced Search Effect
  useEffect(() => {
    if (!isOpen) return;

    loadRequestsAndFriends();

    let active = true;
    const timer = window.setTimeout(() => {
      if (active) executeSearch(query.trim());
    }, query.trim() ? 250 : 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [isOpen, query, executeSearch, loadRequestsAndFriends]);

  // Suscripción Realtime a solicitudes de amistad
  useEffect(() => {
    if (!isOpen || !currentUserId || isGuest) return;

    const unsubscribe = supabaseDataService.subscribeToFriendRequests(currentUserId, () => {
      loadRequestsAndFriends();
      executeSearch(query.trim());
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen, currentUserId, isGuest, loadRequestsAndFriends, executeSearch, query]);

  if (!isOpen) return null;

  const showNotificationToast = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // 1. Enviar solicitud de amistad
  const handleSendRequest = async (targetUser: UserSearchResult) => {
    const canProceed = requireAuthAction(() => {}, 'enviar solicitudes de amistad');
    if (!canProceed || !currentUserId) return;

    setBusyUserId(targetUser.id);
    setErrorMessage('');
    try {
      const res = await supabaseDataService.sendFriendRequest(
        currentUserId,
        targetUser.id,
        profile?.full_name || 'Un estudiante del campus'
      );

      if (!res.success) {
        // Fallback a API Express
        await apiClient.social.sendFriendRequest(targetUser.id);
      }

      // Actualizar estado local inmediatamente
      setPeople((prev) =>
        prev.map((item) =>
          item.id === targetUser.id
            ? { ...item, friendship_status: 'pending_sent' }
            : item
        )
      );

      if (selectedUserDetail?.id === targetUser.id) {
        setSelectedUserDetail({ ...selectedUserDetail, friendship_status: 'pending_sent' });
      }

      showNotificationToast(`Solicitud de amistad enviada a @${targetUser.username}`);
      loadRequestsAndFriends();
    } catch (err: any) {
      setErrorMessage(err.message || 'No se pudo enviar la solicitud.');
    } finally {
      setBusyUserId(null);
    }
  };

  // 2. Aceptar solicitud de amistad
  const handleAcceptRequest = async (targetUser: UserSearchResult, requestId?: string) => {
    const canProceed = requireAuthAction(() => {}, 'aceptar solicitudes de amistad');
    if (!canProceed || !currentUserId) return;

    setBusyUserId(targetUser.id);
    setErrorMessage('');
    try {
      const success = await supabaseDataService.acceptFriendRequest(
        requestId || targetUser.request_id || '',
        targetUser.id,
        currentUserId,
        profile?.full_name || 'Compañero del campus'
      );

      if (!success) {
        await apiClient.social.acceptFriendRequest(requestId || targetUser.id);
      }

      setPeople((prev) =>
        prev.map((item) =>
          item.id === targetUser.id
            ? { ...item, friendship_status: 'friends' }
            : item
        )
      );

      if (selectedUserDetail?.id === targetUser.id) {
        setSelectedUserDetail({ ...selectedUserDetail, friendship_status: 'friends' });
      }

      showNotificationToast(`¡Ahora eres amigo de ${targetUser.full_name}!`);
      loadRequestsAndFriends();
    } catch (err: any) {
      setErrorMessage(err.message || 'No se pudo aceptar la solicitud.');
    } finally {
      setBusyUserId(null);
    }
  };

  // 3. Rechazar solicitud
  const handleRejectRequest = async (targetUser: UserSearchResult, requestId?: string) => {
    setBusyUserId(targetUser.id);
    setErrorMessage('');
    try {
      const success = await supabaseDataService.rejectFriendRequest(
        requestId || targetUser.request_id || '',
        targetUser.id,
        currentUserId
      );

      if (!success) {
        await apiClient.social.rejectFriendRequest(requestId || targetUser.id);
      }

      setPeople((prev) =>
        prev.map((item) =>
          item.id === targetUser.id
            ? { ...item, friendship_status: 'none' }
            : item
        )
      );

      if (selectedUserDetail?.id === targetUser.id) {
        setSelectedUserDetail({ ...selectedUserDetail, friendship_status: 'none' });
      }

      showNotificationToast('Solicitud rechazada.');
      loadRequestsAndFriends();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al rechazar solicitud.');
    } finally {
      setBusyUserId(null);
    }
  };

  // 4. Cancelar solicitud enviada
  const handleCancelRequest = async (targetUser: UserSearchResult) => {
    if (!currentUserId) return;
    setBusyUserId(targetUser.id);
    setErrorMessage('');
    try {
      const success = await supabaseDataService.cancelFriendRequest(currentUserId, targetUser.id);
      if (!success) {
        await apiClient.social.cancelFriendRequest(targetUser.id);
      }

      setPeople((prev) =>
        prev.map((item) =>
          item.id === targetUser.id
            ? { ...item, friendship_status: 'none' }
            : item
        )
      );

      if (selectedUserDetail?.id === targetUser.id) {
        setSelectedUserDetail({ ...selectedUserDetail, friendship_status: 'none' });
      }

      showNotificationToast('Solicitud cancelada.');
      loadRequestsAndFriends();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al cancelar la solicitud.');
    } finally {
      setBusyUserId(null);
    }
  };

  // 5. Eliminar de amigos
  const handleRemoveFriend = async (targetUser: UserSearchResult) => {
    if (!currentUserId) return;
    if (!window.confirm(`¿Seguro que deseas eliminar a ${targetUser.full_name} de tus amigos?`)) return;

    setBusyUserId(targetUser.id);
    setErrorMessage('');
    try {
      const success = await supabaseDataService.removeFriend(currentUserId, targetUser.id);
      if (!success) {
        await apiClient.social.removeFriend(targetUser.id);
      }

      setPeople((prev) =>
        prev.map((item) =>
          item.id === targetUser.id
            ? { ...item, friendship_status: 'none' }
            : item
        )
      );

      if (selectedUserDetail?.id === targetUser.id) {
        setSelectedUserDetail({ ...selectedUserDetail, friendship_status: 'none' });
      }

      showNotificationToast(`Has eliminado a ${targetUser.full_name} de tus amigos.`);
      loadRequestsAndFriends();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al eliminar amigo.');
    } finally {
      setBusyUserId(null);
    }
  };

  // Renderizar botón de acción de amistad
  const renderFriendshipActionButton = (person: UserSearchResult, size: 'normal' | 'large' = 'normal') => {
    const isBusy = busyUserId === person.id;
    const padding = size === 'large' ? 'px-4 py-2.5 text-xs' : 'px-3 py-1.5 text-xs';

    if (person.friendship_status === 'friends') {
      return (
        <button
          type="button"
          onClick={() => void handleRemoveFriend(person)}
          disabled={isBusy}
          title="Son amigos. Clic para eliminar amistad."
          className={`group flex items-center justify-center gap-1.5 rounded-xl border border-[#3525cd]/20 bg-[#f2f0ff] font-bold text-[#3525cd] transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 active:scale-95 disabled:opacity-60 ${padding}`}
        >
          <span className="material-symbols-outlined text-[17px] group-hover:hidden">check_circle</span>
          <span className="material-symbols-outlined hidden text-[17px] group-hover:inline">person_remove</span>
          <span className="group-hover:hidden">Amigos</span>
          <span className="hidden group-hover:inline">Eliminar</span>
        </button>
      );
    }

    if (person.friendship_status === 'pending_sent') {
      return (
        <button
          type="button"
          onClick={() => void handleCancelRequest(person)}
          disabled={isBusy}
          title="Solicitud enviada. Clic para cancelar."
          className={`group flex items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 font-bold text-amber-800 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 active:scale-95 disabled:opacity-60 ${padding}`}
        >
          <span className="material-symbols-outlined text-[17px] text-amber-600 group-hover:hidden">
            {isBusy ? 'progress_activity' : 'hourglass_top'}
          </span>
          <span className="material-symbols-outlined hidden text-[17px] group-hover:inline">close</span>
          <span className="group-hover:hidden">Enviada</span>
          <span className="hidden group-hover:inline">Cancelar</span>
        </button>
      );
    }

    if (person.friendship_status === 'pending_received') {
      return (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => void handleAcceptRequest(person, person.request_id)}
            disabled={isBusy}
            title="Aceptar solicitud de amistad"
            className={`flex items-center justify-center gap-1 rounded-xl bg-[#3525cd] font-bold text-white shadow-xs transition hover:bg-[#281ca8] active:scale-95 disabled:opacity-60 ${padding}`}
          >
            <span className="material-symbols-outlined text-[16px]">check</span>
            <span>Aceptar</span>
          </button>
          <button
            type="button"
            onClick={() => void handleRejectRequest(person, person.request_id)}
            disabled={isBusy}
            title="Rechazar solicitud"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#e5e1f0] bg-white text-[#635f75] transition hover:bg-red-50 hover:text-red-600 active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      );
    }

    // Default: 'none'
    return (
      <button
        type="button"
        onClick={() => void handleSendRequest(person)}
        disabled={isBusy}
        title="Enviar solicitud de amistad"
        className={`flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#3525cd] to-[#602ee5] font-bold text-white shadow-xs transition hover:opacity-95 active:scale-95 disabled:opacity-60 ${padding}`}
      >
        <span className="material-symbols-outlined text-[17px]">
          {isBusy ? 'progress_activity' : 'person_add'}
        </span>
        <span>Agregar amigo</span>
      </button>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-[#0d1020]/65 p-3 pt-12 backdrop-blur-xs sm:pt-16"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-[#eaedff] bg-white shadow-2xl animate-in fade-in"
        role="dialog"
        aria-modal="true"
        aria-label="Buscador de Estudiantes y Solicitudes de Amistad"
      >
        {/* Header con pestañas */}
        <div className="border-b border-[#efedf5] bg-gradient-to-b from-[#faf8ff] to-white p-5 sm:p-6 pb-4">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eaedff] text-[#3525cd]">
                <span className="material-symbols-outlined text-[24px]">person_search</span>
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-[#131b2e]">
                  Comunidad Campus
                </h2>
                <p className="text-xs text-[#6a667d]">
                  Conecta con compañeros y docentes en Supabase
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              type="button"
              aria-label="Cerrar modal"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f4f2fa] text-[#555267] transition hover:bg-[#ebe8f5] active:scale-90"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Selector de pestañas */}
          <div className="mb-3 flex items-center gap-1.5 rounded-2xl bg-[#f2f1fa] p-1 text-xs font-bold text-[#555267]">
            <button
              type="button"
              onClick={() => {
                setActiveTab('explore');
                setSelectedUserDetail(null);
              }}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 transition-all ${
                activeTab === 'explore'
                  ? 'bg-white text-[#3525cd] shadow-xs'
                  : 'hover:text-[#131b2e]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">search</span>
              <span>Explorar</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('requests');
                setSelectedUserDetail(null);
              }}
              className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 transition-all ${
                activeTab === 'requests'
                  ? 'bg-white text-[#3525cd] shadow-xs'
                  : 'hover:text-[#131b2e]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">group_add</span>
              <span>Solicitudes</span>
              {receivedRequests.length > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ba1a1a] px-1 text-[10px] font-bold text-white">
                  {receivedRequests.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('friends');
                setSelectedUserDetail(null);
              }}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 transition-all ${
                activeTab === 'friends'
                  ? 'bg-white text-[#3525cd] shadow-xs'
                  : 'hover:text-[#131b2e]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
              <span>Mis Amigos</span>
              {friendsList.length > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#3525cd] px-1 text-[10px] font-bold text-white">
                  {friendsList.length}
                </span>
              )}
            </button>
          </div>

          {/* Barra de búsqueda (solo en pestaña explorar o amigos) */}
          {activeTab === 'explore' && (
            <div className="relative">
              <label className="flex h-12 items-center gap-3 rounded-2xl border border-[#e2dfff] bg-[#f8f7ff] px-4 shadow-2xs transition focus-within:border-[#3525cd] focus-within:ring-4 focus-within:ring-[#3525cd]/10">
                <span className="material-symbols-outlined text-[20px] text-[#3525cd]">search</span>
                <input
                  autoFocus
                  type="search"
                  placeholder="Buscar por nombre, @usuario, carrera o universidad..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#131b2e] outline-none placeholder:text-[#8e8a9f]"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="flex h-6 w-6 items-center justify-center rounded-full text-[#777487] hover:bg-[#eaedff]"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </label>
            </div>
          )}
        </div>

        {/* Feedback Messages */}
        {successMessage && (
          <div className="m-3 mb-0 flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-800 border border-emerald-200 animate-in fade-in">
            <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div role="alert" className="m-3 mb-0 flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-800 border border-red-200 animate-in fade-in">
            <span className="material-symbols-outlined text-[18px] text-red-600">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Contenido principal con Scroll */}
        <div className="min-h-48 flex-1 overflow-y-auto p-3 sm:p-5">
          {/* Modal / Vista rápida de Perfil de Compañero */}
          {selectedUserDetail && (
            <div className="mb-4 rounded-3xl border border-[#e2dfff] bg-[#faf8ff] p-5 shadow-sm animate-in fade-in">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  {selectedUserDetail.avatar_url ? (
                    <img
                      src={selectedUserDetail.avatar_url}
                      alt={selectedUserDetail.full_name}
                      className="h-16 w-16 rounded-2xl border-2 border-white object-cover shadow-sm ring-2 ring-[#3525cd]/20"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#3525cd] to-[#712ae2] text-xl font-bold text-white shadow-sm">
                      {selectedUserDetail.full_name.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-bold text-[#131b2e]">
                      {selectedUserDetail.full_name}
                    </h3>
                    <p className="text-xs font-semibold text-[#3525cd]">
                      @{selectedUserDetail.username}
                    </p>
                    <p className="mt-0.5 text-xs text-[#555267]">
                      {[selectedUserDetail.career, selectedUserDetail.faculty].filter(Boolean).join(' · ')}
                    </p>
                    {selectedUserDetail.university && (
                      <p className="text-[11px] text-[#787588]">
                        🏛️ {selectedUserDetail.university}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedUserDetail(null)}
                  className="rounded-full bg-white p-1 text-[#6a667d] shadow-2xs hover:bg-[#f0eef7]"
                  title="Cerrar vista de perfil"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#ebe8f5] pt-3.5">
                <span className="text-xs text-[#6a667d]">
                  Perfil verificado en la red de Supabase
                </span>
                <div className="flex items-center gap-2">
                  {renderFriendshipActionButton(selectedUserDetail, 'large')}
                </div>
              </div>
            </div>
          )}

          {/* PESTAÑA 1: EXPLORAR PERSONAS */}
          {activeTab === 'explore' && (
            <div>
              <div className="mb-2 flex items-center justify-between px-2 text-[11px] font-bold uppercase tracking-wider text-[#79768a]">
                <span>{query.trim() ? 'Resultados de búsqueda' : 'Estudiantes y docentes activos'}</span>
                <span>{people.length} disponibles</span>
              </div>

              {isLoading && (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <span className="material-symbols-outlined animate-spin text-3xl text-[#3525cd]">progress_activity</span>
                  <p className="mt-2 text-xs font-semibold text-[#555267]">Consultando usuarios en Supabase...</p>
                </div>
              )}

              {!isLoading && people.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#f2f0ff] text-[#3525cd]">
                    <span className="material-symbols-outlined text-3xl">person_off</span>
                  </div>
                  <h4 className="mt-3 text-sm font-bold text-[#131b2e]">No se encontraron estudiantes</h4>
                  <p className="mt-1 max-w-xs text-xs text-[#716e82]">
                    Intenta buscar por nombre completo, nombre de usuario sin @ o carrera universitaria.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                {people.map((person) => (
                  <article
                    key={person.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[#f0edfa] bg-white p-3.5 transition-all hover:border-[#3525cd]/30 hover:bg-[#faf8ff] hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {person.avatar_url ? (
                        <img
                          src={person.avatar_url}
                          alt={person.full_name}
                          className="h-12 w-12 shrink-0 rounded-2xl border border-[#ebe7f5] object-cover ring-1 ring-[#3525cd]/15"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#3525cd] to-[#712ae2] text-sm font-bold text-white shadow-2xs">
                          {person.full_name.slice(0, 1).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="truncate text-sm font-bold text-[#131b2e]">
                            {person.full_name}
                          </h4>
                          {person.friendship_status === 'friends' && (
                            <span className="material-symbols-outlined text-[15px] text-[#006e4b]" title="Amigo confirmado">
                              verified
                            </span>
                          )}
                        </div>
                        <p className="truncate text-xs font-semibold text-[#3525cd]">
                          @{person.username}
                        </p>
                        {(person.career || person.university) && (
                          <p className="mt-0.5 truncate text-[11px] text-[#6b677d]">
                            {[person.career, person.university].filter(Boolean).join(' · ')}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUserDetail(person);
                          if (onOpenPublicProfile) onOpenPublicProfile(person);
                        }}
                        className="flex items-center gap-1 rounded-xl border border-[#e5e1f0] bg-[#faf8ff] px-2.5 py-1.5 text-xs font-semibold text-[#48455a] transition hover:bg-[#edeaff] hover:text-[#3525cd] active:scale-95"
                        title="Ver tarjeta completa del estudiante"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        <span>Ver perfil</span>
                      </button>

                      {renderFriendshipActionButton(person)}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* PESTAÑA 2: SOLICITUDES DE AMISTAD RECIBIDAS Y ENVIADAS */}
          {activeTab === 'requests' && (
            <div className="space-y-6">
              {/* Solicitudes Recibidas */}
              <div>
                <div className="mb-2 flex items-center justify-between px-2 text-[11px] font-bold uppercase tracking-wider text-[#79768a]">
                  <span>Solicitudes Recibidas</span>
                  <span className="text-[#3525cd]">{receivedRequests.length} pendientes</span>
                </div>

                {receivedRequests.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#e6e2f2] p-6 text-center text-xs text-[#716e82]">
                    <span className="material-symbols-outlined text-2xl text-[#aaa6be]">mail</span>
                    <p className="mt-1">No tienes solicitudes de amistad pendientes por responder.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {receivedRequests.map((req) => {
                      const profileData = req.sender_profile || {
                        user_id: req.sender_id,
                        full_name: 'Estudiante',
                        username: 'usuario',
                        avatar_url: '',
                      };
                      const userObj: UserSearchResult = {
                        id: req.sender_id,
                        user_id: req.sender_id,
                        full_name: profileData.full_name,
                        username: profileData.username,
                        avatar_url: profileData.avatar_url,
                        career: profileData.career,
                        university: profileData.university,
                        friendship_status: 'pending_received',
                        request_id: req.id,
                      };

                      return (
                        <div
                          key={req.id}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-[#3525cd]/20 bg-[#faf8ff] p-3 shadow-2xs"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {profileData.avatar_url ? (
                              <img
                                src={profileData.avatar_url}
                                alt={profileData.full_name}
                                className="h-11 w-11 rounded-2xl object-cover ring-1 ring-[#3525cd]/20"
                              />
                            ) : (
                              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3525cd] font-bold text-white text-sm">
                                {profileData.full_name.slice(0, 1).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <h4 className="truncate text-sm font-bold text-[#131b2e]">
                                {profileData.full_name}
                              </h4>
                              <p className="truncate text-xs font-semibold text-[#3525cd]">
                                @{profileData.username}
                              </p>
                              {profileData.career && (
                                <p className="truncate text-[11px] text-[#68657a]">
                                  {profileData.career}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => void handleAcceptRequest(userObj, req.id)}
                              className="flex items-center gap-1 rounded-xl bg-[#3525cd] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#281ca8] active:scale-95"
                            >
                              <span className="material-symbols-outlined text-[15px]">check</span>
                              <span>Aceptar</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleRejectRequest(userObj, req.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#e2dfff] bg-white text-[#635f75] transition hover:bg-red-50 hover:text-red-600 active:scale-95"
                              title="Rechazar solicitud"
                            >
                              <span className="material-symbols-outlined text-[15px]">close</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Solicitudes Enviadas */}
              <div>
                <div className="mb-2 flex items-center justify-between px-2 text-[11px] font-bold uppercase tracking-wider text-[#79768a]">
                  <span>Solicitudes Enviadas por ti</span>
                  <span>{sentRequests.length} en espera</span>
                </div>

                {sentRequests.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#e6e2f2] p-5 text-center text-xs text-[#716e82]">
                    <p>No tienes solicitudes enviadas pendientes.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sentRequests.map((req) => {
                      const profileData = req.receiver_profile || {
                        user_id: req.receiver_id,
                        full_name: 'Estudiante',
                        username: 'usuario',
                        avatar_url: '',
                      };
                      const userObj: UserSearchResult = {
                        id: req.receiver_id,
                        user_id: req.receiver_id,
                        full_name: profileData.full_name,
                        username: profileData.username,
                        avatar_url: profileData.avatar_url,
                        career: profileData.career,
                        university: profileData.university,
                        friendship_status: 'pending_sent',
                        request_id: req.id,
                      };

                      return (
                        <div
                          key={req.id}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-[#f0edfa] bg-white p-3"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {profileData.avatar_url ? (
                              <img
                                src={profileData.avatar_url}
                                alt={profileData.full_name}
                                className="h-10 w-10 rounded-2xl object-cover ring-1 ring-black/5"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eaedff] font-bold text-[#3525cd] text-xs">
                                {profileData.full_name.slice(0, 1).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <h4 className="truncate text-sm font-bold text-[#131b2e]">
                                {profileData.full_name}
                              </h4>
                              <p className="truncate text-xs font-semibold text-[#3525cd]">
                                @{profileData.username}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => void handleCancelRequest(userObj)}
                            className="flex items-center gap-1 rounded-xl border border-red-200 bg-red-50/60 px-2.5 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-100 active:scale-95"
                          >
                            <span className="material-symbols-outlined text-[15px]">close</span>
                            <span>Cancelar</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PESTAÑA 3: MIS AMIGOS */}
          {activeTab === 'friends' && (
            <div>
              <div className="mb-2 flex items-center justify-between px-2 text-[11px] font-bold uppercase tracking-wider text-[#79768a]">
                <span>Tus amigos en el Campus</span>
                <span className="text-[#3525cd] font-bold">{friendsList.length} amigos</span>
              </div>

              {friendsList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#f2f0ff] text-[#3525cd]">
                    <span className="material-symbols-outlined text-3xl">sentiment_satisfied</span>
                  </div>
                  <h4 className="mt-3 text-sm font-bold text-[#131b2e]">Aún no tienes amigos agregados</h4>
                  <p className="mt-1 max-w-xs text-xs text-[#716e82]">
                    Usa la pestaña Explorar para buscar compañeros de tu carrera o facultad y enviarles solicitud.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('explore')}
                    className="mt-4 rounded-xl bg-[#3525cd] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#281ca8]"
                  >
                    Buscar compañeros
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {friendsList.map((friend) => (
                    <article
                      key={friend.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-[#eaedff] bg-white p-3.5 transition hover:bg-[#faf8ff]"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {friend.avatar_url ? (
                          <img
                            src={friend.avatar_url}
                            alt={friend.full_name}
                            className="h-12 w-12 rounded-2xl object-cover ring-2 ring-[#3525cd]/20"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#3525cd] to-[#712ae2] text-sm font-bold text-white">
                            {friend.full_name.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-sm font-bold text-[#131b2e]">
                            {friend.full_name}
                          </h4>
                          <p className="truncate text-xs font-semibold text-[#3525cd]">
                            @{friend.username}
                          </p>
                          {friend.career && (
                            <p className="truncate text-[11px] text-[#6d6a7d]">
                              {friend.career}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setSelectedUserDetail(friend)}
                          className="flex items-center gap-1 rounded-xl border border-[#e2dfff] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#48455a] transition hover:bg-[#faf8ff] hover:text-[#3525cd]"
                        >
                          <span className="material-symbols-outlined text-[15px]">badge</span>
                          <span className="hidden sm:inline">Perfil</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleRemoveFriend(friend)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                          title="Eliminar de amigos"
                        >
                          <span className="material-symbols-outlined text-[16px]">person_remove</span>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer con Accesos directos a navegación */}
        <div className="flex gap-2 border-t border-[#efedf5] bg-[#faf8ff] p-3 sm:p-4">
          {([
            ['feed', 'Feed', 'home'],
            ['grupos', 'Grupos', 'groups'],
            ['mensajes', 'Mensajes', 'chat'],
            ['perfil', 'Mi Perfil', 'person'],
          ] as const).map(([tab, label, icon]) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                onNavigate(tab);
                onClose();
              }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white border border-[#e5e1f0] py-2 text-xs font-semibold text-[#5e5a70] transition hover:border-[#3525cd] hover:text-[#3525cd] active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">{icon}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
