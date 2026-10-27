import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { MENU_ITEMS } from '../domain/menuData';
import { MenuCategory, MenuItem, ModifierOption } from '../types/domain';
import { FlameLinkLogo } from '../components/ui/FlameLinkLogo';
import { CartDrawer } from '../components/cart/CartDrawer';
import { FloatingCartBar } from '../components/cart/FloatingCartBar';

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

  const companionMember = useAppStore((state) => state.companionMember);
  const initCompanionSession = useAppStore((state) => state.initCompanionSession);
  const addToCartAsCompanion = useAppStore((state) => state.addToCartAsCompanion);
  const toggleCompanionReady = useAppStore((state) => state.toggleCompanionReady);
  const tableSessions = useAppStore((state) => state.tableSessions);
  const cart = useAppStore((state) => state.cart);
  const openCartDrawer = useAppStore((state) => state.openCartDrawer);

  const [selectedCategory, setSelectedCategory] = useState<'all' | MenuCategory>('all');
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<ModifierOption[]>([]);
  const [dishNotes, setDishNotes] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  // Initialize companion guest persona on mount
  useEffect(() => {
    initCompanionSession(tableParam);
  }, [tableParam, initCompanionSession]);

  const cleanTable = tableParam.trim().toUpperCase();
  const session = tableSessions[cleanTable];
  const hostMember = session?.members.find((m) => m.isHost);
  const companionCartCount = cart.filter((i) => i.addedBy?.memberId === companionMember?.id).length;
  const totalCartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const filteredDishes =
    selectedCategory === 'all'
      ? MENU_ITEMS
      : MENU_ITEMS.filter((item) => item.category === selectedCategory);

  const handleOpenDish = (dish: MenuItem) => {
    setSelectedDish(dish);
    setSelectedModifiers([]);
    setDishNotes('');
    setQuantity(1);
  };

  const handleToggleModifier = (mod: ModifierOption) => {
    if (selectedModifiers.some((m) => m.id === mod.id)) {
      setSelectedModifiers(selectedModifiers.filter((m) => m.id !== mod.id));
    } else {
      setSelectedModifiers([...selectedModifiers, mod]);
    }
  };

  const handleAddDishToCart = () => {
    if (!selectedDish) return;
    addToCartAsCompanion(selectedDish, selectedModifiers, quantity, dishNotes);
    setSelectedDish(null);
  };

  return (
    <div className="min-h-screen bg-white text-[#262626] pb-32 select-none">
      {/* Top Banner: Companion Seated Context */}
      <header className="sticky top-0 z-30 bg-[#f9f9f9] border-b border-[#e5e7eb] px-4 py-3 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="inline-flex items-center">
              <FlameLinkLogo size="sm" />
            </Link>
            <span className="h-4 w-px bg-[#e5e7eb]" />
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#15803d]" />
              <span className="text-[13px] font-bold text-[#262626]">
                Table {cleanTable}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#fff0f3] border border-[#ffd1dc] text-[#FF0055] text-[11px] font-mono-num font-bold">
                Guest POV
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {companionMember && (
              <button
                onClick={() => toggleCompanionReady(cleanTable)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all cursor-pointer shadow-xs ${
                  companionMember.isReadyToPay
                    ? 'bg-[#15803d] text-white hover:bg-[#166534]'
                    : 'bg-white text-[#262626] border border-[#e5e7eb] hover:border-[#FF0055]'
                }`}
              >
                {companionMember.isReadyToPay ? 'Marked Ready' : 'Mark Ready to Pay'}
              </button>
            )}

            <button
              onClick={() => openCartDrawer()}
              className="px-3.5 py-1.5 rounded-full bg-[#FF0055] text-white text-[12px] font-bold flex items-center gap-1.5 shadow-xs cursor-pointer btn-crimson-glow"
            >
              <span>Shared Cart</span>
              <span className="w-5 h-5 rounded-full bg-white text-[#FF0055] flex items-center justify-center text-[10px] font-mono-num font-bold">
                {totalCartCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Seated Table Roster Bar */}
      <section className="bg-white border-b border-[#e5e7eb] px-4 py-2.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-[12px]">
          <div className="flex items-center gap-2">
            <span className="text-[#727272]">Logged in as:</span>
            <span className="font-bold text-[#FF0055] bg-[#fff0f3] px-2.5 py-0.5 rounded-full border border-[#ffd1dc]">
              {companionMember?.name || 'Guest Diner'}
            </span>
            {hostMember && (
              <span className="text-[#727272] hidden sm:inline">
                • Seated with Host: <span className="font-medium text-[#262626]">{hostMember.name}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[#727272] font-mono-num text-[11px]">
            <span>Your items in table cart: </span>
            <span className="font-bold text-[#262626]">{companionCartCount}</span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#262626]">
            Companion Menu Order
          </h1>
          <p className="text-[13px] text-[#727272] mt-0.5">
            Add dishes directly to the shared table order. Your items are attributed specifically to you for individual split billing.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'border-2 border-[#FF0055] bg-[#fff0f3] text-[#FF0055] font-bold'
                  : 'border border-[#e5e7eb] bg-[#f9f9f9] text-[#727272] hover:bg-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDishes.map((dish) => (
            <div
              key={dish.id}
              onClick={() => handleOpenDish(dish)}
              className="p-4 rounded-2xl border border-[#e5e7eb] bg-white hover:border-[#ffd1dc] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-[15px] font-bold text-[#262626] group-hover:text-[#FF0055] transition-colors">
                    {dish.name}
                  </h3>
                  <span className="font-mono-num font-bold text-[#FF0055] text-[15px] shrink-0">
                    {dish.basePrice.toFixed(2)} EGP
                  </span>
                </div>
                <p className="text-[12px] text-[#727272] line-clamp-2 mt-1">
                  {dish.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#f0f0f0]">
                <span className="text-[11px] font-mono-num text-[#949494]">
                  {dish.prepTime || '10 min'}
                </span>
                <span className="px-3 py-1 rounded-full bg-[#f9f9f9] text-[#262626] text-[11px] font-bold border border-[#e5e7eb] group-hover:border-[#FF0055] group-hover:text-[#FF0055] transition-all">
                  + Add to Table
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Dish Customization Modal */}
      {selectedDish && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setSelectedDish(null)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#e5e7eb] p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-3 border-b border-[#e5e7eb]">
              <div>
                <h2 className="text-xl font-bold text-[#262626]">
                  {selectedDish.name}
                </h2>
                <span className="font-mono-num font-bold text-[#FF0055] text-[16px]">
                  {selectedDish.basePrice.toFixed(2)} EGP
                </span>
              </div>
              <button
                onClick={() => setSelectedDish(null)}
                className="w-8 h-8 rounded-full bg-[#f9f9f9] hover:bg-[#e5e7eb] flex items-center justify-center text-[#727272] cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modifiers List */}
            {selectedDish.modifiers && selectedDish.modifiers.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[13px] font-bold text-[#262626]">Kitchen Modifiers:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedDish.modifiers.map((opt) => {
                    const isSelected = selectedModifiers.some((m) => m.id === opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleToggleModifier(opt)}
                        className={`p-2 rounded-lg border text-left text-[12px] flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#FF0055] bg-[#fff0f3] text-[#FF0055] font-bold'
                            : 'border-[#e5e7eb] bg-[#f9f9f9] text-[#262626]'
                        }`}
                      >
                        <span className="truncate mr-1">{opt.name}</span>
                        <span className="font-mono-num text-[11px] shrink-0">
                          +{opt.price.toFixed(2)} EGP
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Special Instructions */}
            <div>
              <label htmlFor="comp-dish-notes" className="block text-[12px] font-semibold text-[#262626] mb-1">
                Kitchen Notes:
              </label>
              <textarea
                id="comp-dish-notes"
                value={dishNotes}
                onChange={(e) => setDishNotes(e.target.value)}
                placeholder="e.g. Dressing on side, extra crispy fries..."
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-[#e5e7eb] text-[13px] text-[#262626] focus:outline-none focus:border-[#FF0055]"
              />
            </div>

            {/* Quantity and Add CTA */}
            <div className="flex items-center gap-3 pt-3 border-t border-[#e5e7eb]">
              <div className="flex items-center border border-[#e5e7eb] rounded-full bg-[#f9f9f9] p-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-[#262626] hover:bg-[#e5e7eb] cursor-pointer"
                >
                  -
                </button>
                <span className="w-10 text-center font-mono-num font-bold text-[14px]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-[#262626] hover:bg-[#e5e7eb] cursor-pointer"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddDishToCart}
                className="flex-1 py-3 rounded-full bg-[#FF0055] hover:opacity-95 text-white font-bold text-[13px] btn-crimson-glow transition-all cursor-pointer shadow-xs"
              >
                Add to Table Cart (as {companionMember?.name || 'Guest'})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Cart Bar & Drawer */}
      <FloatingCartBar />
      <CartDrawer />
    </div>
  );
};