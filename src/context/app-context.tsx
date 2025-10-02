
'use client';

import type { Song, Station } from '@/lib/types';
import { exportSongsToTxt } from '@/lib/utils';
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { STATIONS as initialStations } from '@/lib/data';

interface AppContextType {
  stations: Station[];
  addStation: (station: Omit<Station, 'id'>) => void;
  updateStation: (stationId: string, stationData: Partial<Omit<Station, 'id'>>) => void;
  removeStation: (stationId: string) => void;
  loggedSongs: Song[];
  logSong: (song: Omit<Song, 'id' | 'timestamp' | 'isFavorite'>) => string | undefined;
  toggleFavorite: (songId: string) => void;
  exportAllSongs: () => void;
  exportFavoriteSongs: () => void;
  exportStationSongs: (stationName: string) => void;
  clearHistory: () => void;
  currentlyPlayingStationId: string | null;
  setCurrentlyPlayingStationId: (stationId: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsInitialized(true);
    }
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    if (typeof window === 'undefined') {
      console.warn(`Tried to set localStorage key “${key}” even though environment is not a client`);
      return;
    }
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };
  
  return [isInitialized ? storedValue : initialValue, setValue];
}


export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [stations, setStations] = useLocalStorage<Station[]>('stations', initialStations);
  const [loggedSongs, setLoggedSongs] = useLocalStorage<Song[]>('loggedSongs', []);
  const [currentlyPlayingStationId, setCurrentlyPlayingStationId] = useState<string | null>(null);

  const addStation = useCallback((stationData: Omit<Station, 'id'>) => {
    const newStation: Station = {
      ...stationData,
      id: `station-${Date.now()}-${Math.random()}`,
    };
    setStations(prevStations => [...prevStations, newStation]);
  }, [setStations]);
  
  const updateStation = useCallback((stationId: string, stationData: Partial<Omit<Station, 'id'>>) => {
    setStations(prevStations =>
      prevStations.map(s => (s.id === stationId ? { ...s, ...stationData } : s))
    );
  }, [setStations]);

  const removeStation = useCallback((stationId: string) => {
    setStations(prevStations => prevStations.filter(s => s.id !== stationId));
  }, [setStations]);

  const logSong = useCallback((songData: Omit<Song, 'id' | 'timestamp' | 'isFavorite'>): string | undefined => {
     let newSongId: string | undefined = undefined;
     setLoggedSongs(currentSongs => {
        const lastSong = currentSongs[currentSongs.length - 1];
        if (lastSong && lastSong.title === songData.title && lastSong.artist === songData.artist && lastSong.stationName === songData.stationName) {
            return currentSongs;
        }
          
        const newSong: Song = {
          ...songData,
          id: `song-${Date.now()}-${Math.random()}`,
          timestamp: new Date().toISOString(),
          isFavorite: false,
        };
        newSongId = newSong.id;
        return [...currentSongs, newSong];
     });
     return newSongId;
  }, [setLoggedSongs]);

  const toggleFavorite = useCallback((songId: string) => {
    setLoggedSongs(
      currentSongs => currentSongs.map(song =>
        song.id === songId ? { ...song, isFavorite: !song.isFavorite } : song
      )
    );
  }, [setLoggedSongs]);

  const exportAllSongs = useCallback(() => {
    exportSongsToTxt(loggedSongs, false);
  }, [loggedSongs]);

  const exportFavoriteSongs = useCallback(() => {
    const favoriteSongs = loggedSongs.filter(song => song.isFavorite);
    exportSongsToTxt(favoriteSongs, true);
  }, [loggedSongs]);

  const exportStationSongs = useCallback((stationName: string) => {
    const stationSongs = loggedSongs.filter(song => song.stationName === stationName);
    exportSongsToTxt(stationSongs, false, stationName);
  }, [loggedSongs]);

  const clearHistory = useCallback(() => {
    setLoggedSongs([]);
  }, [setLoggedSongs]);
  
  const songsWithDates = loggedSongs.map(s => {
    const timestamp = typeof s.timestamp === 'string' ? new Date(s.timestamp) : s.timestamp;
    return {...s, timestamp};
  }).reverse();


  const value = {
    stations,
    addStation,
    updateStation,
    removeStation,
    loggedSongs: songsWithDates,
    logSong,
    toggleFavorite,
    exportAllSongs,
    exportFavoriteSongs,
    exportStationSongs,
    clearHistory,
    currentlyPlayingStationId,
    setCurrentlyPlayingStationId
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

    