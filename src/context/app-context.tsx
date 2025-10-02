'use client';

import type { Song, Station } from '@/lib/types';
import { exportSongsToTxt } from '@/lib/utils';
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
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

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}


export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [stations, setStations] = useLocalStorage<Station[]>('stations', initialStations);
  const [loggedSongs, setLoggedSongs] = useLocalStorage<Song[]>('loggedSongs', []);

  const addStation = useCallback((stationData: Omit<Station, 'id'>) => {
    const newStation: Station = {
      ...stationData,
      id: `station-${Date.now()}-${Math.random()}`,
    };
    setStations([...stations, newStation]);
  }, [stations, setStations]);

  const removeStation = useCallback((stationId: string) => {
    setStations(stations.filter(s => s.id !== stationId));
  }, [stations, setStations]);

  const logSong = useCallback((songData: Omit<Song, 'id' | 'timestamp' | 'isFavorite'>) => {
     // Check if the most recent song is the same
    if (loggedSongs.length > 0) {
        const lastSong = loggedSongs[0];
        if (lastSong.title === songData.title && lastSong.artist === songData.artist && lastSong.stationName === songData.stationName) {
            return; // Don't log the same song twice in a row for the same station
        }
    }
      
    const newSong: Song = {
      ...songData,
      id: `song-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(), // Use ISO string for serialization
      isFavorite: false,
    };
    setLoggedSongs([newSong, ...loggedSongs]);
  }, [loggedSongs, setLoggedSongs]);

  const toggleFavorite = useCallback((songId: string) => {
    setLoggedSongs(
      loggedSongs.map(song =>
        song.id === songId ? { ...song, isFavorite: !song.isFavorite } : song
      )
    );
  }, [loggedSongs, setLoggedSongs]);

  const exportAllSongs = useCallback(() => {
    const songsWithDates = loggedSongs.map(s => ({...s, timestamp: new Date(s.timestamp)}));
    exportSongsToTxt(songsWithDates, false);
  }, [loggedSongs]);

  const exportFavoriteSongs = useCallback(() => {
    const favoriteSongs = loggedSongs.filter(song => song.isFavorite).map(s => ({...s, timestamp: new Date(s.timestamp)}));
    exportSongsToTxt(favoriteSongs, true);
  }, [loggedSongs]);
  
  const songsWithDates = loggedSongs.map(s => ({...s, timestamp: new Date(s.timestamp)}));

  const value = {
    stations,
    addStation,
    removeStation,
    loggedSongs: songsWithDates,
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
