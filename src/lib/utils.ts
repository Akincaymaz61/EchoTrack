import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Song } from '@/lib/types';
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function exportSongsToTxt(songs: Song[], favoritesOnly: boolean, stationNameFilter?: string) {
  const groupedByStation = songs.reduce((acc, song) => {
    if (!acc[song.stationName]) {
      acc[song.stationName] = [];
    }
    acc[song.stationName].push(song);
    return acc;
  }, {} as Record<string, Song[]>);

  let content = `EchoTrack Song Export\n`;
  if (favoritesOnly) {
    content = `EchoTrack Song Export - Favorites\n`;
  } else if (stationNameFilter) {
    content = `EchoTrack Song Export - Station: ${stationNameFilter}\n`;
  } else {
    content = `EchoTrack Song Export - All Songs\n`;
  }
  content += `Exported on: ${new Date().toLocaleString()}\n\n`;

  for (const stationName in groupedByStation) {
    if (groupedByStation[stationName].length > 0) {
      const category = groupedByStation[stationName][0].stationCategory;
      content += `--- ${stationName} [${category}] ---\n`;
      groupedByStation[stationName].forEach(song => {
        content += `${song.artist} - ${song.title}\n`;
      });
      content += '\n';
    }
  }

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  let filename = 'echotrack_export';
  if (favoritesOnly) {
    filename += '_favorites';
  } else if (stationNameFilter) {
    const safeStationName = stationNameFilter.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    filename += `_${safeStationName}`;
  } else {
    filename += '_all';
  }
  filename += '.txt';
  
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
