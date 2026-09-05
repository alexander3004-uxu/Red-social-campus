import React, { useState } from 'react';

interface UniversitySelectModalProps {
  isOpen: boolean;
  currentUniversity: string;
  onConfirm: (university: string) => void;
}

export const UNIVERSITIES_LIST = [
  {
    id: 'ucentral',
    name: 'Universidad Central (Sede Principal)',
    city: 'Campus Central • Facultades de Ingeniería, Negocios y Artes',
    icon: 'account_balance',
    badge: 'Oficial',
  },
  {
    id: 'tec-metro',
    name: 'Tecnológico Metropolitano',
    city: 'Campus Norte • Ciencia, Computación y Tecnología',
    icon: 'memory',
    badge: 'Acreditada',
  },
  {
    id: 'fac-medicina',
    name: 'Facultad de Medicina & Ciencias',
    city: 'Campus Biomédico • Salud, Cirugía y Biotecnología',
    icon: 'medical_services',
    badge: 'Hospital Univ.',
  },
  {
    id: 'unacional',
    name: 'Universidad Nacional Autónoma',
    city: 'Ciudad Universitaria • Todas las Áreas',
    icon: 'school',
    badge: 'Pública',
  },
  {
    id: 'ucatolica',
    name: 'Pontificia Universidad Católica',
    city: 'Campus Oriente • Humanidades, Derecho y Ciencias',
    icon: 'history_edu',
    badge: 'Acreditada',
  },
];

export const UniversitySelectModal: React.FC<UniversitySelectModalProps> = ({
  isOpen,
  currentUniversity,
  onConfirm,
}) => {
  const [selected, setSelected] = useState<string>(currentUniversity || UNIVERSITIES_LIST[0].name);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#eaedff] flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-[#3525cd] via-[#4f46e5] to-[#712ae2] p-5 text-white flex flex-col gap-1 text-center items-center">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center mb-1">
            <span className="material-symbols-outlined text-[28px] text-white">
              account_balance
            </span>
          </div>
          <h2 className="text-lg font-bold tracking-tight">Selecciona tu Universidad</h2>
          <p className="text-xs text-white/80 max-w-xs">
            Solo te preguntaremos esto una vez para vincular tu carnet digital institucional y mostrarlo en tu perfil.
          </p>
        </div>

        {/* Content list */}
        <div className="p-5 flex flex-col gap-2.5 max-h-[60vh] overflow-y-auto">
          <div className="text-[11px] font-bold text-[#464555] uppercase tracking-wider px-1">
            Universidades Disponibles
          </div>

          <div className="flex flex-col gap-2">
            {UNIVERSITIES_LIST.map((item) => {
              const isSelected = selected === item.name;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelected(item.name)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'border-[#3525cd] bg-[#f2f3ff] shadow-sm ring-2 ring-[#3525cd]/20'
                      : 'border-[#eaedff] bg-white hover:bg-[#faf8ff]'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'bg-[#3525cd] text-white' : 'bg-[#e2e7ff] text-[#3525cd]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  </div>

                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-[#131b2e] leading-snug">
                        {item.name}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold bg-[#6ffbbe]/25 text-[#005338] shrink-0">
                        {item.badge}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#464555] mt-0.5 leading-tight">
                      {item.city}
                    </span>
                  </div>

                  <div className="pt-0.5">
                    <span
                      className={`material-symbols-outlined text-[18px] transition-colors ${
                        isSelected ? 'text-[#3525cd]' : 'text-[#c7c5d0]'
                      }`}
                      style={{ fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4 bg-[#faf8ff] border-t border-[#eaedff] flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onConfirm(selected)}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#3525cd] to-[#712ae2] hover:opacity-95 text-white text-xs font-bold shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>Confirmar y Guardar en mi Perfil</span>
          </button>
          <span className="text-[10px] text-center text-[#777587]">
            Esta institución quedará vinculada permanentemente a tu perfil académico.
          </span>
        </div>
      </div>
    </div>
  );
};
