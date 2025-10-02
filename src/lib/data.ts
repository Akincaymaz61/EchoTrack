import type { Station } from '@/lib/types';
import { Radio, Waves, Mic, Bot, GitBranch, Headphones, Music, Sparkles } from 'lucide-react';

export const ICONS = {
    Radio,
    Waves,
    Mic,
    Bot,
    GitBranch,
    Headphones,
    Music,
    Sparkles,
};

export const iconNames = Object.keys(ICONS) as (keyof typeof ICONS)[];


export const STATIONS: Station[] = [
  { id: 'station-1', name: 'Synthwave FM', genre: '80s Retro', icon: 'Radio' },
  { id: 'station-2', name: 'Lo-Fi Beats', genre: 'Chillhop', icon: 'Headphones' },
  { id: 'station-3', name: 'Indie Hits', genre: 'Alternative', icon: 'Mic' },
];

export const SONG_POOL: { artist: string; title: string; stationIds: string[] }[] = [];
