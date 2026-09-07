/**
 * src/components/GuestUpgradeModal.tsx
 * Modal interactivo para conversión / upgrade de sesión de Invitado a cuenta completa.
 * Se presenta de forma no intrusiva cuando el usuario intenta realizar acciones restringidas (escribir, publicar, chatear).
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface GuestUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string | null;
  onNavigateToRegister?: () => void;
}

export const GuestUpgradeModal: React.FC<GuestUpgradeModalProps> = ({
  isOpen,
  onClose,
  featureName,
  onNavigateToRegister,
}) => {
  const { loginWithGoogle } = useAuth();
  const [isProcessingGoogle, setIsProcessingGoogle] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulatedGoogleSignIn = async () => {
    setIsProcessingGoogle(true);
    setErrorMessage(null);
    try {
      // Simulación de Google Identity Services token para prueba o flujo de un solo toque
      // En entorno de producción, utiliza el token real emitido por google.accounts.id
      const mockGoogleSub = `g_upgrade_${Date.now()}`;
      const mockPayload = {
        sub: mockGoogleSub,
        email: `estudiante.${Date.now().toString(36)}@ucentral.edu`,
        name: 'Estudiante Google Campus',
        picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        email_verified: true,
      };
      const mockJwt = `header.${btoa(JSON.stringify(mockPayload))}.signature`;

      await loginWithGoogle(mockJwt);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al conectar con Google Identity.');
    } finally {
      setIsProcessingGoogle(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131b2e]/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#e2e7ff] flex flex-col space-y-5 animate-scale-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Botón de cierre */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#f2f3ff] hover:bg-[#eaedff] flex items-center justify-center text-[#464555] transition-colors"
          aria-label="Cerrar modal"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {/* Encabezado con Icono y Badge */}
        <div className="flex flex-col items-center text-center pt-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#3525cd] to-[#712ae2] flex items-center justify-center text-white shadow-md shadow-[#3525cd]/25 mb-3">
            <span className="material-symbols-outlined text-3xl">lock_open</span>
          </div>

          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#e2dfff] text-[#3323cc] text-[11px] font-bold uppercase tracking-wider mb-1">
            Modo Invitado (Solo Lectura)
          </span>

          <h2 className="text-xl font-bold text-[#131b2e] leading-tight">
            Desbloquea el acceso completo
          </h2>

          <p className="text-xs text-[#464555] mt-1 max-w-xs">
            Para <strong className="text-[#3525cd]">{featureName || 'participar e interactuar'}</strong>, necesitas vincular tu cuenta institucional sin perder tu sesión actual.
          </p>
        </div>

        {/* Beneficios de la Cuenta Estudiantil */}
        <div className="bg-[#f2f3ff] rounded-2xl p-4 space-y-2 border border-[#eaedff]">
          <div className="text-[11px] font-bold text-[#131b2e] uppercase tracking-wide">
            Beneficios exclusivos para estudiantes:
          </div>
          <ul className="space-y-1.5 text-xs text-[#464555]">
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-[#006e4b]">check_circle</span>
              <span>Carnet Digital Universitario y credencial NFC</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-[#006e4b]">check_circle</span>
              <span>Publicar apuntes, consultas y encuestas en el feed</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-[#006e4b]">check_circle</span>
              <span>Mensajería en tiempo real y salas de estudio</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-[#006e4b]">check_circle</span>
              <span>Publicar libros o calculadoras en el Campus Market</span>
            </li>
          </ul>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-[#ffdad6] text-[#410002] text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-[#ba1a1a]">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Botones de Acción */}
        <div className="flex flex-col space-y-2.5 pt-1">
          {/* Opción 1: Unirse con Google OAuth (1 Clic) */}
          <button
            onClick={handleSimulatedGoogleSignIn}
            disabled={isProcessingGoogle}
            type="button"
            className="w-full h-12 bg-white hover:bg-[#faf8ff] active:scale-[0.99] border border-[#d6d0ff] rounded-2xl px-4 flex items-center justify-center gap-3 shadow-xs transition-all font-semibold text-xs text-[#131b2e]"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17Z"
                fill="#4285F4"
              />
              <path
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24Z"
                fill="#34A853"
              />
              <path
                d="M5.28 14.27A7.17 7.17 0 0 1 4.9 12c0-.79.14-1.57.38-2.27V6.58H1.25A11.96 11.96 0 0 0 0 12c0 1.92.45 3.74 1.25 5.42l4.03-3.15Z"
                fill="#FBBC05"
              />
              <path
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                fill="#EA4335"
              />
            </svg>
            <span>{isProcessingGoogle ? 'Vinculando...' : 'Acceder al instante con Google'}</span>
          </button>

          {/* Opción 2: Registro con Correo Institucional */}
          <button
            onClick={() => {
              onClose();
              if (onNavigateToRegister) {
                onNavigateToRegister();
              }
            }}
            type="button"
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#3525cd] to-[#712ae2] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:brightness-105 active:scale-[0.99] transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">badge</span>
            <span>Crear cuenta con correo institucional</span>
          </button>

          {/* Continuar explorando */}
          <button
            onClick={onClose}
            type="button"
            className="w-full py-2 text-center text-xs text-[#777587] hover:text-[#131b2e] transition-colors font-semibold"
          >
            Seguir explorando en modo lectura
          </button>
        </div>
      </div>
    </div>
  );
};
