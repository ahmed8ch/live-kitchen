import React, { useState } from 'react';
import { MENU_ITEMS } from '../domain/menuData';
import { MenuCategory, MenuItem } from '../types/domain';
import { DishModal } from '../components/menu/DishModal';
import { FloatingCartBar } from '../components/cart/FloatingCartBar';
import { CartDrawer } from '../components/cart/CartDrawer';
import { useAppStore } from '../store/useAppStore';

const CATEGORIES: { id: 'all' | MenuCategory; label: string }[] = [
  { id: 'all', label: 'All Dishes' },
  { id: 'burgers', label: 'Flame Burgers' },
  { id: 'steaks', label: 'Prime Steaks' },
  { id: 'pizzas', label: 'Artisan Pizzas' },
  { id: 'pastas', label: 'Pastas & Sides' },
  { id: 'drinks', label: 'Drinks & Desserts' },
];

export const MenuPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | MenuCategory>('all');
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);

  const activeTable = useAppStore((state) => state.activeTable);

  const filteredDishes =
    activeCategory === 'all'
      ? MENU_ITEMS
      : MENU_ITEMS.filter((item) => item.category === activeCategory);

  return (
    <div className="flex-1 w-full bg-white pb-32">
      {/* Menu Header & Table Context */}
      <section className="bg-[#fafafa] border-b border-[#e5e7eb] py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#e5e7eb] text-[12px] font-semibold text-[#262626] mb-2 shadow-xs">
                <span className="px-2 py-0.5 rounded-full bg-[#ff4d00] text-white text-[10px] font-bold uppercase tracking-wider">
                  GRILL
                </span>
                <span>Wood-Fired Kitchen & Grill</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#262626] tracking-tight">
                Dine-In Self-Ordering Menu
              </h1>
              <p className="mt-1 text-[15px] text-[#727272]">
                Tap any dish to customize portions, toppings, and send straight to the kitchen.
              </p>
            </div>

            {activeTable ? (
              <div className="sm:text-right bg-white p-3.5 sm:p-4 rounded-xl border border-[#e5e7eb] shadow-xs">
                <div className="text-[11px] font-semibold text-[#727272] uppercase tracking-wider">
                  Assigned Seating
                </div>
                <div className="text-xl font-bold font-mono-num text-[#ff4d00]">
                  Table {activeTable}
                </div>
              </div>
            ) : (
              <div className="sm:text-right bg-white p-3.5 sm:p-4 rounded-xl border border-[#e5e7eb] shadow-xs">
                <div className="text-[11px] font-semibold text-[#727272] uppercase tracking-wider">
                  Browsing Online
                </div>
                <div className="text-[13px] font-medium text-[#262626]">
                  Dine-In & Counter Pickup
                </div>
              </div>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all shrink-0 cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[#262626] text-white shadow-xs'
                    : 'bg-white hover:bg-[#f0f0f0] text-[#727272] border border-[#e5e7eb]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Dish Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#262626]">
            {CATEGORIES.find((c) => c.id === activeCategory)?.label}
          </h2>
          <span className="text-[13px] font-mono-num text-[#727272]">
            {filteredDishes.length} dishes available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredDishes.map((dish) => (
            <div
              key={dish.id}
              onClick={() => setSelectedDish(dish)}
              className="group bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden shadow-xs hover:border-[#ff4d00]/40 hover:shadow-md transition-all cursor-pointer flex flex-col active:scale-[0.99]"
            >
              {/* Dish Image */}
              <div className="relative h-48 sm:h-52 w-full bg-[#f9f9f9] overflow-hidden">
                <img
                  src={dish.imageUrl}
                  alt={dish.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                {dish.badge && (
                  <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-[#ff4d00] text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                    {dish.badge}
                  </div>
                )}
                <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-xs text-white text-[11px] font-mono-num">
                  {dish.calories} kcal
                </div>
              </div>

              {/* Dish Information */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-[16px] font-bold text-[#262626] group-hover:text-[#ff4d00] transition-colors">
                    {dish.name}
                  </h3>
                  <p className="mt-1.5 text-[13px] text-[#727272] line-clamp-2 leading-relaxed">
                    {dish.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[#e5e7eb] flex items-center justify-between">
                  <div className="font-mono-num font-bold text-[16px] text-[#262626]">
                    {dish.basePrice.toFixed(2)}{' '}
                    <span className="text-[12px] font-sans font-normal text-[#727272]">EGP</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDish(dish);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f9f9f9] hover:bg-[#ff4d00] hover:text-white border border-[#e5e7eb] hover:border-[#ff4d00] text-[12px] font-semibold text-[#262626] transition-all cursor-pointer"
                  >
                    <span>+ Customize</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modals & Cart Controls */}
      <DishModal dish={selectedDish} onClose={() => setSelectedDish(null)} />
      <FloatingCartBar />
      <CartDrawer />
    </div>
  );
};
