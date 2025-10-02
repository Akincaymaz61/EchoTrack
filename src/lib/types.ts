import type { LucideIcon } from 'lucide-react';

export type Song = {
  id: string;
  artist: string;
  title: string;
  timestamp: Date;
  stationName: string;
  isFavorite: boolean;
};

export type Station = {
  id: string;
  name: string;
  genre: string;
  icon: LucideIcon;
};
