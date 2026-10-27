import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { MENU_ITEMS } from '../domain/menuData';
import { MenuCategory, MenuItem } from '../types/domain';
import { DishModal } from '../components/menu/DishModal';
import { FloatingCartBar } from '../components/cart/FloatingCartBar';
import { CartDrawer } from '../components/cart/CartDrawer';
import { TableLobbyBar } from '../components/multiplayer/TableLobbyBar';

const CATEGORIES: { id: 'all' | MenuCategory; label: string }[] = [
  { id: 'all', label: 'All Dishes' },
  { id: 'burgers', label: 'Flame Burgers' },
  { id: 'steaks', label: 'Prime Steaks' },
  { id: 'pizzas', label: 'Artisan Pizzas' },
  { id: 'pastas', label: 'Pastas & Sides' },
  { id: 'drinks', label: 'Drinks & Desserts' },
];

export const CompanionPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tableParam = searchParams.get('table') || 'T-04';

  const activeTable = useAppStore((state) => state.activeTable);
  const companionMember = useAppStore((state) => state.companionMember);
  const initCompanionSession = useAppStore((state) => state.initCompanionSession);
  const addToCartAsCompanion = useAppStore((state) => state.addToCartAsCompanion);

  const [activeCategory, setActiveCategory] = useState<'all' | MenuCategory>('all');
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);

  const cleanTable = (tableParam || activeTable || 'T-04').trim().toUpperCase();

  // Ensure table session & companion profile are initialized
  useEffect(() => {
    initCompanionSession(cleanTable);
  }, [cleanTable]);

  const filteredDishes =
    activeCategory === 'all'
      ? MENU_ITEMS
      : MENU_ITEMS.filter((item) => item.category === activeCategory);

  return (
    <div className="flex-1 w-full bg-white pb-36 select-none" data-ui-container="companion-menu-view">
      {/* Sticky Table Lobby Bar (PIN, Table Diners, Companion sync) */}
      <TableLobbyBar />

      {/* Clean, Functional Menu Header Identical to MenuPage */}
      <section className="bg-white border-b border-[#e5e7eb] pt-6 pb-5 sm:pt-8 sm:pb-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#262626] tracking-tight">
                  Menu
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#fff0f3] border border-[#ffd1dc] text-[#FF0055] text-[11px] font-mono-num font-bold">
                  {companionMember?.name || 'Guest'}
                </span>
              </div>
              <p className="text-[13px] text-[#727272]">
                Cooked fresh over wood flame coals upon payment confirmation. Touch any dish to customize.
              </p>
            </div>

            <div className="sm:text-right bg-[#f9f9f9] px-4 py-2 rounded-xl border border-[#e5e7eb] shrink-0">
              <div className="text-[10px] font-mono-num uppercase tracking-wider text-[#727272]">
                Table Seating
              </div>
              <div className="text-base font-mono-num font-bold text-[#FF0055]">
                Table {cleanTable}
              </div>
            </div>
          </div>

          {/* Category Filter Pills (2px solid #FF0055 selected state) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" data-ui-actions="category-filters">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                data-ui-radius="999"
                className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all shrink-0 cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[#fff0f3] text-[#FF0055] shadow-xs border-2 border-[#FF0055] font-bold'
                    : 'bg-white hover:bg-[#f0f0f0] text-[#727272] border border-[#e5e7eb]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Dish Grid Section (3-column, high-resolution photography identical to MenuPage) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#262626]">
            {CATEGORIES.find((c) => c.id === activeCategory)?.label}
          </h2>
          <span className="text-[12px] font-mono-num text-[#949494]">
            {filteredDishes.length} dishes
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filteredDishes.map((dish) => (
            <div
              key={dish.id}
              onClick={() => setSelectedDish(dish)}
              data-ui-radius="16"
              className="group bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden shadow-xs hover:border-[#FF0055] transition-all cursor-pointer flex flex-col active:scale-[0.99] select-none"
            >
              {/* Full Dish Image with Badges */}
              <div className="relative h-48 sm:h-52 w-full bg-[#f9f9f9] overflow-hidden">
                <img
                  src={dish.imageUrl}
                  alt={dish.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                {dish.badge && (
                  <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-[#FF0055] text-white text-[11px] font-mono-num font-semibold shadow-xs">
                    {dish.badge}
                  </div>
                )}
                {dish.rating && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-white/95 text-[#262626] text-[11px] font-mono-num font-medium shadow-xs flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 fill-[#FBBF24] text-[#FBBF24]" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-bold">{dish.rating}</span>
                  </div>
                )}
              </div>

              {/* Dish Card Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-[16px] font-bold text-[#262626] group-hover:text-[#FF0055] transition-colors leading-snug">
                    {dish.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-[12px] font-mono-num text-[#949494]">
                    <span>{dish.calories} KCAL</span>
                    <span>•</span>
                    <span>{dish.prepTime || '10 min'}</span>
                  </div>
                  <p className="mt-2 text-[13px] text-[#727272] line-clamp-2 leading-relaxed">
                    {dish.description}
                  </p>
                </div>

                {/* Bottom Price & Customize Action */}
                <div className="mt-5 pt-4 border-t border-[#f0f0f0] flex items-center justify-between">
                  <div className="text-[17px] font-mono-num font-bold text-[#FF0055]" data-ui-number>
                    {dish.basePrice.toFixed(2)} EGP
                  </div>

                  <span
                    data-ui-radius="999"
                    className="px-3.5 py-1.5 rounded-full bg-[#f9f9f9] group-hover:bg-[#FF0055] text-[#262626] group-hover:text-white border border-[#e5e7eb] group-hover:border-[#FF0055] text-[12px] font-medium transition-all shadow-xs"
                  >
                    Customize +
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Rich Dish Modal Customization with Companion Attribution */}
      <DishModal
        dish={selectedDish}
        onClose={() => setSelectedDish(null)}
        onAdd={(dish, mods, q, notes) => addToCartAsCompanion(dish, mods, q, notes)}
      />

      {/* Floating Light-Theme Cart Bar */}
      <FloatingCartBar />

      {/* Shared Cart Drawer */}
      <CartDrawer />
    </div>
  );
};