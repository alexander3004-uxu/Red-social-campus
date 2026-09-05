import React from 'react';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content?: string;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
}) => {
  if (!isOpen) return null;

  const defaultContent = `UNIVERSIDAD CENTRAL • FACULTAD DE MEDICINA Y CIENCIAS
Módulo: Anatomía Cardiovascular y Fisiología Hemodinámica
Autor/a: Estudiante con Verificación Académica

RESUMEN EJECUTIVO & ESQUEMAS:
1. CICLO CARDÍACO Y FASES:
   - Sístole Auricular: Llenado ventricular final (20-30% restante)
   - Contracción Ventricular Isovolumétrica: Cierre de válvulas AV (R1)
   - Eyección Rápida y Reducida: Apertura de válvulas semilunares
   - Relajación Ventricular Isovolumétrica: Cierre de válvulas semilunares (R2)

2. IRRIGACIÓN CORONARIA:
   - Arteria Coronaria Izquierda -> Rama Interventricular Anterior (DA) y Circunfleja
   - Arteria Coronaria Derecha -> Rama Marginal Derecha y Descendente Posterior (en 85% de dominancia derecha)

3. GASTO CARDÍACO (GC):
   - GC = Frecuencia Cardíaca (FC) × Volumen Sistólico (VS)
   - Ley de Frank-Starling: Mayor precarga genera mayor fuerza de contracción miocárdica.

4. RECORDATORIO PARA EL PARCIAL:
   - Revisar diagramas de presiones ventriculares (Diagrama de Wiggers)
   - Recordar auscultación de soplos sistólicos vs diastólicos.`;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-lg max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#eaedff] flex flex-col animate-in fade-in">
        {/* Top Header */}
        <div className="bg-[#131b2e] p-3.5 text-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-[24px] text-[#ba1a1a]">
              picture_as_pdf
            </span>
            <div className="flex flex-col min-w-0">
              <h3 className="text-xs font-bold truncate">{title}</h3>
              <span className="text-[10px] text-white/70">Documento Oficial CampusLink</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => alert(`Descargando "${title}" en PDF local...`)}
              className="px-2.5 py-1 rounded-lg bg-[#3525cd] text-white text-xs font-bold flex items-center gap-1 hover:bg-[#4f46e5]"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Guardar</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* PDF Controls Strip */}
        <div className="bg-[#f2f3ff] px-4 py-2 flex items-center justify-between border-b border-[#eaedff] text-xs text-[#464555]">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold">Página 1 de 4</span>
            <span className="text-[#c7c4d8]">|</span>
            <span className="text-[11px] text-[#006e4b] font-bold">100% Legible</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1 hover:text-[#131b2e]">
              <span className="material-symbols-outlined text-[18px]">zoom_out</span>
            </button>
            <span className="text-[11px] font-mono">100%</span>
            <button className="p-1 hover:text-[#131b2e]">
              <span className="material-symbols-outlined text-[18px]">zoom_in</span>
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 overflow-y-auto p-5 font-sans bg-[#faf8ff]">
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-[#eaedff] text-[#131b2e] leading-relaxed text-xs whitespace-pre-line font-mono">
            {content || defaultContent}
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-white border-t border-[#eaedff] flex items-center justify-between text-[11px] text-[#464555]">
          <span>Verificado por la Red Estudiantil</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#e2e7ff] text-[#131b2e] font-bold hover:bg-[#dae2fd]"
          >
            Cerrar Vista Previa
          </button>
        </div>
      </div>
    </div>
  );
};
