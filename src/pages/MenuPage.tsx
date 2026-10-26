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
    <div className="flex-1 w-full bg-white pb-32" data-ui-container="menu-view">
      {/* Menu Header Card (Matching original screenshot) */}
      <section className="bg-white border-b border-[#e5e7eb] pt-8 pb-6 sm:pt-10 sm:pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Pill Bar */}
          <div className="flex justify-center mb-6">
            <span className="px-4 py-1.5 rounded-full bg-[#f9f9f9] border border-[#e5e7eb] text-[12px] font-semibold text-[#727272]">
              Dine-In Menu
            </span>
          </div>

          {/* Dine-In Menu Notice Box */}
          <div
            data-ui-radius="16"
            className="p-5 sm:p-6 rounded-2xl bg-[#fcfcfc] border border-[#e5e7eb] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs mb-8"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C]" />
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#262626] tracking-tight">
                  Dine-In Menu
                </h1>
              </div>
              <p className="mt-1 text-[14px] text-[#727272]">
                Flame-Grilled Fresh / Handcrafted Kitchen Orders
              </p>
            </div>

            {activeTable ? (
              <div className="sm:text-right bg-white p-3 rounded-xl border border-[#e5e7eb] shadow-xs shrink-0">
                <div className="text-[11px] font-semibold text-[#727272] uppercase tracking-wider">
                  Assigned Seating
                </div>
                <div className="text-lg font-bold font-mono-num text-[#EA580C]">
                  Table {activeTable}
                </div>
              </div>
            ) : (
              <div className="sm:text-right bg-white p-3 rounded-xl border border-[#e5e7eb] shadow-xs shrink-0">
                <div className="text-[11px] font-semibold text-[#727272] uppercase tracking-wider">
                  Browsing Online
                </div>
                <div className="text-[13px] font-medium text-[#262626]">
                  Dine-In & Counter Pickup
                </div>
              </div>
            )}
          </div>

          {/* Category Filter Pills (Exact original styling) */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none" data-ui-actions="category-filters">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                data-ui-radius="999"
                className={`px-5 py-2.5 rounded-full text-[13px] font-semibold transition-all shrink-0 cursor-pointer ${
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

      {/* Dish Grid Section (Exact 3-column replica with ratings, tags & Customize+ button) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#262626]" data-ui-balance>
            {CATEGORIES.find((c) => c.id === activeCategory)?.label}
          </h2>
          <span className="text-[13px] font-mono-num text-[#727272]" data-ui-number>
            {filteredDishes.length} dishes available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filteredDishes.map((dish) => (
            <div
              key={dish.id}
              onClick={() => setSelectedDish(dish)}
              data-ui-radius="16"
              className="group bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden shadow-xs hover:border-[#EA580C]/50 hover:shadow-md transition-all cursor-pointer flex flex-col active:scale-[0.99]"
            >
              {/* Dish Image with Floating Badges */}
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

                {/* Left Badge: Chef Signature / Crispy / etc. (White pill with crisp dark text) */}
                {dish.badge && (
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 text-[#262626] text-[11px] font-bold shadow-xs">
                    {dish.badge}
                  </div>
                )}

                {/* Right Badge: 540 kcal (Dark pill with white mono text) */}
                <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-black/75 text-white text-[11px] font-mono-num" data-ui-number>
                  {dish.calories} kcal
                </div>
              </div>

              {/* Dish Information Area */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  {/* Title and Rating Line */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[16px] font-bold text-[#262626] group-hover:text-[#EA580C] transition-colors leading-snug">
                      {dish.name}
                    </h3>
                    {dish.rating && (
                      <span className="text-[12px] font-bold text-[#EA580C] shrink-0 font-mono-num">
                        {dish.rating.toFixed(1)} {dish.reviewsCount && `(${dish.reviewsCount} reviews)`}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="mt-2 text-[13px] text-[#727272] line-clamp-2 leading-relaxed" data-ui-pretty>
                    {dish.description}
                  </p>

                  {/* Tag Pills (High-Protein, Prep time) */}
                  <div className="mt-3.5 flex flex-wrap items-center gap-2">
                    {dish.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 rounded-md bg-[#f9f9f9] border border-[#e5e7eb] text-[11px] font-medium text-[#727272]"
                      >
                        {tag}
                      </span>
                    ))}
                    {dish.prepTime && (
                      <span className="px-2.5 py-0.5 rounded-md bg-orange-50 border border-orange-200 text-[11px] font-semibold text-[#EA580C]">
                        Prep: {dish.prepTime}
                      </span>
                    )}
                  </div>
                </div>

                {/* Price and Prominent Customize+ Orange Pill Button */}
                <div className="mt-5 pt-4 border-t border-[#e5e7eb] flex items-center justify-between">
                  <div className="font-mono-num font-bold text-[17px] text-[#262626]" data-ui-number>
                    {dish.basePrice.toFixed(2)}{' '}
                    <span className="text-[12px] font-sans font-normal text-[#727272]">EGP</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDish(dish);
                    }}
                    data-ui-radius="999"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#EA580C] hover:opacity-95 text-white text-[13px] font-bold shadow-xs active:scale-95 cursor-pointer transition-all"
                  >
                    <span>Customize +</span>
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
