import React, { useState } from 'react';
import { CURRENT_USER } from '../data/mockData';

interface PerfilScreenProps {
  onOpenCarnet: () => void;
  onOpenPdf: (title: string, sampleContent?: string) => void;
  onLogout: () => void;
  onEditBio: (newBio: string) => void;
  university?: string;
}

export const PerfilScreen: React.FC<PerfilScreenProps> = ({
  onOpenCarnet,
  onOpenPdf,
  onLogout,
  onEditBio,
  university,
}) => {
  const [activeTab, setActiveTab] = useState<'apuntes' | 'market' | 'grupos' | 'resenas'>('apuntes');
  const [isEditing, setIsEditing] = useState(false);
  const [bioText, setBioText] = useState(CURRENT_USER.bio);
  const userUniversity = university || CURRENT_USER.university;

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
      iconBg: 'bg-[#e2dfff] text-[#3525cd]',
      content: `ÁRBOLES BALANCEADOS AVL Y ALGORITMOS DE GRAFOS
1. Factor de Equilibrio: FE = Altura(Subárbol Derecho) - Altura(Subárbol Izquierdo)
2. Rotaciones Simples: Izquierda-Izquierda (LL), Derecha-Derecha (RR)
3. Rotaciones Dobles: Izquierda-Derecha (LR), Derecha-Izquierda (RL)
4. Grafos: Algoritmo de Dijkstra para caminos mínimos con colas de prioridad
5. Algoritmos de Prim y Kruskal para Árbol de Recubrimiento Mínimo (MST).`,
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
      iconBg: 'bg-[#6ffbbe]/30 text-[#005338]',
      content: `PRINCIPIOS SOLID Y PATRONES CREACIONALES / ESTRUCTURALES
S: Single Responsibility (Una sola razón para cambiar)
O: Open/Closed (Abierto a extensión, cerrado a modificación)
L: Liskov Substitution (Subclases intercambiables por su superclase)
I: Interface Segregation (No obligar a depender de métodos no usados)
D: Dependency Inversion (Depender de abstracciones, no concreciones)
Patrones: Singleton, Factory Method, Adapter, Observer y Decorator.`,
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
      iconBg: 'bg-[#e2e7ff] text-[#131b2e]',
      content: `GUÍA PRÁCTICA DE INDEXACIÓN Y RENDIMIENTO SQL
1. B-Tree vs Hash Indexes en PostgreSQL
2. Análisis de Planes de Ejecución (EXPLAIN ANALYZE)
3. Reglas de Normalización: 1FN, 2FN, 3FN y Forma Normal de Boyce-Codd (BCNF)
4. Transacciones ACID, Niveles de Aislamiento y Bloqueos MVCC.`,
    },
  ];

  const marketList = [
    {
      id: 'm1',
      title: 'Calculadora TI-84 Plus CE',
      price: 45.0,
      location: 'Entrega en Biblioteca',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAMPCtTazJmP77sH_t1dVYaF7l3m3NGBSAJcAMUV_p1TOTfEsYkWaEDtdEHGFnY1ugXgjBrrXuUKzm3O7Q74ZKk4EDYiXjPXjijzXmd4URhNl6P18KWBVoi7rnf26lKcGO2Ov03reyFRp3JIYJT67svx1ndoZgiGzwFZu2kpPTx7BvZtoXigNOr61gV2Dr7cyOxh7YNECV_b7rCBX21EzWPbz7X8ZfavbT9B_37TV9CvMgRxPPJCe_T',
    },
    {
      id: 'm2',
      title: 'Libro Clean Code (Español)',
      price: 22.0,
      location: 'Entrega en Cafetería Central',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDJW2uhlmjEQ3HCkVS38V46rPLRchxCQyre9wHsjde6nRI_IsSnnO4DubVldZEtx8hWk2LXtsPGft1A2osPgfYaysKr921Wv5KhjR9T-p84zYuO-MRGyREmwl1G66mpieTM1YJcZej-zkDcFfeiboMuTlKgoVmt72qTDB1G1VmPOiqqPHcdNvljapDGcFCucEdLsVVv26WV-fwrG1w97N4riamdELNOyTYDjMZjpotv-kRtwQdKkyJZ',
    },
  ];

  return (
    <div className="flex flex-col w-full mx-auto pb-20 md:pb-8">
      {/* Banner y Cabecera de Perfil */}
      <section className="relative w-full">
        <div className="relative w-full h-44 overflow-hidden">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url('${CURRENT_USER.banner}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#faf8ff] via-[#faf8ff]/30 to-transparent"></div>

          {/* Floating action buttons on top of banner */}
          <div className="absolute top-3 right-4 flex items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                alert('Enlace de perfil universitario copiado');
              }}
              aria-label="Compartir perfil"
              className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-[#131b2e] shadow-xs active:scale-95 transition-transform"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">share</span>
            </button>
            <button
              onClick={onLogout}
              aria-label="Cerrar sesión / Ir a Login"
              title="Cerrar sesión"
              className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-[#ba1a1a] shadow-xs active:scale-95 transition-transform"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>

        {/* Avatar superpuesto y Carnet Badge */}
        <div className="px-4 -mt-14 relative z-10 flex items-end justify-between">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden shadow-md bg-white p-1">
              <img
                alt={CURRENT_USER.name}
                className="w-full h-full rounded-full object-cover"
                src={CURRENT_USER.avatar}
              />
            </div>
            <div
              className="absolute bottom-1 right-1 bg-[#006e4b] text-white w-6 h-6 rounded-full flex items-center justify-center shadow-xs"
              title="Carnet Institucional Verificado"
            >
              <span className="material-symbols-outlined text-[14px]">verified</span>
            </div>
          </div>

          {/* Quick Actions */}
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
              onClick={() => setIsEditing(!isEditing)}
              className="h-9 px-3.5 rounded-xl bg-[#3525cd] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-transform hover:bg-[#4f46e5]"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isEditing ? 'done' : 'edit'}
              </span>
              <span>{isEditing ? 'Guardar' : 'Editar'}</span>
            </button>
          </div>
        </div>

        {/* Datos Académicos & Bio */}
        <div className="px-4 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-[#131b2e] leading-tight">
              {CURRENT_USER.name}
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#6ffbbe]/25 text-[#005338] text-[10px] font-bold">
              <span className="material-symbols-outlined text-[12px]">verified_user</span>
              Estudiante Verificada
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-1 text-[#464555] text-xs font-semibold">
            <span className="material-symbols-outlined text-[16px] text-[#3525cd]">
              school
            </span>
            <span className="font-bold text-[#131b2e]">{userUniversity}</span>
            <span>•</span>
            <span>{CURRENT_USER.faculty}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#e2dfff] text-[#3323cc] text-[10px] font-bold">
              <span className="material-symbols-outlined text-[13px]">terminal</span>
              {CURRENT_USER.career}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#e2e7ff] text-[#464555] text-[10px] font-bold">
              <span className="material-symbols-outlined text-[13px]">calendar_today</span>
              {CURRENT_USER.semester}
            </span>
          </div>

          {/* Editable or Display Bio */}
          {isEditing ? (
            <div className="mt-3 flex flex-col gap-2">
              <textarea
                value={bioText}
                onChange={(e) => setBioText(e.target.value)}
                className="w-full bg-white p-2.5 rounded-xl border border-[#3525cd] text-xs text-[#131b2e] outline-none"
                rows={3}
              />
              <button
                type="button"
                onClick={() => {
                  onEditBio(bioText);
                  setIsEditing(false);
                }}
                className="self-end px-3 py-1 bg-[#3525cd] text-white text-xs rounded-lg font-bold"
              >
                Actualizar Biografía
              </button>
            </div>
          ) : (
            <p className="mt-2 text-xs text-[#464555] leading-relaxed">
              {CURRENT_USER.bio}
            </p>
          )}

          {/* Tarjeta de Universidad Vinculada Oficial */}
          <div className="mt-3 p-3 bg-gradient-to-r from-[#e2dfff]/40 to-[#eaedff]/60 rounded-2xl border border-[#d6d0ff] flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center text-[#3525cd] shrink-0">
                <span className="material-symbols-outlined text-[22px]">account_balance</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#3525cd]">
                    Universidad Vinculada
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006e4b]"></span>
                </div>
                <h3 className="text-xs font-bold text-[#131b2e] truncate">
                  {userUniversity}
                </h3>
                <span className="text-[10px] text-[#464555]">
                  {CURRENT_USER.faculty} • Alumno Regular Verificado
                </span>
              </div>
            </div>
            <button
              onClick={onOpenCarnet}
              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#faf8ff] text-[#3525cd] text-[11px] font-bold shadow-xs transition-colors shrink-0 flex items-center gap-1 active:scale-95"
            >
              <span className="material-symbols-outlined text-[15px]">badge</span>
              <span>Carnet</span>
            </button>
          </div>
        </div>
      </section>

      {/* Métricas y Estadísticas de Reputación */}
      <section className="px-4 mt-4">
        <div className="grid grid-cols-4 gap-1 p-3 bg-[#f2f3ff] rounded-2xl shadow-xs border border-[#eaedff]">
          <div className="flex flex-col items-center text-center p-1">
            <span className="text-lg font-extrabold text-[#3525cd]">
              {CURRENT_USER.stats.apuntes}
            </span>
            <span className="text-[10px] text-[#464555] mt-0.5">Apuntes</span>
          </div>

          <div className="flex flex-col items-center text-center p-1">
            <div className="flex items-center gap-0.5 text-[#712ae2]">
              <span className="text-lg font-extrabold">
                {CURRENT_USER.stats.reputacion}
              </span>
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
            <span className="text-lg font-extrabold text-[#131b2e]">
              {CURRENT_USER.stats.ventas}
            </span>
            <span className="text-[10px] text-[#464555] mt-0.5">Ventas</span>
          </div>

          <div className="flex flex-col items-center text-center p-1">
            <span className="text-lg font-extrabold text-[#131b2e]">
              {CURRENT_USER.stats.companeros}
            </span>
            <span className="text-[10px] text-[#464555] mt-0.5">Compañeros</span>
          </div>
        </div>
      </section>

      {/* Insignias y Logros Académicos */}
      <section className="mt-4">
        <div className="px-4 flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-[#131b2e]">Insignias de Campus</span>
          <button
            onClick={() => alert('Mostrando las 6 insignias verificadas de la Facultad')}
            className="text-[11px] text-[#3525cd] font-bold hover:underline"
            type="button"
          >
            Ver todas (6)
          </button>
        </div>

        {/* Carrusel Horizontal de Insignias */}
        <div className="flex items-center gap-2.5 overflow-x-auto px-4 pb-1 no-scrollbar">
          {CURRENT_USER.badges.map((badge) => (
            <div
              key={badge.id}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white shadow-xs border border-[#eaedff] shrink-0"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${badge.color}`}
              >
                <span className="material-symbols-outlined text-[20px]">{badge.icon}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#131b2e]">{badge.title}</span>
                <span className="text-[10px] text-[#464555]">{badge.subtitle}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pestañas de Navegación de Perfil */}
      <section className="mt-3 px-4">
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
            Apuntes (24)
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
            Marketplace (3)
          </button>

          <button
            onClick={() => setActiveTab('grupos')}
            type="button"
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'grupos'
                ? 'bg-[#3525cd] text-white shadow-xs'
                : 'bg-[#eaedff] text-[#464555] hover:bg-[#dae2fd]'
            }`}
          >
            Grupos (5)
          </button>

          <button
            onClick={() => setActiveTab('resenas')}
            type="button"
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'resenas'
                ? 'bg-[#3525cd] text-white shadow-xs'
                : 'bg-[#eaedff] text-[#464555] hover:bg-[#dae2fd]'
            }`}
          >
            Reseñas (38)
          </button>
        </div>
      </section>

      {/* Contenido de la pestaña Apuntes */}
      {activeTab === 'apuntes' && (
        <section className="px-4 mt-3 flex flex-col gap-2.5">
          {apuntesList.map((apunte) => (
            <article
              key={apunte.id}
              className="p-3.5 rounded-2xl bg-white shadow-xs border border-[#eaedff] flex flex-col gap-2 transition-transform active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${apunte.iconBg}`}
                  >
                    <span className="material-symbols-outlined text-[22px]">
                      {apunte.icon}
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h3 className="text-xs font-bold text-[#131b2e] truncate">
                      {apunte.title}
                    </h3>
                    <span className="text-[11px] text-[#464555] truncate">
                      {apunte.course}
                    </span>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${apunte.tagColor}`}
                >
                  {apunte.tag}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 text-[#464555] text-[10px]">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-[#3525cd]">
                      download
                    </span>
                    {apunte.downloads} descargas
                  </span>
                  <span className="flex items-center gap-1">
                    <span
                      className="material-symbols-outlined text-[15px] text-[#712ae2]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                    {apunte.rating}
                  </span>
                </div>
                <button
                  onClick={() => onOpenPdf(apunte.title, apunte.content)}
                  className="h-8 px-3 rounded-lg bg-[#eaedff] text-[#3525cd] text-xs font-bold flex items-center gap-1 hover:bg-[#dae2fd] transition-colors"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[15px]">visibility</span>
                  <span>Ver PDF</span>
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      {/* Contenido de la pestaña Marketplace */}
      {activeTab === 'market' && (
        <section className="px-4 mt-3 flex flex-col gap-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            {marketList.map((item) => (
              <div
                key={item.id}
                className="bg-white p-2 rounded-2xl shadow-xs border border-[#eaedff] flex flex-col"
              >
                <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2 bg-[#eaedff]">
                  <img
                    className="w-full h-full object-cover"
                    src={item.image}
                    alt={item.title}
                  />
                  <span className="absolute top-2 right-2 bg-[#283044]/85 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                    ${item.price.toFixed(2)}
                  </span>
                </div>
                <span className="text-xs font-bold text-[#131b2e] truncate">
                  {item.title}
                </span>
                <span className="text-[10px] text-[#464555]">{item.location}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contenido Grupos */}
      {activeTab === 'grupos' && (
        <section className="px-4 mt-3 flex flex-col gap-2">
          <div className="p-3 bg-white rounded-xl border border-[#eaedff] text-xs text-[#131b2e] font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[#3525cd]">terminal</span>
            <span>Club de Robótica y Automatización (Miembro Activo)</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-[#eaedff] text-xs text-[#131b2e] font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[#712ae2]">developer_mode</span>
            <span>Comunidad Algoritmos & Grafos - Ingeniería</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-[#eaedff] text-xs text-[#131b2e] font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006e4b]">school</span>
            <span>Red de Estudiantes Tutores 2026</span>
          </div>
        </section>
      )}

      {/* Contenido Reseñas */}
      {activeTab === 'resenas' && (
        <section className="px-4 mt-3 flex flex-col gap-2">
          <div className="p-3 bg-white rounded-xl border border-[#eaedff] flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#131b2e]">Mateo Silva</span>
              <span className="text-[10px] text-[#712ae2] font-bold">★★★★★</span>
            </div>
            <p className="text-[11px] text-[#464555]">
              Excelente vendedora, puntual y entregó en el punto seguro de la biblioteca.
            </p>
          </div>
          <div className="p-3 bg-white rounded-xl border border-[#eaedff] flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#131b2e]">Lucía Gómez</span>
              <span className="text-[10px] text-[#712ae2] font-bold">★★★★★</span>
            </div>
            <p className="text-[11px] text-[#464555]">
              Sus apuntes de Arquitectura de Software me salvaron en el examen final.
            </p>
          </div>
        </section>
      )}

      {/* Acceso rápido a Carnet Digital Floating Bar */}
      <div className="px-4 mt-4">
        <button
          onClick={onOpenCarnet}
          className="w-full p-3 rounded-2xl bg-gradient-to-r from-[#3525cd] via-[#4f46e5] to-[#712ae2] text-white flex items-center justify-between shadow-md active:scale-98 transition-transform text-left"
          type="button"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px] text-white">
                qr_code_2
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold">Carnet Digital NFC Activo</span>
              <span className="text-[10px] text-white/80">
                Válido para ingreso a campus y biblioteca
              </span>
            </div>
          </div>
          <span className="material-symbols-outlined text-[20px] text-white">
            chevron_right
          </span>
        </button>
      </div>
    </div>
  );
};
