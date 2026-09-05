import React, { useState } from 'react';
import { CURRENT_USER } from '../data/mockData';

interface CarnetModalProps {
  isOpen: boolean;
  onClose: () => void;
  university?: string;
}

export const CarnetModal: React.FC<CarnetModalProps> = ({ isOpen, onClose, university }) => {
  const [isNfcBeaming, setIsNfcBeaming] = useState(false);
  const [accessApproved, setAccessApproved] = useState(false);
  const carnetUniversity = university || CURRENT_USER.university;

  if (!isOpen) return null;

  const handleSimulateTurnstile = () => {
    setIsNfcBeaming(true);
    setTimeout(() => {
      setIsNfcBeaming(false);
      setAccessApproved(true);
      setTimeout(() => {
        setAccessApproved(false);
      }, 3000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#eaedff] flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#3525cd] via-[#4f46e5] to-[#712ae2] p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px]">badge</span>
            <div>
              <h3 className="text-sm font-bold leading-tight">Carnet Digital Universitario</h3>
              <p className="text-[10px] text-white/80">Credencial Oficial con Chip NFC</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar carnet"
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Card Body */}
        <div className="p-5 flex flex-col items-center">
          {/* Card Frame */}
          <div className="w-full bg-gradient-to-br from-[#131b2e] via-[#283044] to-[#1f283d] rounded-2xl p-4 text-white shadow-xl relative overflow-hidden border border-white/10">
            {/* Hologram / NFC Beacon Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#712ae2]/30 rounded-full blur-2xl pointer-events-none"></div>

            {/* University & Logo */}
            <div className="flex items-center justify-between border-b border-white/15 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <img
                  alt="Logo"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6gRafboGZpiXWJibXgTkHN8n4OUwNAZsp9ORX6mac0-TU5lb8hEFJRtxOnZD_xwuY3cj-jsaXKYDgJ0sAfr1Y0po9uTKT7Bt-tX6YCtIFKeCru3NsyG6UMyVm2UYODTUoQb-zXQ4ftQsEP9FNGJyWhqoLp1s5qFzKQTer0hUvF3ugMMu98wt-HBWyvnPMfCFVc5aYMHT9jR_n9X49l2_Su9FRyQNh1n6PE3Wt7id5XPz1FNkuYZbL"
                  className="h-6 w-auto"
                />
                <span className="text-xs font-bold tracking-tight uppercase truncate max-w-[180px]">
                  {carnetUniversity}
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6ffbbe]/25 text-[#6ffbbe] font-bold">
                ACTIVO
              </span>
            </div>

            {/* Student Info & Photo */}
            <div className="flex items-center gap-3.5 mb-3">
              <div className="w-18 h-18 rounded-xl overflow-hidden ring-2 ring-[#4f46e5] shrink-0 bg-white">
                <img
                  alt={CURRENT_USER.name}
                  className="w-full h-full object-cover"
                  src={CURRENT_USER.avatar}
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-extrabold truncate text-white">
                  {CURRENT_USER.name}
                </span>
                <span className="text-[11px] text-[#dad7ff] font-semibold">
                  {CURRENT_USER.career}
                </span>
                <span className="text-[10px] text-white/70">
                  Carnet: <strong className="text-white font-mono">{CURRENT_USER.studentId}</strong>
                </span>
                <span className="text-[10px] text-white/70">
                  Válido: <strong className="text-[#6ffbbe]">Dic 2026</strong>
                </span>
              </div>
            </div>

            {/* QR Code & Barcode Simulation */}
            <div className="bg-white rounded-xl p-3 flex items-center justify-between gap-2 text-black">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider text-[#464555] font-bold">
                  Código QR Dinámico
                </span>
                <span className="text-[8px] text-[#777587]">Se renueva cada 60s</span>
                <div className="mt-1 flex items-center gap-1 text-[10px] font-mono text-[#3525cd] font-bold">
                  <span className="material-symbols-outlined text-[14px]">contactless</span>
                  <span>NFC READY</span>
                </div>
              </div>

              {/* QR Image Graphic */}
              <div className="w-16 h-16 bg-white p-1 rounded-lg border border-gray-200 flex items-center justify-center">
                <img
                  alt="QR Code"
                  className="w-full h-full object-contain"
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=CAMPUSLINK-SOFIA-20228491-VERIFIED"
                />
              </div>
            </div>
          </div>

          {/* Access status alert */}
          {accessApproved && (
            <div className="mt-3 w-full bg-[#6ffbbe]/25 border border-[#006e4b] rounded-xl p-2.5 flex items-center gap-2 text-xs font-bold text-[#005338] animate-in fade-in">
              <span className="material-symbols-outlined text-[#005338]">check_circle</span>
              <span>¡Acceso Autorizado! Torniquete Biblioteca abierto.</span>
            </div>
          )}

          {/* Simulated NFC Button */}
          <button
            onClick={handleSimulateTurnstile}
            disabled={isNfcBeaming}
            className={`mt-4 w-full h-12 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 ${
              isNfcBeaming
                ? 'bg-[#712ae2] text-white animate-pulse'
                : 'bg-[#3525cd] text-white hover:bg-[#4f46e5]'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isNfcBeaming ? 'sensors' : 'contactless'}
            </span>
            <span>
              {isNfcBeaming
                ? 'Transmitiendo señal NFC...'
                : 'Simular Ingreso a Torniquete Biblioteca'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
