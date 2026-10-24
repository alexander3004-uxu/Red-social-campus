import React, { useEffect, useState } from 'react';
import { ScreenTab } from '../types';
import { apiClient } from '../services/apiClient';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: ScreenTab) => void;
}

interface PersonResult {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  university?: string;
  career?: string;
  is_following: boolean;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [people, setPeople] = useState<PersonResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [busyPersonId, setBusyPersonId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const result = await apiClient.social.searchPeople(query.trim());
        if (active && result?.success) setPeople(Array.isArray(result.people) ? result.people : []);
      } catch (error) {
        if (active) setErrorMessage(error instanceof Error ? error.message : 'No se pudieron cargar las cuentas.');
      } finally {
        if (active) setIsLoading(false);
      }
    }, query.trim() ? 250 : 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [isOpen, query]);

  if (!isOpen) return null;

  const toggleFollow = async (person: PersonResult) => {
    setBusyPersonId(person.id);
    setErrorMessage('');
    try {
      const result = person.is_following
        ? await apiClient.social.unfollowPerson(person.id)
        : await apiClient.social.followPerson(person.id);
      if (!result?.success) throw new Error(result?.message || 'No se pudo actualizar la amistad.');
      setPeople((current) => current.map((item) => item.id === person.id
        ? { ...item, is_following: Boolean(result.following) }
        : item));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo actualizar la amistad.');
    } finally {
      setBusyPersonId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-[#101326]/55 p-3 pt-16 backdrop-blur-sm sm:pt-20" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="flex max-h-[82vh] w-full max-w-xl flex-col overflow-hidden rounded-[1.75rem] border border-[#e8e5f4] bg-white shadow-2xl" role="dialog" aria-modal="true" aria-label="Buscar personas">
        <div className="border-b border-[#efedf5] p-5 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7058d6]">Tu comunidad</p>
              <h2 className="mt-1 text-xl font-bold text-[#211f32]">Encuentra compañeros</h2>
              <p className="mt-1 text-sm text-[#777487]">Busca cuentas reales y agrégalas a tu red.</p>
            </div>
            <button onClick={onClose} type="button" aria-label="Cerrar búsqueda" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f4f2fa] text-[#555267] transition hover:bg-[#ebe8f5]">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          <label className="flex h-12 items-center gap-3 rounded-2xl border border-[#e9e6f1] bg-[#f8f7fb] px-4 focus-within:border-[#7058d6] focus-within:ring-4 focus-within:ring-[#7058d6]/10">
            <span className="material-symbols-outlined text-[20px] text-[#7058d6]">search</span>
            <input
              autoFocus
              type="search"
              placeholder="Nombre, usuario, universidad o carrera"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#211f32] outline-none placeholder:text-[#9290a0]"
            />
          </label>
        </div>

        <div className="min-h-40 flex-1 overflow-y-auto p-3 sm:p-4">
          <div className="mb-2 px-2 text-[11px] font-bold uppercase tracking-wide text-[#858294]">
            {query.trim() ? 'Resultados de personas' : 'Personas de la red'}
          </div>
          {isLoading && <p className="px-2 py-6 text-center text-sm text-[#777487]">Buscando cuentas...</p>}
          {!isLoading && !errorMessage && people.length === 0 && (
            <div className="px-4 py-9 text-center">
              <span className="material-symbols-outlined text-3xl text-[#aaa5ba]">person_search</span>
              <p className="mt-2 text-sm font-semibold text-[#48465a]">No se encontraron personas</p>
              <p className="mt-1 text-xs text-[#858294]">Busca por nombre, usuario (@username), universidad o carrera.</p>
            </div>
          )}
          {people.map((person) => (
            <article key={person.id} className="flex items-center gap-3 rounded-2xl p-3 transition hover:bg-[#f8f7fb]">
              {person.avatar_url ? (
                <img src={person.avatar_url} alt="" className="h-12 w-12 shrink-0 rounded-full border border-[#ece9f3] object-cover" />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ece8ff] text-base font-bold text-[#5946c7]">
                  {person.full_name.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-[#211f32]">{person.full_name}</p>
                <p className="truncate text-xs text-[#7058d6]">@{person.username}</p>
                {(person.career || person.university) && (
                  <p className="mt-1 truncate text-[11px] text-[#777487]">{[person.career, person.university].filter(Boolean).join(' · ')}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => void toggleFollow(person)}
                disabled={busyPersonId === person.id}
                title={person.is_following ? 'Dejar de seguir esta cuenta' : 'Agregar a tu red'}
                aria-label={person.is_following ? `Dejar de seguir a ${person.full_name}` : `Agregar a ${person.full_name} a tu red`}
                className={`flex h-9 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3 text-xs font-bold transition disabled:opacity-60 ${person.is_following ? 'border border-[#ded9ef] bg-white text-[#5c5870] hover:border-red-200 hover:text-red-600' : 'bg-[#5946c7] text-white hover:bg-[#4433ad]'}`}
              >
                <span className="material-symbols-outlined text-[16px]">{busyPersonId === person.id ? 'progress_activity' : person.is_following ? 'check' : 'person_add'}</span>
                {person.is_following ? 'Siguiendo' : 'Agregar amigo'}
              </button>
            </article>
          ))}
          {errorMessage && <p role="alert" className="m-2 rounded-xl bg-red-50 px-3 py-2.5 text-xs text-red-700">{errorMessage}</p>}
        </div>

        <div className="flex gap-2 border-t border-[#efedf5] p-3 sm:p-4">
          {([
            ['feed', 'Feed', 'home'],
            ['grupos', 'Grupos', 'groups'],
            ['mensajes', 'Mensajes', 'chat'],
          ] as const).map(([tab, label, icon]) => (
            <button key={tab} type="button" onClick={() => { onNavigate(tab); onClose(); }} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#f6f4fa] py-2.5 text-xs font-semibold text-[#5e5a70] transition hover:bg-[#eeebf5]">
              <span className="material-symbols-outlined text-[16px]">{icon}</span>{label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
