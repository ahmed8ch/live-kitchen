import React from 'react';
import { MenuItem } from '../../types/domain';

interface DishCardProps {
  dish: MenuItem;
  onClick: () => void;
}

export const DishCard: React.FC<DishCardProps> = ({ dish, onClick }) => {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      data-ui-radius="16"
      className="group bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden shadow-xs hover:border-[#FF0055] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0055] transition-all cursor-pointer flex flex-col active:scale-[0.99] select-none"
    >
      {/* Dish Image with Badges */}
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
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#FF0055] text-white text-xs font-semibold shadow-xs">
            {dish.badge}
          </div>
        )}
        {dish.rating && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/95 text-[#262626] text-xs font-medium shadow-xs flex items-center gap-1">
            <svg className="w-3.5 h-3.5 fill-[#FBBF24] text-[#FBBF24]" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-bold font-mono-num">{dish.rating}</span>
          </div>
        )}
      </div>

      {/* Dish Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-[#262626] group-hover:text-[#FF0055] transition-colors leading-snug">
            {dish.name}
          </h3>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-[#949494]">
              <span className="font-mono-num">{dish.calories}</span> KCAL
            </span>
            {dish.prepTime && (
              <>
                <span className="text-[#e5e7eb]">/</span>
                <span className="text-xs text-[#727272]">
                  {dish.prepTime}
                </span>
              </>
            )}
          </div>

          <p className="mt-2 text-sm text-[#616161] line-clamp-2 leading-relaxed">
            {dish.description}
          </p>
        </div>

        {/* Bottom Price & Customize Button */}
        <div className="mt-5 pt-3.5 border-t border-[#f0f0f0] flex items-center justify-between">
          <div className="text-base font-mono-num font-bold text-[#262626]">
            {dish.basePrice.toFixed(2)} EGP
          </div>

          <span
            data-ui-radius="999"
            className="min-h-[44px] px-4 py-2 rounded-full bg-[#f9f9f9] group-hover:bg-[#FF0055] text-[#262626] group-hover:text-white text-xs font-semibold transition-all border border-[#e5e7eb] group-hover:border-[#FF0055] inline-flex items-center justify-center shadow-xs"
          >
            Customize +
          </span>
        </div>
      </div>
    </div>
  );
};
