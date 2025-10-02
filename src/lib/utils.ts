import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Song } from '@/lib/types';
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function exportSongsToTxt(songs: Song[], favoritesOnly: boolean) {
  const groupedByStation = songs.reduce((acc, song) => {
    if (!acc[song.stationName]) {
      acc[song.stationName] = [];
    }
    acc[song.stationName].push(song);
    return acc;
  }, {} as Record<string, Song[]>);

  let content = `EchoTrack Song Export - ${favoritesOnly ? 'Favorites' : 'All Songs'}\n`;
  content += `Exported on: ${new Date().toLocaleString()}\n\n`;

  for (const stationName in groupedByStation) {
    if (groupedByStation[stationName].length > 0) {
      content += `--- ${stationName} ---\n`;
      groupedByStation[stationName].forEach(song => {
        content += `${song.artist} - ${song.title}\n`;
      });
      content += '\n';
    }
  }

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `echotrack_export_${favoritesOnly ? 'favorites' : 'all'}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
