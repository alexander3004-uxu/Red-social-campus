import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface LoginScreenProps {
  onLoginSuccess: (university?: string) => void;
  initialMode?: 'login' | 'register';
}

type ScreenStep = 'login' | 'register' | 'profile';

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, initialMode = 'login' }) => {
  const { user, profile, isAuthenticated, isGuest, isLoading, loginWithEmail, updateProfile, loginWithGoogle } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [step, setStep] = useState<ScreenStep>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [university, setUniversity] = useState(profile?.university || '');
  const [faculty, setFaculty] = useState(profile?.faculty || '');
  const [career, setCareer] = useState(profile?.career || '');
  const [semester, setSemester] = useState(profile?.semester || '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (isGuest) return;
    if (profile?.profile_completed && profile?.university && profile?.career) {
      onLoginSuccess(profile.university);
      return;
    }
    const currentFullName = profile?.full_name || fullName || '';
    const suggestedUsername = (profile?.username && !profile.username.startsWith('campus_'))
      ? profile.username
      : (email ? email.split('@')[0] : (user?.email?.split('@')[0] || ''));

    setFullName(currentFullName);
    if (suggestedUsername) setUsername(suggestedUsername);
    if (profile?.university) setUniversity(profile.university);
    if (profile?.faculty) setFaculty(profile.faculty);
    if (profile?.career) setCareer(profile.career);
    if (profile?.semester) setSemester(profile.semester);
    if (profile?.bio) setBio(profile.bio);
    setStep('profile');
  }, [isAuthenticated, isGuest, profile?.profile_completed, profile?.university, profile?.career, user?.email]);

  const runAuthAction = async (action: () => Promise<unknown>) => {
    setErrorMessage(null);
    try {
      await action();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Ocurrió un error. Inténtalo de nuevo.');
    }
  };

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    void runAuthAction(() => loginWithEmail(email.trim(), password));
  };

  const handleSaveProfile = (event: React.FormEvent) => {
    event.preventDefault();
    if (!fullName.trim() || !username.trim() || !university.trim() || !career.trim()) {
      setErrorMessage('Completa tu nombre, usuario, universidad y carrera para continuar.');
      return;
    }

    void runAuthAction(async () => {
      await updateProfile({
        full_name: fullName.trim(),
        username: username.trim().replace(/^@/, ''),
        bio: bio.trim(),
        university: university.trim(),
        faculty: faculty.trim(),
        career: career.trim(),
        semester: semester.trim(),
        profile_completed: true,
      });
      onLoginSuccess(university.trim());
    });
  };

  const switchStep = (nextStep: ScreenStep) => {
    setErrorMessage(null);
    setStep(nextStep);
  };

  const inputClass = 'h-12 w-full rounded-xl border border-[#e7e4f0] bg-white px-4 text-sm text-[#211f32] outline-none transition placeholder:text-[#a09caf] focus:border-[#7058d6] focus:ring-4 focus:ring-[#7058d6]/10';
  const labelClass = 'mb-1.5 block text-xs font-semibold text-[#48465a]';

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f6ff] px-4 py-10 text-[#17152b]">
      <div className="pointer-events-none absolute -left-24 -top-28 h-80 w-80 rounded-full bg-violet-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-indigo-200/50 blur-3xl" />
      <button
        onClick={toggleTheme}
        type="button"
        aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/80 text-[#5144bb] shadow-sm transition hover:bg-white"
      >
        <span className="material-symbols-outlined text-[20px]">{isDark ? 'light_mode' : 'dark_mode'}</span>
      </button>

      <section className="login-shell relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/80 shadow-[0_24px_80px_-32px_rgba(53,37,205,0.35)] lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="hidden min-h-[680px] flex-col justify-between bg-gradient-to-br from-[#251a79] via-[#4935c8] to-[#8d59e9] p-10 text-white lg:flex">
          <div>
            <div className="mb-16 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
                <span className="material-symbols-outlined text-[24px]">school</span>
              </span>
              <span className="text-lg font-extrabold tracking-tight">CampusLink</span>
            </div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-violet-200">Una comunidad hecha para ti</p>
            <h2 className="max-w-md text-4xl font-extrabold leading-[1.12] tracking-tight">Tu vida universitaria, más conectada.</h2>
            <p className="mt-5 max-w-sm text-sm leading-7 text-violet-100/90">
              Comparte ideas, encuentra compañeros de carrera y crea vínculos en tu campus.
            </p>
          </div>
          <div className="space-y-3 text-sm font-semibold text-white/95">
            <p className="flex items-center gap-3"><span className="material-symbols-outlined text-[20px]">forum</span> Conversaciones que sí importan</p>
            <p className="flex items-center gap-3"><span className="material-symbols-outlined text-[20px]">groups</span> Personas de tu comunidad</p>
            <p className="flex items-center gap-3"><span className="material-symbols-outlined text-[20px]">auto_awesome</span> Un espacio para crecer juntos</p>
          </div>
          <p className="text-xs text-violet-200">CampusLink · Tu campus, tu comunidad</p>
        </aside>
        <div className="login-panel p-6 sm:p-10 lg:p-12">
        <header className="mb-7 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-gradient-to-br from-[#3525cd] to-[#8054e9] text-white shadow-lg shadow-indigo-500/25">
            <span className="material-symbols-outlined text-[28px]">school</span>
          </div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#6458c9]">Tu comunidad universitaria</p>
          <h1 className="text-2xl font-bold tracking-tight">
            {step === 'profile' ? 'Completa tu perfil' : step === 'register' ? 'Crea tu cuenta' : 'Bienvenido a CampusLink'}
          </h1>
          <p className="mt-2 max-w-sm text-sm leading-6 text-[#747184]">
            {step === 'profile'
              ? 'Cuéntale a la comunidad quién eres. Podrás cambiar estos datos después.'
              : step === 'register'
                ? 'Crea tu cuenta institucional accediendo mediante Google.'
                : 'Inicia sesión con tu correo y contraseña para entrar a tu cuenta.'}
          </p>
        </header>

        {(step !== 'profile' || isGuest) && (
          <div className="mb-6 grid grid-cols-2 rounded-xl bg-[#f2f0fa] p-1">
            <button onClick={() => switchStep('login')} type="button" className={`rounded-lg py-2.5 text-sm font-semibold transition ${step === 'login' ? 'bg-white text-[#392ab8] shadow-sm' : 'text-[#777487]'}`}>
              Iniciar sesión
            </button>
            <button onClick={() => switchStep('register')} type="button" className={`rounded-lg py-2.5 text-sm font-semibold transition ${step === 'register' ? 'bg-white text-[#392ab8] shadow-sm' : 'text-[#777487]'}`}>
              Crear cuenta
            </button>
          </div>
        )}

        {step === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className={labelClass} htmlFor="login-email">Correo electrónico</label>
              <input id="login-email" className={`${inputClass} login-input`} type="email" autoComplete="email" placeholder="tu@correo.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
            <div>
              <label className={labelClass} htmlFor="login-password">Contraseña</label>
              <input id="login-password" className={`${inputClass} login-input`} type="password" autoComplete="current-password" placeholder="Tu contraseña" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </div>
            <button disabled={isLoading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3525cd] to-[#712ae2] text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition hover:brightness-105 disabled:opacity-60" type="submit">
              {isLoading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              Entrar a mi cuenta
            </button>

            <div className="relative flex items-center justify-center my-3">
              <div className="w-full bg-[#e2e7ff] h-[1px]" />
              <span className="absolute bg-[#faf8ff] px-3 text-[10px] font-bold text-[#777587] uppercase tracking-wider">
                o continúa con
              </span>
            </div>

            <button
              onClick={() => runAuthAction(() => loginWithGoogle())}
              disabled={isLoading}
              type="button"
              className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#e2e7ff] bg-white px-4 text-sm font-bold text-[#17152b] shadow-sm transition hover:bg-[#f7f6ff] hover:border-[#3525cd]/40 active:scale-[0.99] disabled:opacity-60"
            >
              <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
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
              <span>{isLoading ? 'Conectando...' : 'Iniciar sesión con Google'}</span>
            </button>
          </form>
        )}

        {/* APARTADO DE CREA TU CUENTA: SOLO INICIAR SESIÓN MEDIANTE GOOGLE */}
        {step === 'register' && (
          <div className="space-y-4 py-2">
            <div className="rounded-2xl border border-[#e2e7ff] bg-white p-5 text-center shadow-xs">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f2f0fa] text-[#3525cd]">
                <span className="material-symbols-outlined text-[26px]">school</span>
              </div>
              <h3 className="text-base font-bold text-[#17152b]">
                Registro con Cuenta Universitaria
              </h3>
              <p className="mt-1.5 text-xs leading-5 text-[#747184]">
                Para crear tu cuenta en CampusLink, inicia sesión directamente mediante tu cuenta institucional de Google.
              </p>
            </div>

            <button
              onClick={() => runAuthAction(() => loginWithGoogle())}
              disabled={isLoading}
              type="button"
              className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#e2e7ff] bg-white px-4 text-sm font-bold text-[#17152b] shadow-sm transition hover:bg-[#f7f6ff] hover:border-[#3525cd]/40 active:scale-[0.99] disabled:opacity-60"
            >
              <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
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
              <span>{isLoading ? 'Conectando...' : 'Iniciar sesión con Google'}</span>
            </button>
          </div>
        )}

        {step === 'profile' && !isGuest && (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="profile-name">Nombre completo</label>
                <input id="profile-name" className={`${inputClass} login-input`} autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
              </div>
              <div>
                <label className={labelClass} htmlFor="profile-username">Nombre de usuario</label>
                <input id="profile-username" className={`${inputClass} login-input`} autoComplete="username" placeholder="ej. ana.lopez" value={username} onChange={(event) => setUsername(event.target.value)} required />
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor="profile-university">Universidad</label>
              <input id="profile-university" className={`${inputClass} login-input`} placeholder="¿Dónde estudias?" value={university} onChange={(event) => setUniversity(event.target.value)} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="profile-faculty">Facultad</label>
                <input id="profile-faculty" className={`${inputClass} login-input`} placeholder="Facultad (opcional)" value={faculty} onChange={(event) => setFaculty(event.target.value)} />
              </div>
              <div>
                <label className={labelClass} htmlFor="profile-career">Carrera</label>
                <input id="profile-career" className={`${inputClass} login-input`} placeholder="Tu carrera" value={career} onChange={(event) => setCareer(event.target.value)} required />
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor="profile-semester">Semestre</label>
              <input id="profile-semester" className={`${inputClass} login-input`} placeholder="Ej. 3er semestre (opcional)" value={semester} onChange={(event) => setSemester(event.target.value)} />
            </div>
            <div>
              <label className={labelClass} htmlFor="profile-bio">Sobre ti</label>
              <textarea id="profile-bio" className={`${inputClass} login-input h-24 resize-y py-3`} placeholder="Una breve descripción (opcional)" value={bio} onChange={(event) => setBio(event.target.value)} />
            </div>
            <button disabled={isLoading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3525cd] to-[#712ae2] text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition hover:brightness-105 disabled:opacity-60" type="submit">
              {isLoading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              Guardar y continuar
            </button>
          </form>
        )}

        {errorMessage && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>}
        <p className="mt-6 text-center text-xs leading-5 text-[#858294]">Tu cuenta se protege con seguridad institucional. Acceso rápido y verificado.</p>
        </div>
      </section>
    </main>
  );
};
