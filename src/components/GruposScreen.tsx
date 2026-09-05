import React, { useState } from 'react';
import { CommunityGroup, LiveRoom } from '../types';

interface GruposScreenProps {
  groups: CommunityGroup[];
  liveRooms: LiveRoom[];
  onToggleJoinGroup: (groupId: string) => void;
  onJoinLiveRoom: (room: LiveRoom) => void;
  onOpenCreateGroupModal: () => void;
  onOpenTutorModal: () => void;
}

export const GruposScreen: React.FC<GruposScreenProps> = ({
  groups,
  liveRooms,
  onToggleJoinGroup,
  onJoinLiveRoom,
  onOpenCreateGroupModal,
  onOpenTutorModal,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'materias' | 'clubes' | 'explorar'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGroups = groups.filter((g) => {
    const matchesSearch =
      !searchQuery ||
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.categoryTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'materias') return g.type === 'materias';
    if (selectedFilter === 'clubes') return g.type === 'clubes';
    if (selectedFilter === 'explorar') return !g.isJoined;
    return true;
  });

  return (
    <div className="flex flex-col w-full mx-auto pt-1 pb-20 md:pb-8">
      {/* Search Bar */}
      <div className="px-4 pt-1 pb-2">
        <div className="relative flex items-center w-full shadow-xs rounded-xl bg-[#f2f3ff] border border-[#eaedff]">
          <span className="material-symbols-outlined absolute left-3.5 text-[20px] text-[#464555] select-none pointer-events-none">
            search
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-11 pr-10 bg-transparent text-[#131b2e] placeholder:text-[#464555] text-xs rounded-xl outline-none focus:bg-white focus:shadow-xs transition-all"
            placeholder="Buscar materias, códigos (ej. FIS-201) o clubes..."
            type="text"
          />
          <button
            aria-label="Filtrar"
            className="absolute right-2.5 w-7 h-7 flex items-center justify-center rounded-lg text-[#464555] hover:text-[#3525cd] transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
          </button>
        </div>
      </div>

      {/* Horizontal Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto px-4 py-2 no-scrollbar scroll-smooth">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-3.5 py-2 rounded-full text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all active:scale-95 ${
            selectedFilter === 'all'
              ? 'bg-[#3525cd] text-white shadow-xs'
              : 'bg-[#eaedff] text-[#464555] hover:bg-[#dae2fd]'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[15px]">school</span>
          <span>Mis Grupos ({groups.filter((g) => g.isJoined).length})</span>
        </button>

        <button
          onClick={() => setSelectedFilter('materias')}
          className={`px-3.5 py-2 rounded-full text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all active:scale-95 ${
            selectedFilter === 'materias'
              ? 'bg-[#3525cd] text-white shadow-xs'
              : 'bg-[#eaedff] text-[#464555] hover:bg-[#dae2fd]'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[15px]">menu_book</span>
          <span>Materias en curso</span>
        </button>

        <button
          onClick={() => setSelectedFilter('clubes')}
          className={`px-3.5 py-2 rounded-full text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all active:scale-95 ${
            selectedFilter === 'clubes'
              ? 'bg-[#3525cd] text-white shadow-xs'
              : 'bg-[#eaedff] text-[#464555] hover:bg-[#dae2fd]'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[15px]">sports_esports</span>
          <span>Clubes Universitarios</span>
        </button>

        <button
          onClick={() => setSelectedFilter('explorar')}
          className={`px-3.5 py-2 rounded-full text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all active:scale-95 ${
            selectedFilter === 'explorar'
              ? 'bg-[#3525cd] text-white shadow-xs'
              : 'bg-[#eaedff] text-[#464555] hover:bg-[#dae2fd]'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[15px]">explore</span>
          <span>Encontrar Grupo</span>
        </button>
      </div>

      {/* Live Study Rooms Section */}
      <section className="px-4 mt-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ba1a1a] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ba1a1a]"></span>
            </span>
            <h2 className="text-sm font-bold text-[#131b2e]">Salas en Vivo Ahora</h2>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#8a4cfc]/15 text-[#712ae2] text-[10px] font-bold">
            {liveRooms.length} Activas
          </span>
        </div>

        {/* Live Study Carousel */}
        <div className="grid grid-cols-1 gap-3">
          {liveRooms.map((room) => (
            <div
              key={room.id}
              className="relative overflow-hidden rounded-2xl bg-white p-4 shadow-sm border border-[#eaedff] hover:shadow-md transition-shadow"
            >
              <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-[#3525cd]/5 pointer-events-none"></div>

              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${room.tagColor}`}
                  >
                    <span className="material-symbols-outlined text-[13px] animate-pulse">
                      {room.type === 'pomodoro' ? 'timer' : 'screen_share'}
                    </span>
                    {room.tag}
                  </span>
                  {room.secondaryTag && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#e2e7ff] text-[#464555] text-[10px] font-bold">
                      {room.secondaryTag}
                    </span>
                  )}
                </div>

                <span className="flex items-center gap-1 text-[10px] text-[#006e4b] font-bold bg-[#6ffbbe]/30 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#005338]"></span>
                  {room.onlineCount} online
                </span>
              </div>

              <h3 className="text-sm font-bold text-[#131b2e] line-clamp-1 mb-1">
                {room.title}
              </h3>
              <p className="text-[11px] text-[#464555] mb-3 leading-snug">
                {room.desc}
              </p>

              <div className="flex items-center justify-between pt-1">
                {/* Stacked Avatars */}
                <div className="flex items-center">
                  <div className="flex -space-x-2 overflow-hidden">
                    {room.avatars.map((av, idx) => (
                      <img
                        key={idx}
                        className="inline-block h-7 w-7 rounded-full object-cover ring-2 ring-white bg-[#eaedff]"
                        src={av}
                        alt="participant"
                      />
                    ))}
                    <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#e2dfff] text-[#0f0069] text-[10px] font-bold ring-2 ring-white">
                      +{room.onlineCount - room.avatars.length > 0 ? room.onlineCount - room.avatars.length : 3}
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-[#464555] ml-2">
                    {room.statusText}
                  </span>
                </div>

                <button
                  onClick={() => onJoinLiveRoom(room)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all ${
                    room.isConnected
                      ? 'bg-[#006e4b] text-white'
                      : 'bg-[#3525cd] text-white hover:bg-[#4f46e5]'
                  }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {room.isConnected
                      ? 'check'
                      : room.type === 'pomodoro'
                      ? 'headset_mic'
                      : 'visibility'}
                  </span>
                  <span>
                    {room.isConnected
                      ? 'Conectado'
                      : room.type === 'pomodoro'
                      ? 'Unirse'
                      : 'Mirar'}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Action Banner */}
      <div className="px-4 mt-3">
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-[#3525cd]/10 via-[#712ae2]/10 to-transparent border border-[#eaedff]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#3525cd] flex items-center justify-center text-white shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[22px]">group_add</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-[#131b2e] truncate">
                ¿Crear nuevo grupo o pedir tutoría?
              </span>
              <span className="text-[11px] text-[#464555] truncate">
                Conecta con compañeros de tu facultad
              </span>
            </div>
          </div>
          <button
            onClick={onOpenCreateGroupModal}
            className="shrink-0 px-3 py-2 rounded-xl bg-[#3525cd] text-white text-xs font-bold shadow-xs hover:bg-[#4f46e5] active:scale-95 transition-all flex items-center gap-1"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Crear</span>
          </button>
        </div>
      </div>

      {/* Communities Directory */}
      <section className="px-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#3525cd] text-[20px]">
              hub
            </span>
            <h2 className="text-sm font-bold text-[#131b2e]">Comunidades Destacadas</h2>
          </div>
          <button
            onClick={() => alert('Explorando todas las comunidades de la universidad')}
            className="text-xs text-[#3525cd] font-semibold flex items-center gap-0.5 hover:underline"
            type="button"
          >
            <span>Ver todos</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>

        {/* Responsive Community Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {filteredGroups.map((group) => (
            <article
              key={group.id}
              className="relative overflow-hidden rounded-2xl bg-white p-4 shadow-xs border border-[#eaedff] hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start gap-3.5">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 shadow-xs bg-[#eaedff]">
                  <img
                    className="w-full h-full object-cover"
                    src={group.image}
                    alt={group.title}
                  />
                  <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-[#006e4b] ring-2 ring-white"></span>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${group.categoryColor}`}
                    >
                      {group.categoryTag}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#e2e7ff] text-[#464555] text-[10px] font-bold">
                      {group.badgeTag}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-[#131b2e] truncate">
                    {group.title}
                  </h3>
                  <p className="text-[11px] text-[#464555] mt-0.5 line-clamp-1">
                    {group.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2.5 bg-[#f2f3ff]/60 -mx-4 -mb-4 px-4 py-2.5 rounded-b-2xl border-t border-[#eaedff]">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-[#464555] text-[10px]">
                    <span className="material-symbols-outlined text-[15px] text-[#3525cd]">
                      groups
                    </span>
                    <span className="font-bold text-[#131b2e]">
                      {group.membersCount.toLocaleString()}
                    </span>{' '}
                    miembros
                  </div>
                  <div className="flex items-center gap-1 text-[#464555] text-[10px]">
                    <span
                      className={`material-symbols-outlined text-[15px] ${
                        group.activityColor || 'text-[#712ae2]'
                      }`}
                    >
                      {group.activityIcon}
                    </span>
                    <span>{group.activityNote}</span>
                  </div>
                </div>

                <button
                  onClick={() => onToggleJoinGroup(group.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95 ${
                    group.isJoined
                      ? 'bg-[#e2e7ff] text-[#131b2e]'
                      : 'bg-[#3525cd] text-white shadow-xs hover:bg-[#4f46e5]'
                  }`}
                  type="button"
                >
                  <span
                    className={`material-symbols-outlined text-[16px] ${
                      group.isJoined ? 'text-[#006e4b]' : ''
                    }`}
                  >
                    {group.isJoined ? 'check_circle' : 'person_add'}
                  </span>
                  <span>{group.isJoined ? 'Unido' : 'Unirme'}</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Peer Tutoring Promo Card */}
      <section className="px-4 mt-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#3525cd] via-[#4f46e5] to-[#712ae2] p-4 text-white shadow-md">
          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex flex-col max-w-[70%]">
              <div className="flex items-center gap-1 text-[#dad7ff] mb-1">
                <span className="material-symbols-outlined text-[16px]">lightbulb</span>
                <span className="text-[10px] uppercase tracking-wider font-bold">
                  Red de Tutorías
                </span>
              </div>
              <h4 className="text-sm font-bold leading-tight">
                ¿Dificultad con una materia?
              </h4>
              <p className="text-[11px] text-white/85 mt-1">
                Conecta con tutores calificados de últimos semestres con tarifa
                estudiantil o canje de créditos.
              </p>
            </div>
            <button
              onClick={onOpenTutorModal}
              className="px-3.5 py-2 rounded-xl bg-white text-[#3525cd] text-xs font-bold shadow-md hover:bg-[#faf8ff] active:scale-95 transition-transform shrink-0"
              type="button"
            >
              Pedir Tutor
            </button>
          </div>
          <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none"></div>
          <div className="absolute -left-6 -bottom-6 w-28 h-28 rounded-full bg-[#8a4cfc]/20 blur-lg pointer-events-none"></div>
        </div>
      </section>
    </div>
  );
};
