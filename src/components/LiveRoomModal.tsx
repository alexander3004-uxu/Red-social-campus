import React, { useState, useEffect } from 'react';
import { LiveRoom } from '../types';

interface LiveRoomModalProps {
  room: LiveRoom | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LiveRoomModal: React.FC<LiveRoomModalProps> = ({
  room,
  isOpen,
  onClose,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (!isOpen || !isRunning) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 25 * 60));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isRunning]);

  if (!isOpen || !room) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md bg-[#131b2e] rounded-3xl overflow-hidden shadow-2xl border border-white/10 text-white flex flex-col animate-in fade-in">
        {/* Header */}
        <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a] animate-ping"></span>
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              SALA DE ESTUDIO EN VIVO
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Room Title */}
        <div className="p-4 text-center">
          <h3 className="text-lg font-bold text-white mb-1">{room.title}</h3>
          <p className="text-xs text-white/70">{room.desc}</p>
        </div>

        {/* Big Pomodoro Counter */}
        <div className="my-2 flex flex-col items-center justify-center">
          <div className="relative w-44 h-44 rounded-full border-4 border-[#3525cd] flex flex-col items-center justify-center bg-white/5 shadow-inner">
            <span className="text-3xl font-mono font-bold tracking-widest text-white">
              {formattedTime}
            </span>
            <span className="text-[10px] text-[#6ffbbe] font-bold uppercase tracking-wider mt-1">
              {isRunning ? 'Sesión de Enfoque' : 'Pausado'}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="px-4 py-2 rounded-xl bg-[#3525cd] text-white text-xs font-bold flex items-center gap-1 hover:bg-[#4f46e5]"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isRunning ? 'pause' : 'play_arrow'}
              </span>
              <span>{isRunning ? 'Pausar' : 'Reanudar'}</span>
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 ${
                isMuted ? 'bg-white/10 text-white' : 'bg-[#006e4b] text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isMuted ? 'volume_off' : 'volume_up'}
              </span>
              <span>{isMuted ? 'Audio silenciado' : 'Música Lo-Fi'}</span>
            </button>
          </div>
        </div>

        {/* Active Participants */}
        <div className="p-4 bg-white/5 mt-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {room.avatars.map((av, i) => (
                <img
                  key={i}
                  src={av}
                  alt="participant"
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-[#131b2e]"
                />
              ))}
            </div>
            <span className="text-xs text-white/80 font-medium">
              {room.onlineCount} compañeros estudiando ahora
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold"
          >
            Salir
          </button>
        </div>
      </div>
    </div>
  );
};
