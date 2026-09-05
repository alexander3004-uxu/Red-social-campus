import React, { useState } from 'react';
import { MarketItem } from '../types';
import { CURRENT_USER } from '../data/mockData';

interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: MarketItem) => void;
}

export const SellModal: React.FC<SellModalProps> = ({
  isOpen,
  onClose,
  onAddItem,
}) => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('25');
  const [category, setCategory] = useState('Libros y Manuales');
  const [condition, setCondition] = useState('Excelente');
  const [location, setLocation] = useState('Hall Biblioteca');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newItem: MarketItem = {
      id: `item-${Date.now()}`,
      title: title.trim(),
      price: parseFloat(price) || 20,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAMPCtTazJmP77sH_t1dVYaF7l3m3NGBSAJcAMUV_p1TOTfEsYkWaEDtdEHGFnY1ugXgjBrrXuUKzm3O7Q74ZKk4EDYiXjPXjijzXmd4URhNl6P18KWBVoi7rnf26lKcGO2Ov03reyFRp3JIYJT67svx1ndoZgiGzwFZu2kpPTx7BvZtoXigNOr61gV2Dr7cyOxh7YNECV_b7rCBX21EzWPbz7X8ZfavbT9B_37TV9CvMgRxPPJCe_T',
      faculty: CURRENT_USER.faculty.split(' ')[0],
      location: location,
      condition: condition,
      conditionColor: 'bg-[#6ffbbe]/25 text-[#005338]',
      seller: CURRENT_USER.name.split(' ')[0] + ' ' + CURRENT_USER.name.split(' ')[1]?.[0] + '.',
      rating: 5.0,
      category: category,
      isFav: false,
      isNewToday: true,
    };

    onAddItem(newItem);
    setTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#eaedff] flex flex-col animate-in fade-in">
        <div className="p-4 bg-gradient-to-r from-[#3525cd] to-[#712ae2] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
            <h3 className="text-sm font-bold">Publicar en Campus Market</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#131b2e]">
              Título del artículo / libro / dispositivo
            </label>
            <input
              type="text"
              placeholder="Ej: Guía de Cálculo Vectorial Stewart 8va Ed."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-[#f2f3ff] p-2.5 rounded-xl text-xs text-[#131b2e] outline-none focus:bg-white focus:ring-1 focus:ring-[#3525cd]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#131b2e]">Precio ($ USD)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="bg-[#f2f3ff] p-2.5 rounded-xl text-xs text-[#131b2e] outline-none"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#131b2e]">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-[#f2f3ff] p-2.5 rounded-xl text-xs text-[#131b2e] outline-none"
              >
                <option value="Libros y Manuales">Libros y Manuales</option>
                <option value="Tecnología">Tecnología</option>
                <option value="Calculadoras">Calculadoras</option>
                <option value="Bicicletas">Bicicletas</option>
                <option value="Mobiliario/Dorm">Mobiliario/Dorm</option>
                <option value="Tutorías">Tutorías</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#131b2e]">Estado</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="bg-[#f2f3ff] p-2.5 rounded-xl text-xs text-[#131b2e] outline-none"
              >
                <option value="Como nuevo">Como nuevo</option>
                <option value="Excelente">Excelente</option>
                <option value="Muy bueno">Muy bueno</option>
                <option value="Buen estado">Buen estado</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#131b2e]">Punto de Entrega</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-[#f2f3ff] p-2.5 rounded-xl text-xs text-[#131b2e] outline-none"
              >
                <option value="Hall Biblioteca">Hall Biblioteca Central</option>
                <option value="Cafetería Norte">Cafetería Norte</option>
                <option value="Laboratorio Tech">Laboratorio Tech Piso 2</option>
                <option value="Facultad Medicina">Facultad Medicina</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-[#e2dfff]/40 rounded-xl flex items-center gap-2 text-[11px] text-[#464555]">
            <span className="material-symbols-outlined text-[#3525cd] text-[18px]">
              verified_user
            </span>
            <span>
              Publicación protegida con carnet verificado. Cero comisiones universitarias.
            </span>
          </div>

          <button
            type="submit"
            className="mt-2 w-full py-3 bg-[#3525cd] text-white rounded-xl text-xs font-bold hover:bg-[#4f46e5] active:scale-95 transition-transform"
          >
            Publicar en el Market
          </button>
        </form>
      </div>
    </div>
  );
};
