import React, { useState } from 'react';
import { ScreenTab } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: ScreenTab) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const quickLinks = [
    { title: 'Calculadora TI-Nspire CX II', tab: 'market' as ScreenTab, icon: 'shopping_bag' },
    { title: 'Apuntes Anatomía Cardiovascular PDF', tab: 'feed' as ScreenTab, icon: 'picture_as_pdf' },
    { title: 'Club de Robótica y Automatización', tab: 'grupos' as ScreenTab, icon: 'groups' },
    { title: 'Chat con Mateo Silva', tab: 'mensajes' as ScreenTab, icon: 'chat' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-3 pt-16">
      <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#eaedff] flex flex-col animate-in fade-in">
        <div className="p-3 border-b border-[#eaedff] flex items-center gap-2">
          <span className="material-symbols-outlined text-[#3525cd] text-[22px]">
            search
          </span>
          <input
            autoFocus
            type="text"
            placeholder="Buscar apuntes, materias, compañeros, libros..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-xs text-[#131b2e] outline-none"
          />
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#464555] hover:bg-[#eaedff]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="p-3 flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-[#777587] px-2 py-1">
            Búsquedas sugeridas en el campus
          </span>
          {quickLinks.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                onNavigate(item.tab);
                onClose();
              }}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[#f2f3ff] text-left transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-[#e2e7ff] text-[#3525cd] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
              </div>
              <span className="text-xs font-semibold text-[#131b2e] flex-1 truncate">
                {item.title}
              </span>
              <span className="material-symbols-outlined text-[16px] text-[#777587]">
                arrow_forward
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
