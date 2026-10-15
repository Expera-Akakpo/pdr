import React from 'react';

interface PilarCardProps {
  title: string;
  description: string;
  imageUrl: string;
  orderNumber?: number;
}

export const PilarCard: React.FC<PilarCardProps> = ({
  title,
  description,
  imageUrl,
  orderNumber
}) => {
  return (
    <div className="bg-white rounded-lg p-6 sm:p-8 border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow duration-150 flex flex-col items-center text-center">
      {/* Image ronde cerclée d'or comme sur le flyer officiel */}
      <div className="relative mb-6">
        <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-[#E6B325] shadow-md p-1 bg-white">
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        {orderNumber && (
          <span className="absolute -bottom-2 bg-[#1B2A5E] text-[#E6B325] text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow">
            {orderNumber}
          </span>
        )}
      </div>

      <h3 className="text-xl font-bold text-[#1B2A5E] mb-3">
        {title}
      </h3>

      <p className="text-[#4A4A4A] text-sm sm:text-base leading-relaxed text-left sm:text-center">
        {description}
      </p>
    </div>
  );
};
