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
    }, 350);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/55 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        data-ui-radius="16"
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] border border-[#e5e7eb]"
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
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          {dish.badge && (
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#EA580C] text-white text-[11px] font-bold shadow-xs">
              {dish.badge}
            </div>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 overscroll-contain">
          <div>
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-xl font-bold text-[#262626]" data-ui-balance>{dish.name}</h3>
              <div className="text-lg font-bold font-mono-num text-[#EA580C] shrink-0" data-ui-number>
                {dish.basePrice.toFixed(2)} EGP
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[12px] font-mono-num text-[#727272]" data-ui-number>{dish.calories} kcal</span>
              <span className="text-[#d1d5db]">/</span>
              <span className="text-[12px] text-[#727272] capitalize">{dish.category}</span>
            </div>
            <p className="mt-2.5 text-[14px] text-[#727272] leading-relaxed" data-ui-pretty>
              {dish.description}
            </p>
          </div>

          {/* Customize & Add-ons */}
          {dish.modifiers && dish.modifiers.length > 0 && (
            <div className="pt-4 border-t border-[#e5e7eb]">
              <div className="text-[13px] font-bold text-[#262626] uppercase tracking-wider mb-3">
                Customize & Add-ons
              </div>
              <div className="space-y-2.5 pb-2">
                {dish.modifiers.map((mod) => {
                  const isChecked = selectedModifiers.some((m) => m.id === mod.id);
                  return (
                    <label
                      key={mod.id}
                      onClick={() => toggleModifier(mod)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'border-[#EA580C] bg-orange-50/50 shadow-xs'
                          : 'border-[#e5e7eb] bg-[#f9f9f9] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                            isChecked
                              ? 'bg-[#EA580C] border-[#EA580C] text-white'
                              : 'border-[#d1d5db] bg-white'
                          }`}
                        >
                          {isChecked && (
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        <span className="text-[13px] font-medium text-[#262626]">{mod.name}</span>
                      </div>
                      <span className="text-[13px] font-mono-num font-semibold text-[#727272]" data-ui-number>
                        +{mod.price.toFixed(2)} EGP
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Kitchen / Allergy Notes */}
          <div className="pt-4 border-t border-[#e5e7eb]">
            <label htmlFor="dish-notes" className="block text-[13px] font-bold text-[#262626] uppercase tracking-wider mb-2">
              Kitchen Instructions / Allergies
            </label>
            <input
              id="dish-notes"
              type="text"
              placeholder="e.g. Extra sauce on side, no onions"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#e5e7eb] text-[13px] text-[#262626] placeholder-[#9ca3af] focus:outline-none focus:border-[#EA580C] transition-colors"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-[#f9f9f9] border-t border-[#e5e7eb] flex items-center justify-between gap-4 shrink-0">
          {/* Quantity Stepper */}
          <div className="inline-flex items-center border border-[#e5e7eb] bg-white rounded-full p-1 shadow-xs">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#262626] hover:bg-[#f0f0f0] disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="w-8 text-center font-mono-num font-bold text-[14px] text-[#262626]" data-ui-number>
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#262626] hover:bg-[#f0f0f0] transition-colors cursor-pointer"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Add to Order Button */}
          <button
            onClick={handleAddToCart}
            data-ui-radius="999"
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#EA580C] hover:opacity-95 text-white text-[14px] font-semibold transition-all shadow-sm btn-flame-glow active:scale-95 cursor-pointer"
          >
            {addedFeedback ? (
              <span>Added to Order!</span>
            ) : (
              <>
                <span>Add to Order</span>
                <span className="opacity-80">/</span>
                <span className="font-mono-num font-bold" data-ui-number>{itemTotal.toFixed(2)} EGP</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
