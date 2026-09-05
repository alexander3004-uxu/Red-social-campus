import React, { useState } from 'react';
import { ChatThread } from '../types';
import { CURRENT_USER } from '../data/mockData';

interface ChatModalProps {
  chat: ChatThread | null;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (chatId: string, messageText: string) => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  chat,
  isOpen,
  onClose,
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState('');
  const [agreedSafePoint, setAgreedSafePoint] = useState(false);

  if (!isOpen || !chat) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(chat.id, inputText.trim());
    setInputText('');
  };

  const quickReplies = [
    '¿Nos vemos en el Hall de Biblioteca?',
    '¿Sigue disponible?',
    'Voy en camino al punto seguro',
    '¡Perfecto, muchas gracias!',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-md h-[88vh] max-h-[700px] bg-[#faf8ff] rounded-3xl overflow-hidden shadow-2xl border border-[#eaedff] flex flex-col relative animate-in fade-in">
        {/* Header */}
        <div className="bg-white px-4 py-3 border-b border-[#eaedff] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#464555] hover:bg-[#eaedff] transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#eaedff] shrink-0">
              {chat.avatar ? (
                <img
                  alt={chat.name}
                  className="w-full h-full object-cover"
                  src={chat.avatar}
                />
              ) : (
                <div className="w-full h-full bg-[#e2dfff] flex items-center justify-center text-[#0f0069]">
                  <span className="material-symbols-outlined text-[20px]">school</span>
                </div>
              )}
              {chat.isOnline && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#006e4b] ring-2 ring-white"></span>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-[#131b2e] truncate">
                  {chat.name}
                </h3>
                {chat.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-[#eaddff] text-[#25005a]">
                    {chat.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-[#006e4b] font-semibold">
                {chat.isOnline ? 'En el campus ahora' : 'Visto hace poco'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => alert('Llamada de voz institucional cifrada en campus')}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#464555] hover:bg-[#eaedff]"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">call</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#464555] hover:bg-[#eaedff]"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Market Context Top Ribbon if available */}
        {chat.productInfo && (
          <div className="bg-[#e2dfff]/70 px-4 py-2 flex items-center justify-between border-b border-[#c7c4d8]/40 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-[#3525cd] text-[18px]">
                {chat.productInfo.icon}
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[#0f0069] truncate">
                  {chat.productInfo.name}
                </span>
                {chat.productInfo.price && (
                  <span className="text-[10px] text-[#464555] font-semibold">
                    Precio acordado: ${chat.productInfo.price}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                setAgreedSafePoint(true);
                onSendMessage(
                  chat.id,
                  '📍 He fijado el intercambio en Punto Seguro: Hall Biblioteca Central a las 3:00 PM.'
                );
              }}
              className="px-2.5 py-1 rounded-lg bg-[#3525cd] text-white text-[10px] font-bold shadow-xs active:scale-95 transition-transform"
              type="button"
            >
              {agreedSafePoint ? 'Punto Acordado' : 'Fijar Punto Seguro'}
            </button>
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Safe Meeting Point Notice */}
          <div className="mx-auto max-w-[280px] bg-[#f2f3ff] rounded-xl p-2.5 text-center text-[10px] text-[#464555] border border-[#eaedff]">
            <span className="material-symbols-outlined text-[16px] text-[#006e4b] inline-block align-middle mr-1">
              verified_user
            </span>
            <span>
              Chat protegido por credenciales universitarias. Realiza intercambios en
              puntos seguros vigilados.
            </span>
          </div>

          {chat.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.isSender ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs leading-relaxed ${
                  msg.isSender
                    ? 'bg-[#3525cd] text-white rounded-br-xs'
                    : 'bg-white text-[#131b2e] rounded-bl-xs border border-[#eaedff]'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[9px] text-[#777587] mt-0.5 px-1">
                {msg.time} {msg.isSender && '✓✓'}
              </span>
            </div>
          ))}
        </div>

        {/* Quick reply chips */}
        <div className="px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-white/70 border-t border-[#eaedff] shrink-0">
          {quickReplies.map((qr, i) => (
            <button
              key={i}
              onClick={() => onSendMessage(chat.id, qr)}
              className="px-2.5 py-1 rounded-full bg-[#eaedff] hover:bg-[#dae2fd] text-[10px] font-semibold text-[#3525cd] whitespace-nowrap active:scale-95 transition-all"
              type="button"
            >
              {qr}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSend}
          className="bg-white p-3 border-t border-[#eaedff] flex items-center gap-2 shrink-0"
        >
          <button
            type="button"
            onClick={() => alert('Adjuntar archivo académico o foto de producto')}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#464555] hover:bg-[#eaedff] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">attach_file</span>
          </button>
          <input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 h-10 px-3 rounded-xl bg-[#f2f3ff] text-xs text-[#131b2e] outline-none focus:bg-white focus:ring-1 focus:ring-[#3525cd] transition-all"
          />
          <button
            type="submit"
            className="w-10 h-10 rounded-xl bg-[#3525cd] text-white flex items-center justify-center shadow-xs hover:bg-[#4f46e5] active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
