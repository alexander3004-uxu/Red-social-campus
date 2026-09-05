import React from 'react';
import { MarketItem } from '../types';

interface ItemDetailModalProps {
  item: MarketItem | null;
  isOpen: boolean;
  onClose: () => void;
  onChat: (seller: string, title: string, price: number) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onChat,
}) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#eaedff] flex flex-col animate-in fade-in">
        {/* Top Image Banner */}
        <div className="relative w-full h-56 bg-[#eaedff]">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
          <div className="absolute bottom-3 left-3 bg-[#131b2e]/80 backdrop-blur-md px-3 py-1 rounded-full text-white text-sm font-extrabold">
            ${item.price.toFixed(2)}
          </div>
        </div>

        {/* Details Body */}
        <div className="p-4 overflow-y-auto space-y-3">
          <div className="flex items-center justify-between">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${item.conditionColor}`}>
              Estado: {item.condition}
            </span>
            <span className="text-xs text-[#464555] font-semibold">
              Facultad: {item.faculty}
            </span>
          </div>

          <h3 className="text-base font-bold text-[#131b2e] leading-snug">
            {item.title}
          </h3>

          <div className="p-3 bg-[#f2f3ff] rounded-2xl flex items-center justify-between border border-[#eaedff]">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#3525cd]/15 flex items-center justify-center text-[#3525cd] font-bold text-sm">
                {item.seller.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#131b2e]">{item.seller}</span>
                <span className="text-[10px] text-[#006e4b] font-semibold flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[12px]">verified</span>{' '}
                  {item.rating} de calificación
                </span>
              </div>
            </div>
            <span className="text-[10px] text-[#712ae2] font-bold bg-[#eaddff] px-2 py-0.5 rounded-full">
              Vendedor Verificado
            </span>
          </div>

          <div className="p-3 bg-[#e2dfff]/40 rounded-2xl flex items-start gap-2.5 text-xs text-[#464555]">
            <span className="material-symbols-outlined text-[#3525cd] text-[20px] shrink-0">
              verified_user
            </span>
            <div className="flex flex-col">
              <span className="font-bold text-[#0f0069]">Punto de Entrega Sugerido</span>
              <span className="text-[11px]">{item.location} • Monitoreado por seguridad universitaria.</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#eaedff] flex items-center gap-2">
          <button
            onClick={() => {
              onClose();
              onChat(item.seller, item.title, item.price);
            }}
            className="flex-1 py-3 bg-[#3525cd] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#4f46e5] active:scale-95 transition-all shadow-md"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            <span>Chatear con {item.seller}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
