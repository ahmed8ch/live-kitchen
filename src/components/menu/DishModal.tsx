import React, { useState, useEffect } from 'react';
import { MenuItem, ModifierOption } from '../../types/domain';
import { useAppStore } from '../../store/useAppStore';

interface DishModalProps {
  dish: MenuItem | null;
  onClose: () => void;
  onAdd?: (dish: MenuItem, modifiers: ModifierOption[], quantity: number, notes?: string) => void;
}

export const DishModal: React.FC<DishModalProps> = ({ dish, onClose, onAdd }) => {
  const addToCart = useAppStore((state) => state.addToCart);

  const [quantity, setQuantity] = useState(1);
  const [selectedModifiers, setSelectedModifiers] = useState<ModifierOption[]>([]);
  const [notes, setNotes] = useState('');
  const [addedFeedback, setAddedFeedback] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!dish) return null;

  const toggleModifier = (mod: ModifierOption) => {
    setSelectedModifiers((prev) => {
      const exists = prev.some((m) => m.id === mod.id);
      if (exists) {
        return prev.filter((m) => m.id !== mod.id);
      } else {
        return [...prev, mod];
      }
    });
  };

  const modTotal = selectedModifiers.reduce((sum, m) => sum + m.price, 0);
  const itemTotal = (dish.basePrice + modTotal) * quantity;

  const handleAddToCart = () => {
    if (onAdd) {
      onAdd(dish, selectedModifiers, quantity, notes.trim() || undefined);
    } else {
      addToCart(dish, selectedModifiers, quantity, notes.trim() || undefined);
    }
    setAddedFeedback(true);
    setTimeout(() => {
      setAddedFeedback(false);
      onClose();
    }, 280);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dish-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        data-ui-radius="16"
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-[#e5e7eb]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header & Dish Image */}
        <div className="relative h-44 sm:h-52 w-full bg-[#f9f9f9] shrink-0 overflow-hidden">
          <img
            src={dish.imageUrl}
            alt={dish.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
            }}
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 min-w-[44px] min-h-[44px] rounded-full bg-white/95 hover:bg-white text-[#262626] flex items-center justify-center shadow-md transition-transform active:scale-90 cursor-pointer"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          {dish.badge && (
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#FF0055] text-white text-[11px] font-mono-num font-medium shadow-xs">
              {dish.badge}
            </div>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 overscroll-contain">
          <div>
            <div className="flex items-start justify-between gap-4">
              <h3 id="dish-modal-title" className="text-xl font-medium text-[#262626]" data-ui-balance>{dish.name}</h3>
              <div className="text-lg font-mono-num font-medium text-[#FF0055] shrink-0" data-ui-number>
                {dish.basePrice.toFixed(2)} EGP
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[12px] font-mono-num text-[#949494]" data-ui-number>{dish.calories} KCAL</span>
              <span className="text-[#e5e7eb]">/</span>
              <span className="text-[12px] text-[#727272] capitalize">{dish.category}</span>
              {dish.prepTime && (
                <>
                  <span className="text-[#e5e7eb]">/</span>
                  <span className="text-[12px] font-mono-num text-[#727272]">{dish.prepTime}</span>
                </>
              )}
            </div>
            <p className="mt-2.5 text-[14px] text-[#616161] leading-relaxed" data-ui-pretty>
              {dish.description}
            </p>
          </div>

          {/* Modifiers & Customizations */}
          {dish.modifiers && dish.modifiers.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] font-medium text-[#262626]">
                  Optional Customizations
                </span>
                <span className="text-[11px] font-mono-num text-[#949494]">
                  Select any additions
                </span>
              </div>

              <div className="space-y-2">
                {dish.modifiers.map((mod) => {
                  const isSelected = selectedModifiers.some((m) => m.id === mod.id);
                  return (
                    <label
                      key={mod.id}
                      className={`flex items-center justify-between p-3 min-h-[48px] rounded-xl border transition-all cursor-pointer select-none ${
                        isSelected
                          ? 'border-[#FF0055] bg-[#fff0f3] shadow-xs'
                          : 'border-[#e5e7eb] bg-white hover:bg-[#f9f9f9]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={isSelected}
                        onChange={() => toggleModifier(mod)}
                      />
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-[#FF0055] border-[#FF0055] text-white'
                              : 'border-[#d1d5db] bg-white'
                          }`}
                        >
                          {isSelected && (
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        <span className="text-[14px] text-[#262626] font-medium">
                          {mod.name}
                        </span>
                      </div>

                      <span className="font-mono-num text-[13px] text-[#FF0055]" data-ui-number>
                        +{mod.price.toFixed(2)} EGP
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Preparation Instructions Input */}
          <div>
            <label htmlFor="dish-notes" className="block text-[13px] font-medium text-[#262626] mb-1.5">
              Special Kitchen Notes
            </label>
            <input
              id="dish-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Extra pickles, sauce on the side, well-done"
              className="w-full px-3.5 py-2.5 min-h-[44px] text-[13px] rounded-lg border border-[#e5e7eb] bg-white text-[#262626] placeholder-[#949494] focus:outline-none focus:border-[#FF0055]"
            />
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-[#e5e7eb] bg-[#f9f9f9] flex items-center gap-3 shrink-0">
          {/* Quantity Controls (>= 44x44px touch targets) */}
          <div className="flex items-center border border-[#e5e7eb] bg-white rounded-full p-0.5 shadow-xs">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-[#262626] hover:bg-[#f0f0f0] active:bg-[#e5e7eb] transition-colors cursor-pointer text-lg font-bold"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="w-8 text-center font-mono-num font-bold text-[15px]" data-ui-number>
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-[#262626] hover:bg-[#f0f0f0] active:bg-[#e5e7eb] transition-colors cursor-pointer text-lg font-bold"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Add to Order Button */}
          <button
            onClick={handleAddToCart}
            data-ui-radius="999"
            className="flex-1 py-3 px-6 rounded-full bg-[#FF0055] hover:opacity-95 text-white text-[14px] font-medium transition-all btn-crimson-glow active:scale-[0.99] flex items-center justify-between cursor-pointer shadow-xs"
          >
            <span>{addedFeedback ? 'Added!' : 'Add to Table Order'}</span>
            <span className="font-mono-num" data-ui-number>{itemTotal.toFixed(2)} EGP</span>
          </button>
        </div>
      </div>
    </div>
  );
};
