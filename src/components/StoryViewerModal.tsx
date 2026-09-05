import React, { useEffect, useState } from 'react';
import { Story } from '../types';

interface StoryViewerModalProps {
  story: Story | null;
  isOpen: boolean;
  onClose: () => void;
  onNextStory?: () => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  story,
  isOpen,
  onClose,
}) => {
  const [progress, setProgress] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      return;
    }
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          onClose();
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, onClose]);

  if (!isOpen || !story) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-sm h-[80vh] max-h-[640px] bg-[#131b2e] rounded-3xl overflow-hidden shadow-2xl relative flex flex-col justify-between p-4 text-white">
        {/* Background Image / Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{ backgroundImage: `url('${story.avatarUrl}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/70 pointer-events-none" />

        {/* Progress Bar & Header */}
        <div className="relative z-10 space-y-3">
          {/* Progress Bar */}
          <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
            <div
              className="bg-white h-full transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* User Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={story.avatarUrl}
                alt={story.title}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-white/50"
              />
              <div className="flex flex-col">
                <span className="text-xs font-bold leading-tight">{story.title}</span>
                <span className="text-[10px] text-white/70">Hace 2 horas • Campus Central</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Center Content / Caption */}
        <div className="relative z-10 text-center px-4 my-auto">
          <div className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-3">
            📍 Biblioteca Central Piso 3
          </div>
          <p className="text-base font-medium text-white/95 leading-relaxed drop-shadow-md">
            "Espacio de estudio silencioso disponible con conexión de alta velocidad. ¡Ven a preparar tus parciales!"
          </p>
        </div>

        {/* Bottom Reaction / Reply Bar */}
        <div className="relative z-10 flex items-center gap-2 pt-3 border-t border-white/10">
          <input
            type="text"
            placeholder="Responder a esta historia..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="flex-1 bg-white/20 backdrop-blur-md px-3.5 py-2 rounded-full text-xs text-white placeholder:text-white/60 outline-none border border-white/20 focus:bg-white/30"
          />
          <button
            onClick={() => {
              if (comment.trim()) {
                alert(`Respuesta enviada: "${comment}"`);
                setComment('');
                onClose();
              }
            }}
            className="w-9 h-9 rounded-full bg-[#3525cd] flex items-center justify-center shadow-md active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
