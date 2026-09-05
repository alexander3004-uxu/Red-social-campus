import React, { useState } from 'react';
import { MarketItem } from '../types';

interface MarketScreenProps {
  items: MarketItem[];
  onToggleFav: (itemId: string) => void;
  onOpenChatWithSeller: (sellerName: string, productTitle: string, price: number) => void;
  onOpenSellModal: () => void;
  onOpenDonateModal: () => void;
  onSelectItemDetails: (item: MarketItem) => void;
}

export const MarketScreen: React.FC<MarketScreenProps> = ({
  items,
  onToggleFav,
  onOpenChatWithSeller,
  onOpenSellModal,
  onOpenDonateModal,
  onSelectItemDetails,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [subFilter, setSubFilter] = useState<string>('cerca');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'Todos', name: 'Todos', icon: 'apps' },
    { id: 'Libros y Manuales', name: 'Libros y Manuales', icon: 'menu_book' },
    { id: 'Tecnología', name: 'Tecnología', icon: 'devices' },
    { id: 'Calculadoras', name: 'Calculadoras', icon: 'calculate' },
    { id: 'Bicicletas', name: 'Bicicletas', icon: 'pedal_bike' },
    { id: 'Mobiliario/Dorm', name: 'Mobiliario/Dorm', icon: 'chair' },
    { id: 'Tutorías', name: 'Tutorías', icon: 'co_present' },
  ];

  const filteredItems = items.filter((item) => {
    const matchesCat = selectedCategory === 'Todos' || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.faculty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.seller.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesCat || !matchesSearch) return false;

    if (subFilter === 'menos20') return item.price <= 20;
    if (subFilter === 'nuevos') return !!item.isNewToday;
    return true;
  });

  return (
    <div className="flex flex-col w-full mx-auto pt-1 pb-20 md:pb-8">
      {/* Top Title & Sell CTA */}
      <section className="px-4 pt-1 pb-2 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#712ae2] font-bold">
              Mercado Universitario
            </span>
            <h2 className="text-xl text-[#131b2e] font-extrabold flex items-center gap-1.5 leading-tight">
              <span>Campus Market</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#eaddff] text-[#25005a] text-[10px] font-bold">
                100% Verificado
              </span>
            </h2>
          </div>
          <button
            onClick={onOpenSellModal}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#3525cd] to-[#712ae2] text-white text-xs font-bold shadow-md flex items-center gap-1.5 active:scale-95 transition-transform hover:brightness-105"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Vender</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-[#464555] text-[20px] pointer-events-none">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-9 rounded-xl bg-[#eaedff] text-[#131b2e] text-xs placeholder:text-[#464555]/70 focus:outline-none focus:bg-white focus:shadow-[0_0_0_2px_rgba(79,70,229,0.3)] transition-all border border-transparent focus:border-[#4f46e5]/30"
              placeholder="Buscar libros, calculadoras, apuntes..."
              type="text"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 w-6 h-6 rounded-full flex items-center justify-center text-[#464555] hover:text-[#131b2e]"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            ) : (
              <button
                className="absolute right-2.5 w-6 h-6 rounded-full flex items-center justify-center text-[#464555] hover:text-[#131b2e]"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">tune</span>
              </button>
            )}
          </div>
          <button
            aria-label="Filtros"
            onClick={() => alert('Filtro avanzado por facultades y rangos de precio')}
            className="w-11 h-11 rounded-xl bg-[#e2e7ff] text-[#131b2e] flex items-center justify-center shrink-0 active:scale-95 transition-transform"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
          </button>
        </div>
      </section>

      {/* Categories Horizontal Rail */}
      <section className="w-full overflow-x-auto no-scrollbar py-1 pl-4">
        <div className="flex items-center gap-2 pr-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              type="button"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold shrink-0 whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#3525cd] text-white shadow-xs'
                  : 'bg-[#f2f3ff] text-[#464555] hover:bg-[#eaedff]'
              }`}
            >
              <span
                className="material-symbols-outlined text-[16px]"
                style={{
                  fontVariationSettings: selectedCategory === cat.id ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {cat.icon}
              </span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Puntos de Entrega Segura Banner */}
      <section className="px-4 py-2">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#e2dfff] to-[#e2e7ff] p-3.5 shadow-xs border border-[#c7c4d8]/40">
          <div className="flex items-start gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-[#3525cd] text-white flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[22px]">verified_user</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-[#0f0069] leading-tight">
                  Puntos de Entrega Segura
                </span>
                <span className="w-2 h-2 rounded-full bg-[#006e4b] animate-pulse"></span>
              </div>
              <p className="text-[11px] text-[#464555] mt-0.5 leading-snug">
                Realiza tus intercambios en el{' '}
                <strong className="text-[#131b2e] font-semibold">
                  Hall Biblioteca Central
                </strong>{' '}
                o la{' '}
                <strong className="text-[#131b2e] font-semibold">
                  Cafetería Facultad Norte
                </strong>{' '}
                con vigilancia activa.
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] text-[#3525cd] font-bold">
                  <span className="material-symbols-outlined text-[13px]">pin_drop</span>{' '}
                  4 Zonas monitoreadas
                </span>
                <span className="text-[#c7c4d8] text-[10px]">•</span>
                <span className="inline-flex items-center gap-1 text-[10px] text-[#005338] font-bold">
                  <span className="material-symbols-outlined text-[13px]">lock</span> Cero
                  comisiones
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Artículos en Tu Campus Subheader */}
      <section className="px-4 pt-2 pb-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-[#3525cd]">
              local_fire_department
            </span>
            <h3 className="text-sm font-bold text-[#131b2e]">Artículos en Tu Campus</h3>
          </div>
          <span className="text-xs text-[#712ae2] font-semibold">
            {filteredItems.length} disponibles
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSubFilter('cerca')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 transition-colors ${
              subFilter === 'cerca'
                ? 'bg-[#dae2fd] text-[#131b2e]'
                : 'bg-[#f2f3ff] text-[#464555] hover:bg-[#eaedff]'
            }`}
            type="button"
          >
            Cerca de mi facultad
          </button>
          <button
            onClick={() => setSubFilter('menos20')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 transition-colors ${
              subFilter === 'menos20'
                ? 'bg-[#dae2fd] text-[#131b2e]'
                : 'bg-[#f2f3ff] text-[#464555] hover:bg-[#eaedff]'
            }`}
            type="button"
          >
            Menos de $20
          </button>
          <button
            onClick={onOpenDonateModal}
            className="px-2.5 py-1 rounded-lg bg-[#f2f3ff] text-[#464555] hover:bg-[#eaedff] text-[10px] font-bold shrink-0"
            type="button"
          >
            Donaciones / Gratis
          </button>
          <button
            onClick={() => setSubFilter('nuevos')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 transition-colors ${
              subFilter === 'nuevos'
                ? 'bg-[#dae2fd] text-[#131b2e]'
                : 'bg-[#f2f3ff] text-[#464555] hover:bg-[#eaedff]'
            }`}
            type="button"
          >
            Nuevos hoy
          </button>
        </div>
      </section>

      {/* Responsive Product Grid */}
      <section className="px-4 py-1">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col bg-white rounded-2xl p-3 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.05)] hover:shadow-md border border-[#eaedff] transition-all relative group"
            >
              {/* Product Image & Badges */}
              <div
                onClick={() => onSelectItemDetails(item)}
                className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#eaedff] cursor-pointer group"
              >
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  src={item.image}
                  alt={item.title}
                />
                {/* Price Pill */}
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#283044]/85 backdrop-blur-md text-[#eef0ff] text-sm font-extrabold shadow-xs">
                  ${item.price}
                </span>

                {/* Favorite Heart Button */}
                <button
                  aria-label="Favorito"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFav(item.id);
                  }}
                  className={`absolute top-2 left-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center transition-colors ${
                    item.isFav ? 'text-[#ba1a1a]' : 'text-[#464555] hover:text-[#ba1a1a]'
                  }`}
                  type="button"
                >
                  <span
                    className="material-symbols-outlined text-[16px]"
                    style={{
                      fontVariationSettings: item.isFav ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    favorite
                  </span>
                </button>

                {/* Condition Tag */}
                <div className="absolute bottom-2 left-2">
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${item.conditionColor}`}
                  >
                    {item.condition}
                  </span>
                </div>
              </div>

              {/* Item Info */}
              <div className="mt-2 flex flex-col flex-1">
                <div className="flex items-center gap-1">
                  <span className="px-1.5 py-0.2 rounded bg-[#e2dfff] text-[#0f0069] text-[10px] font-bold">
                    {item.faculty}
                  </span>
                  <span className="text-[#464555] text-[10px]">
                    {item.location}
                  </span>
                </div>

                <h4
                  onClick={() => onSelectItemDetails(item)}
                  className="text-xs font-bold text-[#131b2e] mt-1 line-clamp-1 cursor-pointer hover:text-[#3525cd]"
                >
                  {item.title}
                </h4>

                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    className="material-symbols-outlined text-[13px] text-[#006e4b]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  <span className="text-[10px] text-[#131b2e] font-bold">
                    {item.rating}
                  </span>
                  <span className="text-[#464555] text-[10px] truncate">
                    • {item.seller}
                  </span>
                </div>

                {/* Chat Action */}
                <div className="mt-2 pt-1.5 flex items-center gap-1.5 border-t border-[#f2f3ff]">
                  <button
                    onClick={() => onOpenChatWithSeller(item.seller, item.title, item.price)}
                    className="flex-1 py-1.5 rounded-lg bg-[#4f46e5] text-white text-[11px] font-bold text-center active:scale-95 transition-transform flex items-center justify-center gap-1 shadow-xs hover:bg-[#3525cd]"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[14px]">chat</span> Chat
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Donation Callout */}
      <section className="px-4 pt-3 pb-2">
        <div className="p-3.5 rounded-2xl bg-[#eaedff] flex items-center justify-between border border-[#c7c4d8]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#8a4cfc] text-[#fffbff] flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[20px]">volunteer_activism</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#131b2e]">¿Terminaste el semestre?</h4>
              <p className="text-[11px] text-[#464555]">
                Dona tus apuntes o libros a alumnos de primer ingreso.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenDonateModal}
            className="px-3 py-1.5 rounded-xl bg-white text-[#3525cd] text-xs font-bold shadow-xs whitespace-nowrap active:scale-95 transition-transform hover:bg-[#faf8ff]"
            type="button"
          >
            Donar
          </button>
        </div>
      </section>
    </div>
  );
};
