import React from 'react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 1,
      title: 'Oferta recibida en Marketplace',
      desc: 'Mateo S. te envió un mensaje para acordar la entrega de la calculadora.',
      time: 'Hace 5m',
      icon: 'shopping_bag',
      iconBg: 'bg-[#eaddff] text-[#712ae2]',
      unread: true,
    },
    {
      id: 2,
      title: 'Aviso de Facultad de Ingeniería',
      desc: 'El Aula 204 de Algoritmos cuenta con proyector nuevo y aire acondicionado.',
      time: 'Hace 45m',
      icon: 'campaign',
      iconBg: 'bg-[#e2dfff] text-[#3525cd]',
      unread: true,
    },
    {
      id: 3,
      title: 'Descarga de tus Apuntes',
      desc: '18 compañeros han descargado tu resumen de Árboles AVL & Grafos hoy.',
      time: 'Hace 2h',
      icon: 'download_done',
      iconBg: 'bg-[#6ffbbe]/30 text-[#005338]',
      unread: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-3 pt-16">
      <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#eaedff] flex flex-col animate-in fade-in">
        <div className="p-4 border-b border-[#eaedff] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-[#3525cd]">
              notifications
            </span>
            <h3 className="text-sm font-bold text-[#131b2e]">Notificaciones del Campus</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#464555] hover:bg-[#eaedff]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="p-3 flex flex-col gap-2 max-h-[400px] overflow-y-auto">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-3 rounded-2xl flex items-start gap-3 transition-colors ${
                notif.unread ? 'bg-[#f2f3ff]' : 'bg-white'
              } border border-[#eaedff]`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${notif.iconBg}`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {notif.icon}
                </span>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-bold text-[#131b2e] truncate">
                    {notif.title}
                  </span>
                  <span className="text-[10px] text-[#777587] shrink-0">{notif.time}</span>
                </div>
                <p className="text-[11px] text-[#464555] leading-snug">{notif.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-[#f2f3ff] text-center border-t border-[#eaedff]">
          <button
            onClick={onClose}
            className="text-xs text-[#3525cd] font-bold hover:underline"
          >
            Marcar todas como leídas
          </button>
        </div>
      </div>
    </div>
  );
};
