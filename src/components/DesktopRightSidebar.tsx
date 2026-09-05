import React from 'react';
import { LiveRoom } from '../types';

interface DesktopRightSidebarProps {
  liveRooms: LiveRoom[];
  onJoinLiveRoom: (room: LiveRoom) => void;
  onOpenDonateModal: () => void;
}

export const DesktopRightSidebar: React.FC<DesktopRightSidebarProps> = ({
  liveRooms,
  onJoinLiveRoom,
  onOpenDonateModal,
}) => {
  return (
    <aside className="hidden xl:flex flex-col w-80 shrink-0 space-y-4 sticky top-20 self-start">
      {/* Live Study Rooms widget */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#eaedff] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a] animate-pulse"></span>
            <h3 className="text-xs font-bold text-[#131b2e] uppercase tracking-wider">
              Salas de Estudio en Vivo
            </h3>
          </div>
          <span className="text-[10px] font-bold text-[#3525cd] bg-[#eaedff] px-2 py-0.5 rounded-full">
            Pomodoro
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {liveRooms.slice(0, 2).map((room) => (
            <div
              key={room.id}
              className="p-3 rounded-2xl bg-[#f2f3ff] hover:bg-[#eaedff] transition-colors border border-[#eaedff] flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-[#131b2e] leading-snug">{room.title}</h4>
                  <span className="text-[10px] text-[#464555]">{room.desc}</span>
                </div>
                <span className="text-[10px] font-bold text-[#006e4b] bg-[#6ffbbe]/25 px-1.5 py-0.5 rounded-md shrink-0">
                  {room.onlineCount} online
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#e2e7ff]">
                <div className="flex -space-x-2 overflow-hidden">
                  {room.avatars.slice(0, 3).map((av, idx) => (
                    <img
                      key={idx}
                      src={av}
                      alt="Student"
                      className="w-5 h-5 rounded-full object-cover ring-1 ring-white"
                    />
                  ))}
                </div>
                <button
                  onClick={() => onJoinLiveRoom(room)}
                  className="px-2.5 py-1 bg-[#3525cd] hover:bg-[#4f46e5] text-white rounded-lg text-[11px] font-bold active:scale-95 transition-all flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">headset_mic</span>
                  <span>Unirme</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Safe Exchange Zones widget */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#eaedff] flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#3525cd] text-[20px]">
            verified_user
          </span>
          <h3 className="text-xs font-bold text-[#131b2e] uppercase tracking-wider">
            Zonas de Entrega Segura
          </h3>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded-2xl bg-[#f2f3ff] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#3525cd] text-[18px]">
                local_library
              </span>
              <div>
                <p className="font-bold text-[#131b2e] text-[11px]">Hall Biblioteca Central</p>
                <p className="text-[10px] text-[#464555]">Cámaras y seguridad activa</p>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-[#006e4b]" title="Zona Activa"></span>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#f2f3ff] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#712ae2] text-[18px]">
                restaurant
              </span>
              <div>
                <p className="font-bold text-[#131b2e] text-[11px]">Cafetería Facultad Norte</p>
                <p className="text-[10px] text-[#464555]">Punto de encuentro público</p>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-[#006e4b]" title="Zona Activa"></span>
          </div>
        </div>

        <button
          onClick={onOpenDonateModal}
          className="w-full py-2 bg-[#6ffbbe]/25 hover:bg-[#6ffbbe]/40 text-[#005338] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">volunteer_activism</span>
          <span>Donación Solidaria de Libros</span>
        </button>
      </div>

      {/* Trending Campus Topics */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#eaedff] flex flex-col gap-2.5">
        <h3 className="text-xs font-bold text-[#131b2e] uppercase tracking-wider">
          Tendencias en el Campus
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {['#Ingeniería', '#CálculoVectorial', '#Hackathon2025', '#Anatomía', '#Tutorías', '#Finales'].map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-full bg-[#eaedff] text-[#3525cd] text-[11px] font-bold hover:bg-[#dfe4ff] cursor-pointer transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
};
