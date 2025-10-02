import type { Station } from '@/lib/types';
import { Radio, Waves, Mic, Bot, GitBranch, Headphones, Music, Sparkles } from 'lucide-react';

export const STATIONS: Station[] = [
  { id: 'station-1', name: 'Synthwave FM', genre: '80s Retro', icon: Radio },
  { id: 'station-2', name: 'Lo-Fi Beats', genre: 'Chillhop', icon: Headphones },
  { id: 'station-3', name: 'Indie Hits', genre: 'Alternative', icon: Mic },
  { id: 'station-4', name: 'AI Pop Waves', genre: 'Generated Pop', icon: Bot },
  { id: 'station-5', name: 'Cosmic Drift', genre: 'Ambient', icon: Waves },
  { id: 'station-6', name: 'Future Funk', genre: 'Electronic', icon: Sparkles },
];

export const SONG_POOL: { artist: string; title: string; stationIds: string[] }[] = [
  { artist: 'Com Truise', title: 'Cyanide Sisters', stationIds: ['station-1', 'station-5'] },
  { artist: 'The Midnight', title: 'Sunset', stationIds: ['station-1', 'station-5'] },
  { artist: 'Mitch Murder', title: 'Palmer\'s Arcade', stationIds: ['station-1'] },
  { artist: 'Idealism', title: 'controlla', stationIds: ['station-2'] },
  { artist: 'Emapea', title: 'Jazzy', stationIds: ['station-2'] },
  { artist: 'Tame Impala', title: 'The Less I Know The Better', stationIds: ['station-3'] },
  { artist: 'Glass Animals', title: 'Gooey', stationIds: ['station-3'] },
  { artist: 'A.L.I.S.O.N', title: 'Continuum', stationIds: ['station-5', 'station-6'] },
  { artist: 'Home', title: 'Resonance', stationIds: ['station-2', 'station-5'] },
  { artist: 'Fakear', title: 'La Lune Rousse', stationIds: ['station-2'] },
  { artist: 'Tycho', title: 'Awake', stationIds: ['station-5', 'station-6'] },
  { artist: 'Yung Bae', title: 'Bad Boy', stationIds: ['station-6'] },
  { artist: 'St. Lucia', title: 'Elevate', stationIds: ['station-3'] },
  { artist: 'Data-Groove', title: 'Cybernetic Love', stationIds: ['station-4'] },
  { artist: 'Pixel-Pop', title: 'Digital Dream', stationIds: ['station-4'] },
];
