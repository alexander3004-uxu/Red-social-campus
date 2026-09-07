import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIOSModal, setShowIOSModal] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [showOnlineToast, setShowOnlineToast] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  useEffect(() => {
    // Check if app is running in standalone mode (already installed)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    // Check for iOS platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);

    if (isIOSDevice && !isStandalone) {
      setIsIOS(true);
      const iosDismissed = localStorage.getItem('campuslink_ios_pwa_dismissed');
      if (!iosDismissed) {
        setShowBanner(true);
      }
    }

    // Capture beforeinstallprompt for Android / Chrome / Edge / Desktop
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);

      const promptDismissed = localStorage.getItem('campuslink_pwa_dismissed');
      if (!promptDismissed) {
        setShowBanner(true);
      }
    };

    // Capture appinstalled event
    const handleAppInstalled = () => {
      setShowBanner(false);
      setDeferredPrompt(null);
      setIsStandalone(true);
      localStorage.setItem('campuslink_pwa_installed', 'true');
    };

    // Network status listeners
    const handleOffline = () => {
      setIsOffline(true);
      setShowOnlineToast(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setShowOnlineToast(true);
      setTimeout(() => setShowOnlineToast(false), 3500);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [isStandalone]);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('[PWA] User accepted the install prompt');
    } else {
      console.log('[PWA] User dismissed the install prompt');
    }

    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismissBanner = () => {
    setShowBanner(false);
    if (isIOS) {
      localStorage.setItem('campuslink_ios_pwa_dismissed', 'true');
    } else {
      localStorage.setItem('campuslink_pwa_dismissed', 'true');
    }
  };

  if (isStandalone) {
    return (
      <>
        {/* Offline notification banner for standalone mode */}
        {isOffline && (
          <div className="fixed top-0 inset-x-0 z-[100] bg-[#ba1a1a] text-white py-1.5 px-4 text-center text-xs font-bold shadow-md flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300">
            <span className="material-symbols-outlined text-[16px]">wifi_off</span>
            <span>Modo sin conexión. Usando datos guardados localmente.</span>
          </div>
        )}
        {showOnlineToast && (
          <div className="fixed top-0 inset-x-0 z-[100] bg-[#006e4b] text-white py-1.5 px-4 text-center text-xs font-bold shadow-md flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300">
            <span className="material-symbols-outlined text-[16px]">wifi</span>
            <span>¡Conexión a internet restablecida!</span>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {/* Network Status Top Alerts */}
      {isOffline && (
        <div className="fixed top-0 inset-x-0 z-[100] bg-[#ba1a1a] text-white py-1.5 px-3 text-center text-xs font-bold shadow-md flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[16px]">wifi_off</span>
          <span>Modo sin conexión. Puedes seguir usando la app offline.</span>
        </div>
      )}

      {showOnlineToast && (
        <div className="fixed top-0 inset-x-0 z-[100] bg-[#006e4b] text-white py-1.5 px-3 text-center text-xs font-bold shadow-md flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[16px]">wifi</span>
          <span>Conexión restablecida.</span>
        </div>
      )}

      {/* Floating PWA Install Prompt Banner */}
      {showBanner && (
        <div className="fixed bottom-20 md:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-[90] bg-[#131b2e]/95 backdrop-blur-xl text-white p-4 rounded-3xl shadow-2xl border border-white/10 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start gap-3.5">
            <img
              src="/icon-192.png"
              alt="CampusLink App Icon"
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#3525cd] shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-white truncate">Instalar CampusLink</h4>
                <span className="px-1.5 py-0.5 rounded-full bg-[#6ffbbe]/20 text-[#6ffbbe] text-[9px] font-bold uppercase tracking-wider">
                  App Nativa
                </span>
              </div>
              <p className="text-xs text-[#dae2fd] mt-0.5 leading-snug">
                Instala la app en tu dispositivo para un acceso rápido, sin barras del navegador y soporte offline.
              </p>
            </div>
            <button
              onClick={handleDismissBanner}
              className="text-[#777587] hover:text-white p-1 rounded-full transition-colors shrink-0"
              title="Cerrar banner"
              aria-label="Cerrar banner de instalación"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="flex-1 py-2 px-4 rounded-xl bg-gradient-to-r from-[#3525cd] to-[#712ae2] text-white text-xs font-bold flex items-center justify-center gap-2 hover:opacity-95 active:scale-98 transition-all shadow-md"
            >
              <span className="material-symbols-outlined text-[18px]">download_for_offline</span>
              <span>{isIOS ? 'Cómo Instalar en iOS' : 'Instalar App'}</span>
            </button>
            <button
              onClick={handleDismissBanner}
              className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
            >
              Ahora no
            </button>
          </div>
        </div>
      )}

      {/* iOS Safari Instruction Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-[#131b2e] shadow-2xl space-y-4 animate-in slide-in-from-bottom-6 duration-300">
            <div className="flex items-center justify-between border-b border-[#eaedff] pb-3">
              <div className="flex items-center gap-2.5">
                <img src="/apple-touch-icon.png" alt="App Icon" className="w-9 h-9 rounded-xl" />
                <div>
                  <h3 className="font-bold text-sm text-[#131b2e]">Instalar en iOS / Safari</h3>
                  <p className="text-[11px] text-[#464555]">Sigue estos sencillos pasos</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="w-8 h-8 rounded-full bg-[#f2f3ff] flex items-center justify-center text-[#464555] hover:bg-[#eaedff]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#131b2e]">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#faf8ff] border border-[#eaedff]">
                <span className="w-6 h-6 rounded-full bg-[#3525cd] text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </span>
                <p>
                  Presiona el botón <strong>Compartir</strong>{' '}
                  <span className="inline-block px-1.5 py-0.5 bg-[#eaedff] rounded text-[11px]">
                    <span className="material-symbols-outlined text-[14px] align-middle">ios_share</span>
                  </span>{' '}
                  en la barra inferior o superior de Safari.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#faf8ff] border border-[#eaedff]">
                <span className="w-6 h-6 rounded-full bg-[#3525cd] text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </span>
                <p>
                  Desplázate hacia abajo en las opciones del menú y selecciona{' '}
                  <strong>&quot;Agregar a inicio&quot;</strong> (o &quot;Add to Home Screen&quot;).
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#faf8ff] border border-[#eaedff]">
                <span className="w-6 h-6 rounded-full bg-[#3525cd] text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </span>
                <p>
                  Toca <strong>&quot;Agregar&quot;</strong> en la esquina superior derecha y la app aparecerá en tu pantalla principal.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#3525cd] text-white text-xs font-bold hover:bg-[#4f46e5] transition-colors"
            >
              ¡Entendido!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
