import React, { useState } from 'react';
import { MenuItem, ModifierOption } from '../../types/domain';
import { useAppStore } from '../../store/useAppStore';

interface DishModalProps {
  dish: MenuItem | null;
  onClose: () => void;
}

export const DishModal: React.FC<DishModalProps> = ({ dish, onClose }) => {
  const addToCart = useAppStore((state) => state.addToCart);

  const [quantity, setQuantity] = useState(1);
  const [selectedModifiers, setSelectedModifiers] = useState<ModifierOption[]>([]);
  const [notes, setNotes] = useState('');
  const [addedFeedback, setAddedFeedback] = useState(false);

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
    addToCart(dish, selectedModifiers, quantity, notes.trim() || undefined);
    setAddedFeedback(true);
    setTimeout(() => {
      setAddedFeedback(false);
      onClose();
    }, 280);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
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
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-[#262626] flex items-center justify-center shadow-md transition-transform active:scale-90 cursor-pointer"
            aria-label="Close modal"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          {dish.badge && (
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#ff4d00] text-white text-[11px] font-mono-num font-medium shadow-xs">
              {dish.badge}
            </div>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 overscroll-contain">
          <div>
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-xl font-medium text-[#262626]" data-ui-balance>{dish.name}</h3>
              <div className="text-lg font-mono-num font-medium text-[#ff4d00] shrink-0" data-ui-number>
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
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => toggleModifier(mod)}
                      data-ui-radius="8"
                      className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#ff4d00] bg-[#fff8f5] shadow-xs'
                          : 'border-[#e5e7eb] bg-white hover:bg-[#f9f9f9]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-[#ff4d00] border-[#ff4d00] text-white'
                              : 'border-[#c7c7c7] bg-white'
                          }`}
                        >
                          {isSelected && (
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        <span className="text-[13px] font-medium text-[#262626]">{mod.name}</span>
                      </div>
                      <span className="font-mono-num text-[13px] text-[#ff4d00]" data-ui-number>
                        +{mod.price.toFixed(2)} EGP
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Kitchen Special Instructions */}
          <div>
            <label htmlFor="dish-notes" className="block text-[13px] font-medium text-[#262626] mb-1.5">
              Kitchen Special Instructions
            </label>
            <textarea
              id="dish-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Extra hot honey glaze, sauce on the side, well-done"
              rows={2}
              data-ui-radius="8"
              className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#e5e7eb] bg-white text-[#262626] placeholder-[#949494] focus:outline-none focus:border-[#ff4d00]"
            />
          </div>
        </div>

        {/* Modal Sticky Footer Action Bar */}
        <div className="p-4 sm:p-5 border-t border-[#e5e7eb] bg-[#f9f9f9] flex items-center justify-between gap-4 shrink-0">
          {/* Quantity Stepper */}
          <div className="flex items-center border border-[#e5e7eb] rounded-full bg-white shadow-xs p-1">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#262626] disabled:opacity-30 hover:bg-[#f0f0f0] transition-colors cursor-pointer"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="w-8 text-center font-mono-num font-medium text-[14px]" data-ui-number>
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#262626] hover:bg-[#f0f0f0] transition-colors cursor-pointer"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Add to Order CTA */}
          <button
            onClick={handleAddToCart}
            data-ui-radius="999"
            className="flex-1 py-3 px-6 rounded-full bg-[#ff4d00] hover:opacity-95 text-white text-[14px] font-medium transition-all btn-ember-glow active:scale-[0.99] flex items-center justify-between cursor-pointer shadow-xs"
          >
            <span>{addedFeedback ? 'Added to Order!' : 'Add to Order'}</span>
            <span className="font-mono-num font-medium text-[14px]" data-ui-number>
              {itemTotal.toFixed(2)} EGP
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
