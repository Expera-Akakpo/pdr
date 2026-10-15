import React from 'react';
import { RealisationStatus, CircuitRegion } from '../types';

interface StatusBadgeProps {
  status: RealisationStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  let bg = '#E8F0F8';
  let text = '#2E6DA4';
  let label = 'En cours';

  if (status === 'termine') {
    bg = '#E7F3EC';
    text = '#2E7D5B';
    label = 'Terminé';
  } else if (status === 'a-venir') {
    bg = '#FBF0E2';
    text = '#C97A2B';
    label = 'À venir';
  }

  return (
    <span
      className={`inline-block text-[11px] font-semibold uppercase tracking-[0.05em] px-2.5 py-1 rounded-[4px] leading-none ${className}`}
      style={{ backgroundColor: bg, color: text }}
    >
      {label}
    </span>
  );
};

interface RegionBadgeProps {
  region: CircuitRegion;
  className?: string;
}

export const RegionBadge: React.FC<RegionBadgeProps> = ({ region, className = '' }) => {
  let bg = '#1B2A5E';
  let text = '#FFFFFF';
  let label = 'Région Sud';

  if (region === 'centre') {
    bg = '#E6B325';
    text = '#1B2A5E';
    label = 'Région Centre';
  } else if (region === 'nord') {
    bg = '#F2E3C6';
    text = '#1B2A5E';
    label = 'Région Nord';
  }

  return (
    <span
      className={`inline-block text-[11px] font-semibold uppercase tracking-[0.05em] px-2.5 py-1 rounded-[4px] leading-none ${className}`}
      style={{ backgroundColor: bg, color: text }}
    >
      {label}
    </span>
  );
};
