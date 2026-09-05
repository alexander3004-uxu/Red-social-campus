import React, { useState } from 'react';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  selectedCampus: string;
  onSelectCampus: (campus: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  selectedCampus,
  onSelectCampus,
}) => {
  const [email, setEmail] = useState('sofia.valenzuela@ucentral.edu');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showCampusDropdown, setShowCampusDropdown] = useState(false);
  const [isBiometricScanning, setIsBiometricScanning] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isEdu =
    email.toLowerCase().includes('.edu') ||
    email.toLowerCase().includes('.ac.') ||
    email.toLowerCase().includes('.edu.');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleBiometric = () => {
    setIsBiometricScanning(true);
    triggerToast('Escaneando Face ID y Credencial NFC...');
    setTimeout(() => {
      setIsBiometricScanning(false);
      setBiometricSuccess(true);
      triggerToast('¡Identidad Biométrica verificada exitosamente!');
      setTimeout(() => {
        onLoginSuccess();
      }, 700);
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] flex flex-col justify-center items-center px-4 py-8 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#131b2e] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <span className="material-symbols-outlined text-[18px] text-[#67f4b7]">
            verified
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="w-full max-w-md flex flex-col space-y-5">
        {/* Brand & Mascot / Logo Header */}
        <div className="flex flex-col items-center text-center pt-2">
          <div className="relative w-24 h-24 mb-2 flex items-center justify-center">
            <div className="absolute inset-0 bg-[#4f46e5]/15 rounded-full blur-xl transform scale-110 animate-pulse"></div>
            <img
              alt="CampusLink Logo"
              className="w-20 h-20 object-contain relative z-10 drop-shadow-md"
              src="https://lh3.googleusercontent.com/aida/AEtjO1XlUgudA81nKpgNLwZ4M7FwTV-HruwUCA-f79CKUDtBrY9hd-jVF7qpDnLjBiWVcdye5M9qMk1qhyXr0zFX32De00-iYEfBbj1Jq_LFt9amW2gSalZ0IDsis2r1HYjXf9iRJusWofoEI-q9RMIp7iPhf6LVyf9GtVrg9UQerEAQH31ll4n_Z3s9eueJMN4AWxfIyK5fdUFMhWkPcvUp2Vx_iWJmxoPhZ8ZgQo2OQn3YvvUHsb6_BzGdN10"
            />
          </div>
          <h1 className="text-[28px] font-bold text-[#131b2e] tracking-tight">
            Bienvenido a{' '}
            <span className="bg-gradient-to-r from-[#3525cd] to-[#712ae2] bg-clip-text text-transparent">
              CampusLink
            </span>
          </h1>
          <p className="text-sm text-[#464555] max-w-xs mt-1">
            Tu comunidad universitaria conectada en un solo lugar
          </p>
        </div>

        {/* Campus Selector Chip/Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowCampusDropdown(!showCampusDropdown)}
            className="w-full bg-[#f2f3ff] hover:bg-[#eaedff] transition-all duration-200 rounded-xl px-4 py-3 flex items-center justify-between shadow-xs border border-[#e2e7ff]"
            type="button"
          >
            <div className="flex items-center space-x-3 text-left">
              <div className="w-8 h-8 rounded-lg bg-[#3525cd]/10 flex items-center justify-center text-[#3525cd]">
                <span className="material-symbols-outlined text-lg">school</span>
              </div>
              <div>
                <span className="block text-[10px] text-[#3525cd] uppercase tracking-wider font-bold flex items-center gap-1">
                  <span>Tu Universidad</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-[#3525cd]/10 font-medium normal-case">Configuración única</span>
                </span>
                <span className="text-sm text-[#131b2e] font-semibold">
                  {selectedCampus}
                </span>
              </div>
            </div>
            <span
              className={`material-symbols-outlined text-[#464555] transition-transform duration-200 ${
                showCampusDropdown ? 'rotate-180' : 'rotate-0'
              }`}
            >
              expand_more
            </span>
          </button>

          {/* Campus Dropdown Menu */}
          {showCampusDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl z-30 p-1.5 space-y-1 border border-[#eaedff]">
              <div className="px-3 py-1 text-[10px] font-bold text-[#777587] uppercase tracking-wider">
                Selecciona tu institución (se mostrará en tu perfil)
              </div>
              {[
                'Universidad Central (Sede Principal)',
                'Tecnológico Metropolitano',
                'Facultad de Medicina & Ciencias',
                'Universidad Nacional Autónoma',
                'Pontificia Universidad Católica',
              ].map((c) => (
                <button
                  key={c}
                  className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between hover:bg-[#e2e7ff] transition-colors text-sm ${
                    selectedCampus === c ? 'text-[#3525cd] font-bold bg-[#f2f3ff]' : 'text-[#131b2e]'
                  }`}
                  onClick={() => {
                    onSelectCampus(c);
                    setShowCampusDropdown(false);
                  }}
                  type="button"
                >
                  <span>{c}</span>
                  {selectedCampus === c && (
                    <span className="material-symbols-outlined text-sm text-[#3525cd]">
                      check
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Login Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-5 shadow-sm space-y-4 border border-[#eaedff]"
        >
          {/* Email Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                className="text-xs font-semibold text-[#131b2e]"
                htmlFor="student-email"
              >
                Correo institucional
              </label>
              {isEdu && email.includes('@') && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#6ffbbe]/30 text-[#005338] font-bold">
                  <span
                    className="material-symbols-outlined text-xs"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                  Dominio .edu verificado
                </span>
              )}
            </div>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-[#464555] text-xl">
                alternate_email
              </span>
              <input
                id="student-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 pl-11 pr-10 rounded-xl bg-[#f2f3ff] text-sm text-[#131b2e] placeholder:text-[#777587] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#3525cd]/20 transition-all border border-transparent focus:border-[#3525cd]/40"
                placeholder="tu.usuario@universidad.edu"
                type="email"
                required
              />
              {isEdu && email.includes('@') && (
                <div className="absolute right-3.5 text-[#005338]">
                  <span
                    className="material-symbols-outlined text-xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                className="text-xs font-semibold text-[#131b2e]"
                htmlFor="student-password"
              >
                Contraseña académica
              </label>
              <button
                type="button"
                onClick={() => triggerToast('Se envió un correo de recuperación a tu bandeja institucional.')}
                className="text-[10px] font-bold text-[#3525cd] hover:text-[#4f46e5] transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-[#464555] text-xl">
                lock
              </span>
              <input
                id="student-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 pl-11 pr-11 rounded-xl bg-[#f2f3ff] text-sm text-[#131b2e] placeholder:text-[#777587] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#3525cd]/20 transition-all border border-transparent focus:border-[#3525cd]/40"
                placeholder="Ingresa tu clave de acceso"
                type={showPassword ? 'text' : 'password'}
                required
              />
              <button
                aria-label="Alternar visibilidad de contraseña"
                className="absolute right-3.5 text-[#464555] hover:text-[#131b2e] transition-colors p-1"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="material-symbols-outlined text-xl">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Remember Session Check */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-[#3525cd] focus:ring-0 accent-[#3525cd] cursor-pointer"
                type="checkbox"
              />
              <span className="text-xs text-[#464555]">
                Recordar en este dispositivo
              </span>
            </label>
          </div>

          {/* Primary Action (CTA) */}
          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-gradient-to-r from-[#3525cd] to-[#712ae2] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform hover:brightness-105"
          >
            <span className="material-symbols-outlined text-xl">badge</span>
            <span>Ingresar con carnet digital</span>
          </button>
        </form>

        {/* Quick Biometric / NFC Quick Access Tile */}
        <div className="bg-[#f2f3ff] rounded-xl p-4 flex items-center justify-between shadow-xs border border-[#e2e7ff]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#eaddff] flex items-center justify-center text-[#712ae2]">
              <span className="material-symbols-outlined text-2xl">fingerprint</span>
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#131b2e] leading-tight">
                Acceso Rápido Biométrico
              </h2>
              <p className="text-[11px] text-[#464555]">
                Usa Face ID o tu Carnet NFC vinculado
              </p>
            </div>
          </div>
          <button
            onClick={handleBiometric}
            disabled={isBiometricScanning}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs active:scale-95 ${
              biometricSuccess
                ? 'bg-[#6ffbbe] text-[#002113]'
                : 'bg-white text-[#3525cd] hover:bg-[#c3c0ff]/50'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-sm">
              {biometricSuccess ? 'check_circle' : 'contactless'}
            </span>
            <span>{isBiometricScanning ? 'Leyendo...' : biometricSuccess ? 'Listo' : 'Tocar'}</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-1">
          <div className="w-full bg-[#e2e7ff] h-[1px]"></div>
          <span className="absolute bg-[#faf8ff] px-3 text-[10px] font-bold text-[#777587] uppercase tracking-wider">
            o continúa con
          </span>
        </div>

        {/* SSO Institutional Buttons */}
        <div className="grid grid-cols-1 gap-2.5">
          {/* Google Workspace Institucional */}
          <button
            onClick={onLoginSuccess}
            className="w-full h-12 bg-white hover:bg-[#eaedff] transition-all rounded-xl px-4 flex items-center justify-center gap-3 shadow-xs active:scale-[0.99] border border-[#e2e7ff]"
            type="button"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17Z"
                fill="#4285F4"
              ></path>
              <path
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24Z"
                fill="#34A853"
              ></path>
              <path
                d="M5.28 14.27A7.17 7.17 0 0 1 4.9 12c0-.79.14-1.57.38-2.27V6.58H1.25A11.96 11.96 0 0 0 0 12c0 1.92.45 3.74 1.25 5.42l4.03-3.15Z"
                fill="#FBBC05"
              ></path>
              <path
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                fill="#EA4335"
              ></path>
            </svg>
            <span className="text-xs text-[#131b2e] font-semibold">
              Google Workspace Institucional
            </span>
          </button>

          {/* Microsoft Office 365 Educación */}
          <button
            onClick={onLoginSuccess}
            className="w-full h-12 bg-white hover:bg-[#eaedff] transition-all rounded-xl px-4 flex items-center justify-center gap-3 shadow-xs active:scale-[0.99] border border-[#e2e7ff]"
            type="button"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path d="M1 1h10v10H1z" fill="#f25022"></path>
              <path d="M1 13h10v10H1z" fill="#00a4ef"></path>
              <path d="M13 1h10v10H13z" fill="#7fba00"></path>
              <path d="M13 13h10v10H13z" fill="#ffb900"></path>
            </svg>
            <span className="text-xs text-[#131b2e] font-semibold">
              Microsoft Office 365 Educación
            </span>
          </button>
        </div>

        {/* Registration & Security Badge Footer */}
        <div className="space-y-3 pt-1 text-center">
          <div className="text-xs text-[#464555]">
            ¿Aún no tienes cuenta institucional?{' '}
            <button
              onClick={() => triggerToast('Dirigiéndote al portal de admisión y registro de credencial...')}
              className="font-bold text-[#3525cd] hover:underline ml-1"
            >
              Regístrate aquí
            </button>
          </div>

          {/* Security Micro-Callout */}
          <div className="bg-[#f2f3ff]/80 rounded-xl p-3 flex items-start gap-2.5 text-left border border-[#e2e7ff]">
            <span
              className="material-symbols-outlined text-[#005338] text-lg mt-0.5 flex-shrink-0"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              shield
            </span>
            <p className="text-[11px] text-[#464555] leading-snug">
              Acceso exclusivo para estudiantes y docentes verificados con
              credencial académica activa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
