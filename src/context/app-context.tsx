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

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after the initial render
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
  
  // Return the initial value until the component has mounted and localStorage is read
  // This helps prevent hydration mismatch
  return [isInitialized ? storedValue : initialValue, setValue];
}


export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [stations, setStations] = useLocalStorage<Station[]>('stations', initialStations);
  const [loggedSongs, setLoggedSongs] = useLocalStorage<Song[]>('loggedSongs', []);

  const addStation = useCallback((stationData: Omit<Station, 'id'>) => {
    const newStation: Station = {
      ...stationData,
      id: `station-${Date.now()}-${Math.random()}`,
    };
    setStations(prevStations => [...prevStations, newStation]);
  }, [setStations]);

  const removeStation = useCallback((stationId: string) => {
    setStations(prevStations => prevStations.filter(s => s.id !== stationId));
  }, [setStations]);

  const logSong = useCallback((songData: Omit<Song, 'id' | 'timestamp' | 'isFavorite'>) => {
     setLoggedSongs(currentSongs => {
        if (currentSongs.length > 0) {
            const lastSong = currentSongs[0];
            if (lastSong.title === songData.title && lastSong.artist === songData.artist && lastSong.stationName === songData.stationName) {
                return currentSongs; // Don't log the same song twice in a row for the same station
            }
        }
          
        const newSong: Song = {
          ...songData,
          id: `song-${Date.now()}-${Math.random()}`,
          timestamp: new Date().toISOString(), // Use ISO string for serialization
          isFavorite: false,
        };
        return [newSong, ...currentSongs];
     });
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
  
  const songsWithDates = loggedSongs.map(s => {
    const timestamp = typeof s.timestamp === 'string' ? new Date(s.timestamp) : s.timestamp;
    return {...s, timestamp};
  });


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
