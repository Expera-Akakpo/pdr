import React from 'react';
import { Testimonial } from '../types';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
  return (
    <div className="bg-[#131F45] border border-[#E6B325]/20 rounded-xl p-6 sm:p-8 flex flex-col justify-between shadow-sm relative">
      <div>
        {/* Guillemet stylisé en jaune/or */}
        <div className="text-[#E6B325] text-4xl sm:text-5xl font-serif leading-none select-none mb-3">
          “
        </div>
        <p className="text-gray-200 text-sm sm:text-base leading-relaxed italic">
          {testimonial.content}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-white/10">
        <h4 className="text-white text-xs sm:text-sm font-semibold tracking-wide">
          {testimonial.author_name}
        </h4>
        <p className="text-xs text-[#E6B325] mt-0.5">
          {testimonial.author_role} {testimonial.edition && `• ${testimonial.edition}`}
        </p>
      </div>
    </div>
  );
};
