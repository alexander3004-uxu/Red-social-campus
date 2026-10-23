import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface LoginScreenProps {
  onLoginSuccess: (university?: string) => void;
  initialMode?: 'login' | 'register';
}

type ScreenStep = 'login' | 'register' | 'profile';

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, initialMode = 'login' }) => {
  const { user, profile, isAuthenticated, isGuest, isLoading, loginWithEmail, register, updateProfile } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [step, setStep] = useState<ScreenStep>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    if (profile?.profile_completed) {
      onLoginSuccess(profile.university);
      return;
    }
    setFullName(profile?.full_name || '');
    setUsername(profile?.username || user?.email.split('@')[0] || '');
    setUniversity(profile?.university || '');
    setFaculty(profile?.faculty || '');
    setCareer(profile?.career || '');
    setSemester(profile?.semester || '');
    setBio(profile?.bio || '');
    setStep('profile');
  }, [isAuthenticated, isGuest, profile?.profile_completed, user?.email]);

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

  const handleRegister = (event: React.FormEvent) => {
    event.preventDefault();
    if (!fullName.trim()) {
      setErrorMessage('Escribe tu nombre para crear la cuenta.');
      return;
    }
    if (password.length < 8 || !/[a-z]/i.test(password) || !/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password)) {
      setErrorMessage('Usa al menos 8 caracteres, con una letra y un número o símbolo.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    void runAuthAction(async () => {
      const temporaryUsername = `campus_${Date.now().toString(36)}`;
      const result = await register({
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        username: temporaryUsername,
        university: '',
        faculty: '',
        career: '',
        semester: '',
      });
      if (!result?.success) throw new Error(result?.message || 'No se pudo crear la cuenta.');
    });
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

      <section className="relative w-full max-w-lg rounded-[2rem] border border-white/80 bg-white/95 p-6 shadow-[0_24px_80px_-32px_rgba(53,37,205,0.35)] backdrop-blur sm:p-9">
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
                ? 'Regístrate con tu correo, tu nombre y una contraseña segura.'
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
              <input id="login-email" className={inputClass} type="email" autoComplete="email" placeholder="tu@correo.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
            <div>
              <label className={labelClass} htmlFor="login-password">Contraseña</label>
              <input id="login-password" className={inputClass} type="password" autoComplete="current-password" placeholder="Tu contraseña" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </div>
            <button disabled={isLoading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3525cd] to-[#712ae2] text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition hover:brightness-105 disabled:opacity-60" type="submit">
              {isLoading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              Entrar a mi cuenta
            </button>
          </form>
        )}

        {step === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className={labelClass} htmlFor="register-name">Tu nombre</label>
              <input id="register-name" className={inputClass} autoComplete="name" placeholder="Nombre y apellido" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
            </div>
            <div>
              <label className={labelClass} htmlFor="register-email">Correo electrónico</label>
              <input id="register-email" className={inputClass} type="email" autoComplete="email" placeholder="tu@correo.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
            <div>
              <label className={labelClass} htmlFor="register-password">Crea una contraseña</label>
              <input id="register-password" className={inputClass} type="password" autoComplete="new-password" minLength={8} placeholder="8+ caracteres, incluye letra y número" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </div>
            <div>
              <label className={labelClass} htmlFor="register-confirm-password">Confirma tu contraseña</label>
              <input id="register-confirm-password" className={inputClass} type="password" autoComplete="new-password" minLength={8} placeholder="Escríbela otra vez" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
            </div>
            <button disabled={isLoading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3525cd] to-[#712ae2] text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition hover:brightness-105 disabled:opacity-60" type="submit">
              {isLoading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              Crear mi cuenta
            </button>
          </form>
        )}

        {step === 'profile' && !isGuest && (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="profile-name">Nombre completo</label>
                <input id="profile-name" className={inputClass} autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
              </div>
              <div>
                <label className={labelClass} htmlFor="profile-username">Nombre de usuario</label>
                <input id="profile-username" className={inputClass} autoComplete="username" placeholder="ej. ana.lopez" value={username} onChange={(event) => setUsername(event.target.value)} required />
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor="profile-university">Universidad</label>
              <input id="profile-university" className={inputClass} placeholder="¿Dónde estudias?" value={university} onChange={(event) => setUniversity(event.target.value)} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="profile-faculty">Facultad</label>
                <input id="profile-faculty" className={inputClass} placeholder="Facultad (opcional)" value={faculty} onChange={(event) => setFaculty(event.target.value)} />
              </div>
              <div>
                <label className={labelClass} htmlFor="profile-career">Carrera</label>
                <input id="profile-career" className={inputClass} placeholder="Tu carrera" value={career} onChange={(event) => setCareer(event.target.value)} required />
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor="profile-semester">Semestre</label>
              <input id="profile-semester" className={inputClass} placeholder="Ej. 3er semestre (opcional)" value={semester} onChange={(event) => setSemester(event.target.value)} />
            </div>
            <div>
              <label className={labelClass} htmlFor="profile-bio">Sobre ti</label>
              <textarea id="profile-bio" className={`${inputClass} h-24 resize-y py-3`} placeholder="Una breve descripción (opcional)" value={bio} onChange={(event) => setBio(event.target.value)} />
            </div>
            <button disabled={isLoading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3525cd] to-[#712ae2] text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition hover:brightness-105 disabled:opacity-60" type="submit">
              {isLoading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              Guardar y continuar
            </button>
          </form>
        )}

        {errorMessage && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>}
        <p className="mt-6 text-center text-xs leading-5 text-[#858294]">Tu cuenta se protege con contraseña. No compartas tus credenciales con nadie.</p>
      </section>
    </main>
  );
};
