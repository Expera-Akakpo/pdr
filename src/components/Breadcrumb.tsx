import React from 'react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="bg-[#F7F7F5] border-b border-[#E5E7EB] py-3 px-4 sm:px-6 lg:px-8 text-xs text-[#4A4A4A]" aria-label="Fil d'Ariane">
      <div className="max-w-7xl mx-auto flex items-center space-x-2">
        <Link to="/" className="text-[#1B2A5E] hover:underline font-medium">
          Accueil
        </Link>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={index}>
              <span className="text-gray-400">/</span>
              {isLast || !item.path ? (
                <span className="text-[#1A1A1A] font-semibold" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link to={item.path} className="text-[#1B2A5E] hover:underline">
                  {item.label}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};
