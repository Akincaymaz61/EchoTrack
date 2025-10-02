'use client';

import type { Song, Station } from '@/lib/types';
import { exportSongsToTxt } from '@/lib/utils';
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { STATIONS as initialStations } from '@/lib/data';

interface AppContextType {
  stations: Station[];
  addStation: (station: Omit<Station, 'id'>) => void;
  removeStation: (stationId: string) => void;
  loggedSongs: Song[];
  logSong: (song: Omit<Song, 'id' | 'timestamp' | 'isFavorite'>) => void;
  toggleFavorite: (songId: string) => void;
  exportAllSongs: () => void;
  exportFavoriteSongs: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [stations, setStations] = useState<Station[]>(initialStations);
  const [loggedSongs, setLoggedSongs] = useState<Song[]>([]);

  const addStation = useCallback((stationData: Omit<Station, 'id'>) => {
    const newStation: Station = {
      ...stationData,
      id: `station-${Date.now()}-${Math.random()}`,
    };
    setStations(prevStations => [...prevStations, newStation]);
  }, []);

  const removeStation = useCallback((stationId: string) => {
    setStations(prevStations => prevStations.filter(s => s.id !== stationId));
  }, []);

  const logSong = useCallback((songData: Omit<Song, 'id' | 'timestamp' | 'isFavorite'>) => {
    const newSong: Song = {
      ...songData,
      id: `song-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      isFavorite: false,
    };
    setLoggedSongs(prevSongs => [newSong, ...prevSongs]);
  }, []);

  const toggleFavorite = useCallback((songId: string) => {
    setLoggedSongs(prevSongs =>
      prevSongs.map(song =>
        song.id === songId ? { ...song, isFavorite: !song.isFavorite } : song
      )
    );
  }, []);

  const exportAllSongs = useCallback(() => {
    exportSongsToTxt(loggedSongs, false);
  }, [loggedSongs]);

  const exportFavoriteSongs = useCallback(() => {
    const favoriteSongs = loggedSongs.filter(song => song.isFavorite);
    exportSongsToTxt(favoriteSongs, true);
  }, [loggedSongs]);

  const value = {
    stations,
    addStation,
    removeStation,
    loggedSongs,
    logSong,
    toggleFavorite,
    exportAllSongs,
    exportFavoriteSongs
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
