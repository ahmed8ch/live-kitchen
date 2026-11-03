import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MENU_ITEMS } from '../domain/menuData';
import { MenuCategory, MenuItem } from '../types/domain';
import { DishModal } from '../components/menu/DishModal';
import { DishCard } from '../components/menu/DishCard';
import { FloatingCartBar } from '../components/cart/FloatingCartBar';
import { CartDrawer } from '../components/cart/CartDrawer';
import { TableLobbyBar } from '../components/multiplayer/TableLobbyBar';
import { useAppStore, flushPendingHostToasts } from '../store/useAppStore';

const CATEGORIES: { id: 'all' | MenuCategory; label: string }[] = [
  { id: 'all', label: 'All Dishes' },
  { id: 'burgers', label: 'Flame Burgers' },
  { id: 'steaks', label: 'Prime Steaks' },
  { id: 'pizzas', label: 'Artisan Pizzas' },
  { id: 'pastas', label: 'Pastas & Sides' },
  { id: 'drinks', label: 'Drinks & Desserts' },
];

const DIETARY_TAGS = ['all', 'Halal', 'Gluten-Free', 'High-Protein', 'Vegetarian', 'Wood-Fired'] as const;
type DietaryTag = (typeof DIETARY_TAGS)[number];

export const MenuPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tableParam = searchParams.get('table');

  const [activeCategory, setActiveCategory] = useState<'all' | MenuCategory>('all');
  const [selectedTag, setSelectedTag] = useState<DietaryTag>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);

  const activeTable = useAppStore((state) => state.activeTable);
  const userAccount = useAppStore((state) => state.userAccount);
  const openAccountModal = useAppStore((state) => state.openAccountModal);

  useEffect(() => {
    flushPendingHostToasts();
    useAppStore.getState().ensureHostSession(tableParam || undefined);
  }, [tableParam]);

  const filteredDishes = MENU_ITEMS.filter((item) => {
    // Category match
    if (activeCategory !== 'all' && item.category !== activeCategory) {
      return false;
    }
    // Dietary tag match
    if (selectedTag !== 'all') {
      const hasTag = item.tags?.includes(selectedTag);
      if (!hasTag) return false;
    }
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const inName = item.name.toLowerCase().includes(q);
      const inDesc = item.description.toLowerCase().includes(q);
      const inBadge = item.badge?.toLowerCase().includes(q);
      const inTags = item.tags?.some((t) => t.toLowerCase().includes(q));
      if (!inName && !inDesc && !inBadge && !inTags) return false;
    }
    return true;
  });

  return (
    <div className="flex-1 w-full bg-white pb-52" data-ui-container="menu-view">
      {/* Sticky Table Lobby Bar (PIN, Table Diners) */}
      <TableLobbyBar />

      {/* Clean, Functional Menu Header (De-slopped, 0 redundant banners) */}
      <section className="bg-white border-b border-[#e5e7eb] pt-6 pb-5 sm:pt-8 sm:pb-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#262626] tracking-tight">
                Menu
              </h1>
              <p className="mt-1 text-sm text-[#727272]">
                Cooked fresh over wood flame coals upon payment confirmation. Touch any dish to customize.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Dine-In Account / Loyalty Pill */}
              <button
                type="button"
                onClick={() => openAccountModal()}
                className="px-3.5 py-2 min-h-[44px] rounded-2xl border border-[#e5e7eb] bg-[#f9f9f9] hover:bg-[#f0f0f0] transition-colors flex items-center gap-2.5 text-left shrink-0 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-[#FF0055]/10 flex items-center justify-center text-[#FF0055] shrink-0 font-bold text-xs">
                  {userAccount ? userAccount.fullName.charAt(0).toUpperCase() : 'G'}
                </div>
                <div>
                  <div className="text-xs font-medium text-[#727272]">
                    {userAccount ? 'Diner Profile' : 'Guest / Sign In'}
                  </div>
                  <div className="text-xs font-bold text-[#262626] flex items-center gap-1">
                    <span>{userAccount ? userAccount.fullName : '10% Cashback'}</span>
                    {userAccount && (
                      <span className="text-[#FF0055] text-xs font-medium">
                        (<span className="font-mono-num">{userAccount.loyaltyPointsEgp.toFixed(0)}</span> EGP)
                      </span>
                    )}
                  </div>
                </div>
              </button>

              {activeTable && (
                <div className="sm:text-right bg-[#f9f9f9] px-4 py-2 rounded-2xl border border-[#e5e7eb] shrink-0">
                  <div className="text-xs font-medium text-[#727272]">
                    Table Seating
                  </div>
                  <div className="text-base font-bold text-[#FF0055]">
                    Table <span className="font-mono-num">{activeTable}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="mb-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#949494]">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes by name, ingredient, or cut..."
              className="w-full pl-10 pr-12 min-h-[44px] h-11 rounded-lg border border-[#e5e7eb] bg-[#f9f9f9] text-[13px] text-[#262626] placeholder-[#949494] focus:outline-none focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055]/15 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#949494] hover:text-[#262626] cursor-pointer"
                aria-label="Clear search"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          {/* Category Filter Pills (2px solid #FF0055 selected state) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" data-ui-actions="category-filters">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                data-ui-radius="999"
                className={`px-4 py-2 min-h-[44px] rounded-full text-sm font-medium transition-all shrink-0 cursor-pointer flex items-center justify-center active:scale-95 ${
                  activeCategory === cat.id
                    ? 'bg-[#fff0f3] text-[#FF0055] shadow-xs border-2 border-[#FF0055] font-bold'
                    : 'bg-white hover:bg-[#f0f0f0] text-[#727272] border border-[#e5e7eb]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Dietary Tag Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-0.5 scrollbar-none" data-ui-actions="dietary-filters">
            <span className="text-xs font-medium text-[#949494] mr-1 shrink-0">
              Filter:
            </span>
            {DIETARY_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`min-h-[44px] min-w-[44px] justify-center px-3.5 py-2 rounded-full text-xs transition-all shrink-0 cursor-pointer flex items-center gap-1 active:scale-95 ${
                  selectedTag === tag
                    ? 'bg-[#262626] text-white font-bold'
                    : 'bg-[#f9f9f9] text-[#727272] hover:bg-[#f0f0f0] border border-[#e5e7eb]'
                }`}
              >
                <span>{tag === 'all' ? 'All Tags' : tag}</span>
                {userAccount?.dietaryTags?.includes(tag) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF0055]" title="Matches your profile" />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Dish Grid Section (3-column, tactile cards) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#262626]">
            {CATEGORIES.find((c) => c.id === activeCategory)?.label}
          </h2>
          <span className="text-xs text-[#949494]">
            <span className="font-mono-num">{filteredDishes.length}</span> dishes
          </span>
        </div>

        {filteredDishes.length === 0 ? (
          <div className="py-16 text-center bg-[#f9f9f9] rounded-2xl border border-[#e5e7eb] p-8 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-white border border-[#e5e7eb] flex items-center justify-center mx-auto text-[#727272] mb-3 shadow-xs">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h3 className="text-[16px] font-bold text-[#262626]">No matching dishes found</h3>
            <p className="mt-1 text-[13px] text-[#727272]">
              Try searching with another keyword or clearing your dietary tag filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedTag('all');
                setActiveCategory('all');
              }}
              className="mt-4 min-h-[44px] px-5 py-2.5 rounded-full bg-[#262626] text-white text-[12px] font-bold hover:bg-black transition-colors cursor-pointer active:scale-95 shadow-xs inline-flex items-center justify-center"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {filteredDishes.map((dish) => (
              <DishCard
                key={dish.id}
                dish={dish}
                onClick={() => setSelectedDish(dish)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Floating Cart Pill at Bottom Center */}
      <FloatingCartBar />

      {/* Slide-In Cart Drawer */}
      <CartDrawer />

      {/* Dish Customizer Modal */}
      <DishModal dish={selectedDish} onClose={() => setSelectedDish(null)} />
    </div>
  );
};
