export type ProgramModuleStatus = 'a-venir' | 'en-cours' | 'termine';
export type CircuitRegion = 'sud' | 'centre' | 'nord';
export type RealisationStatus = 'en-cours' | 'termine' | 'a-venir';
export type InscriptionStatus = 'nouveau' | 'en_revision' | 'accepte' | 'refuse';
export type ContactStatus = 'nouveau' | 'traite' | 'archive';

export interface Pilar {
  id: string;
  slug: string;
  title: string;
  description: string;
  image_url: string;
  display_order: number;
}

export interface ProgramWeek {
  id: string;
  week_number: number;
  title: string;
  description: string;
  highlights: string[];
  display_order: number;
}

export interface Circuit {
  id: string;
  slug: string;
  title: string;
  region: CircuitRegion;
  city: string;
  description: string;
  full_description?: string;
  duration: string;
  highlights: string[];
  cover_image: string;
  gallery?: string[];
  display_order: number;
}

export interface Realisation {
  id: string;
  slug: string;
  title: string;
  edition: string;
  description: string;
  full_description?: string;
  highlights: string[];
  participants_count: number;
  zones: string[];
  cover_image: string;
  status: RealisationStatus;
  date: string;
  gallery?: { url: string; caption?: string }[];
}

export interface Testimonial {
  id: string;
  author_name: string;
  author_role: string;
  content: string;
  edition?: string;
  photo_url?: string;
  is_published?: boolean;
}

export interface Partner {
  id: string;
  name: string;
  partner_type: string;
  description: string;
  logo_url?: string;
  website_url?: string;
}

export interface Stat {
  id: string;
  label: string;
  value: string;
  suffix: string;
}

export interface InscriptionPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  country: string;
  age?: number;
  motivation: string;
  consent_contact: boolean;
}

export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  country?: string;
  subject: string;
  message: string;
  newsletter_optin?: boolean;
}
