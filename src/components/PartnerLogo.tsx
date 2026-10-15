import React from 'react';
import { Partner } from '../types';

interface PartnerLogoProps {
  partner: Partner;
}

export const PartnerLogo: React.FC<PartnerLogoProps> = ({ partner }) => {
  return (
    <div className="bg-[#F7F7F5] border border-[#E5E7EB] rounded-lg p-5 flex flex-col items-center justify-center text-center transition-all duration-150 hover:border-[#E6B325] hover:bg-white min-h-[100px]">
      <div className="font-bold text-[#1B2A5E] text-base sm:text-lg tracking-tight">
        {partner.name}
      </div>
      <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mt-1">
        {partner.partner_type}
      </span>
      {partner.description && (
        <span className="text-xs text-gray-600 mt-1 line-clamp-1">
          {partner.description}
        </span>
      )}
    </div>
  );
};
