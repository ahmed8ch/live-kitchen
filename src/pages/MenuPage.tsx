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
import { useTranslation } from '../i18n';

const DIETARY_TAGS = ['all', 'Halal', 'Gluten-Free', 'High-Protein', 'Vegetarian', 'Wood-Fired'] as const;
type DietaryTag = (typeof DIETARY_TAGS)[number];

export const MenuPage: React.FC = () => {
  const { t, localizeDish, localizeTag } = useTranslation();
  const [searchParams] = useSearchParams();
  const tableParam = searchParams.get('table');

  const [activeCategory, setActiveCategory] = useState<'all' | MenuCategory>('all');
  const [selectedTag, setSelectedTag] = useState<DietaryTag>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);

  const activeTable = useAppStore((state) => state.activeTable);
  const userAccount = useAppStore((state) => state.userAccount);
  const openAccountModal = useAppStore((state) => state.openAccountModal);

  const categories: { id: 'all' | MenuCategory; label: string }[] = [
    { id: 'all', label: t('menu.categories.all') },
    { id: 'burgers', label: t('menu.categories.burgers') },
    { id: 'steaks', label: t('menu.categories.steaks') },
    { id: 'pizzas', label: t('menu.categories.pizzas') },
    { id: 'pastas', label: t('menu.categories.pastas') },
    { id: 'drinks', label: t('menu.categories.drinks') },
  ];

  useEffect(() => {
    flushPendingHostToasts();
    if (tableParam) {
      useAppStore.getState().ensureHostSession(tableParam);
    }
  }, [tableParam]);

  const filteredDishes = MENU_ITEMS.filter((item) => {
    if (activeCategory !== 'all' && item.category !== activeCategory) {
      return false;
    }
    if (selectedTag !== 'all') {
      const hasTag = item.tags?.includes(selectedTag);
      if (!hasTag) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const localDish = localizeDish(item);
      const inName = item.name.toLowerCase().includes(q) || localDish.name.toLowerCase().includes(q);
      const inDesc = item.description.toLowerCase().includes(q) || localDish.description.toLowerCase().includes(q);
      const inBadge =
        item.badge?.toLowerCase().includes(q) || localDish.badge?.toLowerCase().includes(q);
      const inTags = item.tags?.some(
        (tag) => tag.toLowerCase().includes(q) || localizeTag(tag).toLowerCase().includes(q)
      );
      if (!inName && !inDesc && !inBadge && !inTags) return false;
    }
    return true;
  });

  return (
    <div className="flex-1 w-full bg-white pb-40" data-ui-container="menu-view">
      {/* Contextual Table Session Strip */}
      <TableLobbyBar />

      {/* Compact Full-Viewport Menu Header & Filter Controls */}
      <section className="bg-white border-b border-[#e5e7eb] py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#262626] tracking-tight">
                {t('menu.title')}
              </h1>
              {activeTable && (
                <span className="px-3 py-1 rounded-full bg-[#fff0f3] border border-[#ffd1dc] text-xs font-mono-num font-bold text-[#FF0055]">
                  {t('common.table')} {activeTable}
                </span>
              )}
              <span className="text-xs text-[#727272] hidden sm:inline">
                <span className="font-mono-num font-bold text-[#262626]">{filteredDishes.length}</span> {t('common.dishes')}
              </span>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Search Input Bar */}
              <div className="relative flex-1 md:w-80">
                <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-[#727272]">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('menu.searchPlaceholder')}
                  className="w-full ps-10 pe-10 min-h-[44px] h-11 rounded-lg border border-[#e5e7eb] bg-[#f9f9f9] text-[13px] text-[#262626] placeholder-[#727272] focus:outline-none focus:border-[#FF0055] transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 end-0 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#727272] hover:text-[#262626] cursor-pointer"
                    aria-label={t('menu.clearSearch')}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>

              {userAccount && (
                <button
                  type="button"
                  onClick={() => openAccountModal()}
                  className="px-3.5 py-2 min-h-[44px] rounded-2xl border border-[#e5e7eb] bg-[#f9f9f9] hover:bg-[#f0f0f0] transition-colors flex items-center gap-2 text-start shrink-0 cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-[#FF0055]/10 flex items-center justify-center text-[#FF0055] shrink-0 font-bold text-xs">
                    {userAccount.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-[#262626] hidden sm:inline">
                    {userAccount.fullName}
                  </span>
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none" data-ui-actions="category-filters">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  data-ui-radius="999"
                  className={`px-4 py-2 min-h-[44px] rounded-full text-xs sm:text-sm font-medium transition-colors shrink-0 cursor-pointer flex items-center justify-center active:scale-95 ${
                    activeCategory === cat.id
                      ? 'bg-[#fff0f3] text-[#FF0055] border-2 border-[#FF0055] font-bold'
                      : 'bg-white hover:bg-[#f0f0f0] text-[#727272] border border-[#e5e7eb]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Dietary Tag Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none" data-ui-actions="dietary-filters">
              <span className="text-xs font-medium text-[#727272] me-1 shrink-0">
                {t('menu.filterLabel')}
              </span>
              {DIETARY_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`min-h-[44px] min-w-[44px] justify-center px-3 py-2 rounded-full text-xs transition-colors shrink-0 cursor-pointer flex items-center gap-1 active:scale-95 ${
                    selectedTag === tag
                      ? 'bg-[#262626] text-white font-bold'
                      : 'bg-[#f9f9f9] text-[#727272] hover:bg-[#f0f0f0] border border-[#e5e7eb]'
                  }`}
                >
                  <span>{tag === 'all' ? t('menu.tags.all') : localizeTag(tag)}</span>
                  {userAccount?.dietaryTags?.includes(tag) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF0055]" title={t('menu.matchesProfile')} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Full-Width 4-Column Dish Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {filteredDishes.length === 0 ? (
          <div className="py-14 text-center bg-[#f9f9f9] rounded-2xl border border-[#e5e7eb] p-8 max-w-md mx-auto">
            <h3 className="text-base font-bold text-[#262626]">{t('menu.noMatchingTitle')}</h3>
            <p className="mt-1 text-xs text-[#727272]">
              {t('menu.noMatchingDesc')}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedTag('all');
                setActiveCategory('all');
              }}
              className="mt-4 min-h-[44px] px-5 py-2.5 rounded-full bg-[#262626] text-white text-xs font-bold hover:bg-black transition-colors cursor-pointer active:scale-95 inline-flex items-center justify-center"
            >
              {t('menu.resetAllFilters')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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

      <FloatingCartBar />
      <CartDrawer />
      <DishModal dish={selectedDish} onClose={() => setSelectedDish(null)} />
    </div>
  );
};
