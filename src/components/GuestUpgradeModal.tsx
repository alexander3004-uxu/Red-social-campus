import React from 'react';

interface GuestUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string | null;
  onNavigateToRegister?: () => void;
}

export const GuestUpgradeModal: React.FC<GuestUpgradeModalProps> = ({ isOpen, onClose, featureName, onNavigateToRegister }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#131b2e]/60 p-4 backdrop-blur-sm" role="presentation">
      <section className="relative w-full max-w-md rounded-3xl border border-[#e2e7ff] bg-white p-7 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="account-upgrade-title">
        <button onClick={onClose} type="button" aria-label="Cerrar" className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#f2f3ff] text-[#464555] hover:bg-[#eaedff]">
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3525cd] to-[#712ae2] text-white shadow-md">
          <span className="material-symbols-outlined text-2xl">person_add</span>
        </div>
        <h2 id="account-upgrade-title" className="text-xl font-bold text-[#17152b]">Crea tu cuenta</h2>
        <p className="mt-2 text-sm leading-6 text-[#69677a]">
          {featureName ? `Para ${featureName}, ` : ''}crea una cuenta con correo y contraseña para participar en CampusLink.
        </p>
        <button
          onClick={() => {
            onClose();
            onNavigateToRegister?.();
          }}
          type="button"
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3525cd] to-[#712ae2] text-sm font-bold text-white shadow-md hover:brightness-105"
        >
          <span className="material-symbols-outlined text-[18px]">badge</span>
          Crear cuenta con correo
        </button>
        <button onClick={onClose} type="button" className="mt-3 w-full py-2 text-center text-xs font-semibold text-[#777587] hover:text-[#17152b]">
          Cerrar
        </button>
      </section>
    </div>
  );
};
