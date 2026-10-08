import { ClothingItem } from '../types';

/**
 * Initial clothing items inventory.
 * Clean slate for Yaazh Boutique. Real items are managed via Store Manager or loaded from Firestore.
 */
export const INITIAL_CLOTHING_ITEMS: ClothingItem[] = [];

export const STORE_CENTRE_INFO = {
  name: 'Yaazh Boutique',
  tagline: 'Elegance · Tradition · Style',
  address: 'MR Complex, Kallimandayam, Oddanchatram, Dindigul, Tamil Nadu 624616, India',
  hours: '',
  phone: '+91 95978 33982',
  phone2: '+91 90478 54136',
  instagram: 'yaazh_botique',
  facebook: 'yaazhbotique',
};

export const COUPONS: Record<string, { percent: number; minOrder: number; description: string }> = {};
