/**
 * src/components/PerfilScreen.tsx
 * Pantalla completa de Perfil Universitario:
 * - Vista de Invitado: Pantalla informativa con beneficios y botón de conversión/upgrade
 * - Vista de Estudiante: Información académica real, carnets, reputación y apuntes
 * - Formulario y modal de edición de perfil: Datos personales, bio y enlaces
 * - Subida de avatar con validación de tipo MIME (JPEG/PNG/WebP) y límite de tamaño
 * - Cambio seguro de contraseña con validación de contraseña actual y nueva
 */

import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { CURRENT_USER } from '../data/mockData';

interface PerfilScreenProps {
  onOpenCarnet: () => void;
  onOpenPdf: (title: string, sampleContent?: string) => void;
  onLogout: () => void;
  onEditBio?: (newBio: string) => void;
  university?: string;
  onNavigateToLogin?: () => void;
}

export const PerfilScreen: React.FC<PerfilScreenProps> = ({
  onOpenCarnet,
  onOpenPdf,
  onLogout,
  university,
  onNavigateToLogin,
}) => {
  const {
    user,
    profile,
    isGuest,
    logout,
    updateProfile,
    uploadAvatar,
    changePassword,
    openUpgradeModal,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'apuntes' | 'market' | 'grupos' | 'resenas'>('apuntes');

  // Estados del modal de edición de perfil
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editActiveSection, setEditActiveSection] = useState<'info' | 'security'>('info');

  // Formulario de Información Personal
  const [editFullName, setEditFullName] = useState(profile?.full_name || CURRENT_USER.name);
  const [editUsername, setEditUsername] = useState(profile?.username || 'sofia.valenzuela');
  const [editBio, setEditBio] = useState(profile?.bio || CURRENT_USER.bio);
  const [editUniversity, setEditUniversity] = useState(profile?.university || university || CURRENT_USER.university);
  const [editFaculty, setEditFaculty] = useState(profile?.faculty || CURRENT_USER.faculty);
  const [editCareer, setEditCareer] = useState(profile?.career || CURRENT_USER.career);
  const [editSemester, setEditSemester] = useState(profile?.semester || CURRENT_USER.semester);

  // Formulario de Cambio de Contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  // Estados de carga y feedback visual
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 4500);
  };

  // Datos consolidados (perfil dinámico o fallback seguro)
  const currentAvatar = profile?.avatar_url || (isGuest ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250' : CURRENT_USER.avatar);
  const currentName = profile?.full_name || (isGuest ? 'Invitado del Campus' : CURRENT_USER.name);
  const currentUsername = profile?.username || (isGuest ? 'invitado' : 'sofia.valenzuela');
  const currentBio = profile?.bio ?? (isGuest ? 'Explorando en modo de solo lectura.' : CURRENT_USER.bio);
  const currentCareer = profile?.career || (isGuest ? 'Explorador' : CURRENT_USER.career);
  const currentSemester = profile?.semester || (isGuest ? 'Visitante' : CURRENT_USER.semester);
  const currentUniversity = profile?.university || university || CURRENT_USER.university;
  const currentFaculty = profile?.faculty || CURRENT_USER.faculty;
  const currentStudentId = profile?.student_id || CURRENT_USER.studentId;

  /**
   * Manejar subida de foto de perfil
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación rápida de tamaño en frontend (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showFeedback('error', 'La imagen excede el límite de 5 MB.');
      return;
    }

    // Validación rápida de tipo MIME
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showFeedback('error', 'Formato no permitido. Usa imágenes JPEG, PNG o WebP.');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const newAvatarUrl = await uploadAvatar(file);
      showToast('¡Foto de perfil actualizada exitosamente!');
    } catch (err: any) {
      showFeedback('error', err.message || 'Error al subir la imagen de perfil.');
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  /**
   * Guardar cambios de perfil
   */
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateProfile({
        full_name: editFullName,
        username: editUsername,
        bio: editBio,
        university: editUniversity,
        faculty: editFaculty,
        career: editCareer,
        semester: editSemester,
      });
      showToast('Perfil universitario actualizado correctamente.');
      setIsEditModalOpen(false);
    } catch (err: any) {
      showFeedback('error', err.message || 'Error al actualizar el perfil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Guardar cambio de contraseña
   */
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showFeedback('error', 'La nueva contraseña y su confirmación no coinciden.');
      return;
    }
    if (newPassword.length < 8) {
      showFeedback('error', 'La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      showToast('¡Contraseña actualizada de forma segura!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsEditModalOpen(false);
    } catch (err: any) {
      showFeedback('error', err.message || 'No se pudo cambiar la contraseña.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoutClick = async () => {
    await logout();
    onLogout();
  };

  // Mock list de apuntes para tab
  const apuntesList = [
    {
      id: 'ap-1',
      title: 'Árboles AVL & Grafos - Resumen Examen Final',
      course: 'Estructuras de Datos • Prof. Mendoza',
      tag: 'Gratis',
      tagColor: 'bg-[#eaddff] text-[#5a00c6]',
      downloads: 842,
      rating: '4.9 (54)',
      icon: 'description',
      content: 'ÁRBOLES BALANCEADOS AVL Y ALGORITMOS DE GRAFOS...',
    },
    {
      id: 'ap-2',
      title: 'Diseño de Patrones de Software y Principios SOLID',
      course: 'Arquitectura de Software • Ciclo 2024-1',
      tag: 'Destacado',
      tagColor: 'bg-[#6ffbbe]/25 text-[#005338]',
      downloads: 519,
      rating: '5.0 (32)',
      icon: 'architecture',
      content: 'PRINCIPIOS SOLID Y PATRONES CREACIONALES...',
    },
    {
      id: 'ap-3',
      title: 'Guía de Optimización de Consultas SQL y Normalización',
      course: 'Bases de Datos II • Lab Práctico',
      tag: '14 pág.',
      tagColor: 'bg-[#eaedff] text-[#464555]',
      downloads: 320,
      rating: '4.8 (18)',
      icon: 'database',
      content: 'GUÍA PRÁCTICA DE INDEXACIÓN Y RENDIMIENTO SQL...',
    },
  ];

  return (
    <div className="flex flex-col w-full mx-auto pb-20 md:pb-8 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#131b2e] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <span className="material-symbols-outlined text-[18px] text-[#67f4b7]">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Input oculto para subida de fotos */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      {/* ==================================================================== */}
      {/* CASO 1: VISTA DE PERFIL EN MODO INVITADO                             */}
      {/* ==================================================================== */}
      {isGuest ? (
        <div className="px-4 pt-4 flex flex-col space-y-4">
          {/* Banner de Bienvenida y Estado Invitado */}
          <div className="bg-gradient-to-r from-[#3525cd] via-[#5136d8] to-[#712ae2] text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold w-fit">
                <span className="material-symbols-outlined text-sm">visibility</span>
                <span>Estás explorando en Modo Invitado</span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight">
                Bienvenido(a) a la Red Social del Campus
              </h1>

              <p className="text-xs text-white/90 leading-relaxed max-w-md">
                Actualmente tienes acceso de <strong>solo lectura</strong> al feed de la comunidad, apuntes compartidos y perfiles públicos de estudiantes y docentes.
              </p>

              {/* Botón Principal de Conversión */}
              <div className="flex flex-wrap gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => openUpgradeModal('personalizar tu perfil y obtener carnet')}
                  className="px-4 py-2.5 rounded-xl bg-white text-[#3525cd] hover:bg-[#faf8ff] text-xs font-bold flex items-center gap-2 shadow-sm active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-base">how_to_reg</span>
                  <span>Crear cuenta para personalizar tu perfil</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <span className="material-symbols-outlined text-base">login</span>
                  <span>Iniciar con cuenta existente</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tarjeta de Comparativa de Privilegios */}
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#eaedff] space-y-3">
            <h2 className="text-sm font-bold text-[#131b2e] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#3525cd]">security</span>
              <span>Privilegios de Acceso al Campus</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-[#f2f3ff] border border-[#e2e7ff] space-y-2">
                <span className="text-xs font-bold text-[#3525cd] uppercase tracking-wide">
                  Tu sesión actual (Invitado)
                </span>
                <ul className="text-xs text-[#464555] space-y-1.5">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-[#006e4b]">check</span>
                    <span>Explorar el feed público del campus</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-[#006e4b]">check</span>
                    <span>Leer apuntes y materiales compartidos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-[#006e4b]">check</span>
                    <span>Ver perfiles públicos de estudiantes</span>
                  </li>
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#eaddff]/30 border border-[#d6d0ff] space-y-2">
                <span className="text-xs font-bold text-[#712ae2] uppercase tracking-wide">
                  Con Cuenta Estudiantil Verificada
                </span>
                <ul className="text-xs text-[#131b2e] space-y-1.5">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-[#712ae2]">star</span>
                    <span>Carnet Digital NFC y Código QR Oficial</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-[#712ae2]">star</span>
                    <span>Publicar dudas, archivos y encuestas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-[#712ae2]">star</span>
                    <span>Chatear en tiempo real y vender en Market</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ==================================================================== */
        /* CASO 2: VISTA DE PERFIL DE ESTUDIANTE / DOCENTE REGISTRADO            */
        /* ==================================================================== */
        <>
          {/* Banner y Portada */}
          <section className="relative w-full">
            <div className="relative w-full h-44 overflow-hidden">
              <div
                className="w-full h-full bg-cover bg-center bg-[#3525cd]/10"
                style={{
                  backgroundImage: `url('${CURRENT_USER.banner}')`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#faf8ff] via-[#faf8ff]/30 to-transparent" />

              {/* Acciones flotantes sobre el banner */}
              <div className="absolute top-3 right-4 flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    showToast('Enlace de perfil universitario copiado.');
                  }}
                  aria-label="Compartir perfil"
                  className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-[#131b2e] shadow-xs active:scale-95 transition-transform"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">share</span>
                </button>
                <button
                  onClick={handleLogoutClick}
                  aria-label="Cerrar sesión"
                  title="Cerrar sesión"
                  className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-[#ba1a1a] shadow-xs active:scale-95 transition-transform"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                </button>
              </div>
            </div>

            {/* Avatar Superpuesto con Botón de Carga */}
            <div className="px-4 -mt-14 relative z-10 flex items-end justify-between">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden shadow-md bg-white p-1 relative">
                  <img
                    alt={currentName}
                    className="w-full h-full rounded-full object-cover"
                    src={currentAvatar}
                  />
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                      Subiendo...
                    </div>
                  )}
                </div>

                {/* Botón de Cámara para subir foto */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Actualizar foto de perfil"
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#3525cd] hover:bg-[#4f46e5] text-white flex items-center justify-center shadow-md active:scale-90 transition-transform"
                >
                  <span className="material-symbols-outlined text-sm">photo_camera</span>
                </button>
              </div>

              {/* Botones de Acción Rápida (Carnet QR y Editar Perfil) */}
              <div className="flex items-center gap-2 pb-1">
                <button
                  onClick={onOpenCarnet}
                  className="h-9 px-3 rounded-xl bg-[#e2e7ff] text-[#131b2e] text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-transform hover:bg-[#dae2fd]"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">badge</span>
                  <span>Carnet QR</span>
                </button>

                <button
                  onClick={() => {
                    setEditFullName(currentName);
                    setEditUsername(currentUsername);
                    setEditBio(currentBio);
                    setIsEditModalOpen(true);
                  }}
                  className="h-9 px-3.5 rounded-xl bg-[#3525cd] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-transform hover:bg-[#4f46e5]"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                  <span>Editar Perfil</span>
                </button>
              </div>
            </div>

            {/* Datos Académicos & Bio */}
            <div className="px-4 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-[#131b2e] leading-tight">
                  {currentName}
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#6ffbbe]/25 text-[#005338] text-[10px] font-bold">
                  <span className="material-symbols-outlined text-[12px]">verified_user</span>
                  Estudiante Verificada
                </span>
              </div>

              <div className="text-xs text-[#3525cd] font-semibold font-mono mt-0.5">
                @{currentUsername}
              </div>

              <div className="flex items-center gap-1.5 mt-1 text-[#464555] text-xs font-semibold">
                <span className="material-symbols-outlined text-[16px] text-[#3525cd]">school</span>
                <span className="font-bold text-[#131b2e]">{currentUniversity}</span>
                <span>•</span>
                <span>{currentFaculty}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#e2dfff] text-[#3323cc] text-[10px] font-bold">
                  <span className="material-symbols-outlined text-[13px]">terminal</span>
                  {currentCareer}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#e2e7ff] text-[#464555] text-[10px] font-bold">
                  <span className="material-symbols-outlined text-[13px]">calendar_today</span>
                  {currentSemester}
                </span>
                {currentStudentId && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f2f3ff] text-[#131b2e] text-[10px] font-mono font-bold border border-[#e2e7ff]">
                    ID: {currentStudentId}
                  </span>
                )}
              </div>

              {/* Bio legible */}
              <p className="mt-2.5 text-xs text-[#464555] leading-relaxed bg-[#f2f3ff]/60 p-3 rounded-xl border border-[#eaedff]">
                {currentBio}
              </p>
            </div>
          </section>

          {/* Estadísticas de Reputación */}
          <section className="px-4 mt-4">
            <div className="grid grid-cols-4 gap-1 p-3 bg-[#f2f3ff] rounded-2xl shadow-xs border border-[#eaedff]">
              <div className="flex flex-col items-center text-center p-1">
                <span className="text-lg font-extrabold text-[#3525cd]">24</span>
                <span className="text-[10px] text-[#464555] mt-0.5">Apuntes</span>
              </div>

              <div className="flex flex-col items-center text-center p-1">
                <div className="flex items-center gap-0.5 text-[#712ae2]">
                  <span className="text-lg font-extrabold">{profile?.reputation || '4.9'}</span>
                  <span
                    className="material-symbols-outlined text-[14px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                </div>
                <span className="text-[10px] text-[#464555] mt-0.5">Reputación</span>
              </div>

              <div className="flex flex-col items-center text-center p-1">
                <span className="text-lg font-extrabold text-[#131b2e]">18</span>
                <span className="text-[10px] text-[#464555] mt-0.5">Ventas</span>
              </div>

              <div className="flex flex-col items-center text-center p-1">
                <span className="text-lg font-extrabold text-[#131b2e]">412</span>
                <span className="text-[10px] text-[#464555] mt-0.5">Compañeros</span>
              </div>
            </div>
          </section>

          {/* Tabs de Apuntes y Actividad */}
          <section className="mt-4 px-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setActiveTab('apuntes')}
                type="button"
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'apuntes'
                    ? 'bg-[#3525cd] text-white shadow-xs'
                    : 'bg-[#eaedff] text-[#464555] hover:bg-[#dae2fd]'
                }`}
              >
                Apuntes & Recursos (3)
              </button>
              <button
                onClick={() => setActiveTab('market')}
                type="button"
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'market'
                    ? 'bg-[#3525cd] text-white shadow-xs'
                    : 'bg-[#eaedff] text-[#464555] hover:bg-[#dae2fd]'
                }`}
              >
                Artículos en Market (2)
              </button>
            </div>

            {/* Contenido del Tab */}
            <div className="mt-3 space-y-2">
              {activeTab === 'apuntes' &&
                apuntesList.map((ap) => (
                  <div
                    key={ap.id}
                    className="p-3 bg-white rounded-2xl border border-[#eaedff] shadow-xs flex items-center justify-between gap-3 hover:border-[#3525cd]/30 transition-all cursor-pointer"
                    onClick={() => onOpenPdf(ap.title, ap.content)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#e2dfff] flex items-center justify-center text-[#3525cd] shrink-0">
                        <span className="material-symbols-outlined text-xl">{ap.icon}</span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <h4 className="text-xs font-bold text-[#131b2e] truncate">{ap.title}</h4>
                        <span className="text-[11px] text-[#464555] truncate">{ap.course}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="px-2.5 py-1 rounded-lg bg-[#f2f3ff] text-[#3525cd] text-xs font-bold hover:bg-[#e2e7ff] shrink-0"
                    >
                      Ver PDF
                    </button>
                  </div>
                ))}
            </div>
          </section>
        </>
      )}

      {/* ==================================================================== */}
      {/* MODAL DE EDICIÓN DE PERFIL Y SEGURIDAD                               */}
      {/* ==================================================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131b2e]/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-[#e2e7ff] max-h-[90vh] overflow-y-auto space-y-4">
            {/* Header del Modal */}
            <div className="flex items-center justify-between pb-2 border-b border-[#eaedff]">
              <div>
                <h3 className="text-base font-bold text-[#131b2e]">Editar Cuenta Universitaria</h3>
                <p className="text-[11px] text-[#464555]">Actualiza tus datos del campus y seguridad</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f2f3ff] hover:bg-[#eaedff] flex items-center justify-center text-[#464555]"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {/* Pestañas internas: Datos del Campus vs. Seguridad */}
            <div className="flex p-1 bg-[#f2f3ff] rounded-xl">
              <button
                type="button"
                onClick={() => setEditActiveSection('info')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  editActiveSection === 'info' ? 'bg-white text-[#3525cd] shadow-xs' : 'text-[#464555]'
                }`}
              >
                Información del Campus
              </button>
              <button
                type="button"
                onClick={() => setEditActiveSection('security')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  editActiveSection === 'security' ? 'bg-white text-[#3525cd] shadow-xs' : 'text-[#464555]'
                }`}
              >
                Seguridad & Contraseña
              </button>
            </div>

            {feedbackMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-medium ${
                  feedbackMessage.type === 'success'
                    ? 'bg-[#6ffbbe]/25 text-[#005338] border border-[#006e4b]/20'
                    : 'bg-[#ffdad6] text-[#410002] border border-[#ffb4ab]'
                }`}
              >
                {feedbackMessage.text}
              </div>
            )}

            {/* SECCIÓN 1: DATOS PERSONALES Y ACADÉMICOS */}
            {editActiveSection === 'info' && (
              <form onSubmit={handleSaveProfile} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#131b2e]">Nombre Completo</label>
                  <input
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#f2f3ff] text-xs text-[#131b2e] focus:bg-white border border-transparent focus:border-[#3525cd]/40 outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#131b2e]">Nombre de usuario (@username)</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs font-bold text-[#3525cd]">@</span>
                    <input
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      className="w-full h-10 pl-7 pr-3 rounded-xl bg-[#f2f3ff] text-xs text-[#131b2e] focus:bg-white border border-transparent focus:border-[#3525cd]/40 outline-none font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#131b2e]">Biografía académica</label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    rows={3}
                    className="w-full p-3 rounded-xl bg-[#f2f3ff] text-xs text-[#131b2e] focus:bg-white border border-transparent focus:border-[#3525cd]/40 outline-none"
                    placeholder="Cuéntale a tus compañeros tus intereses académicos..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#131b2e]">Carrera</label>
                    <input
                      value={editCareer}
                      onChange={(e) => setEditCareer(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl bg-[#f2f3ff] text-xs text-[#131b2e] focus:bg-white border border-transparent focus:border-[#3525cd]/40 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#131b2e]">Semestre</label>
                    <input
                      value={editSemester}
                      onChange={(e) => setEditSemester(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl bg-[#f2f3ff] text-xs text-[#131b2e] focus:bg-white border border-transparent focus:border-[#3525cd]/40 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-10 rounded-xl bg-[#3525cd] text-white text-xs font-bold hover:bg-[#4f46e5] active:scale-[0.99] transition-all disabled:opacity-50 mt-2"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Cambios en Perfil'}
                </button>
              </form>
            )}

            {/* SECCIÓN 2: CAMBIO DE CONTRASEÑA */}
            {editActiveSection === 'security' && (
              <form onSubmit={handleChangePassword} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#131b2e]">Contraseña actual</label>
                  <input
                    type={showPasswordFields ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#f2f3ff] text-xs text-[#131b2e] focus:bg-white border border-transparent focus:border-[#3525cd]/40 outline-none"
                    placeholder="Ingresa tu clave actual"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#131b2e]">Nueva contraseña</label>
                  <input
                    type={showPasswordFields ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#f2f3ff] text-xs text-[#131b2e] focus:bg-white border border-transparent focus:border-[#3525cd]/40 outline-none"
                    placeholder="Mínimo 8 caracteres"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#131b2e]">Confirmar nueva contraseña</label>
                  <input
                    type={showPasswordFields ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#f2f3ff] text-xs text-[#131b2e] focus:bg-white border border-transparent focus:border-[#3525cd]/40 outline-none"
                    placeholder="Repite la nueva clave"
                    required
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="toggle-show"
                    checked={showPasswordFields}
                    onChange={(e) => setShowPasswordFields(e.target.checked)}
                    className="w-4 h-4 rounded text-[#3525cd]"
                  />
                  <label htmlFor="toggle-show" className="text-xs text-[#464555] cursor-pointer">
                    Mostrar contraseñas
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-10 rounded-xl bg-[#ba1a1a] hover:bg-[#93000a] text-white text-xs font-bold active:scale-[0.99] transition-all disabled:opacity-50 mt-2"
                >
                  {isSubmitting ? 'Actualizando...' : 'Actualizar Contraseña de Acceso'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
