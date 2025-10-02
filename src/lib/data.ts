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

export const GENRES = [
    'Pop',
    'Rock',
    'Rap',
    'Electronic',
    'Ambient',
    'Chillhop',
    'Synthwave',
    '80s Retro',
    'Türkçe Pop',
    'Türkçe Rock',
    'Alternative',
    'Jazz',
    'Classical'
];


export const STATIONS: Station[] = [
  { id: 'station-1', name: 'Synthwave FM', genre: '80s Retro', icon: 'Radio', url: 'http://ice1.somafm.com/synthwave-128-mp3' },
  { id: 'station-2', name: 'Lo-Fi Beats', genre: 'Chillhop', icon: 'Headphones', url: 'http://stream.zeno.fm/fbrxpdn3hfeuv' },
  { id: 'station-3', name: 'Groove Salad', genre: 'Ambient', icon: 'Waves', url: 'http://ice1.somafm.com/groovesalad-128-mp3' },
];

export const SONG_POOL: { artist: string; title: string; stationIds: string[] }[] = [];
