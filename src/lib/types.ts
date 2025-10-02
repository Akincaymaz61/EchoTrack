import type { LucideIcon } from 'lucide-react';
import { ICONS } from '@/lib/data';
import { CATEGORIES } from '@/lib/categories';

export type Song = {
  id: string;
  artist: string;
  title: string;
  timestamp: Date | string;
  stationName: string;
  isFavorite: boolean;
};

export type Station = {
  id: string;
  name: string;
  genre: string;
  category: keyof typeof CATEGORIES;
  url?: string;
  icon: keyof typeof ICONS;
};
