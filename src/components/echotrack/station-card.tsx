'use client';

import type { Song, Station } from '@/lib/types';
import { ICONS } from '@/lib/data';
import { useAppContext } from '@/context/app-context';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Music, Loader2, X, PowerOff, Play, Pause, Pencil, Clock, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { fetchNowPlaying } from '@/app/actions';
import { EditStationForm } from '@/components/echotrack/edit-station-form';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { SoundWave } from '@/components/echotrack/sound-wave';
import { Badge } from '@/components/ui/badge';
import { TinyColor } from '@ctrl/tinycolor';


type StationCardProps = {
  station: Station;
};

type CurrentSongInfo = {
  id: string;
  artist: string;
  title: string;
}

export function StationCard({ station }: StationCardProps) {
  const { logSong, loggedSongs, toggleFavorite, removeStation, currentlyPlayingStationId, setCurrentlyPlayingStationId, categories, refreshSignal, getSongById, getLoggedSongId } = useAppContext();
  const [currentSong, setCurrentSong] = useState<CurrentSongInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localRefreshSignal, setLocalRefreshSignal] = useState(0);

  const { toast } = useToast();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const Icon = ICONS[station.icon] || Music;
  const isPlaying = currentlyPlayingStationId === station.id;
  
  const loggedId = useMemo(() => {
     if (!currentSong) return null;
     return getLoggedSongId(currentSong.title, currentSong.artist, station.name);
  }, [currentSong, getLoggedSongId, station.name, loggedSongs]); // Keep loggedSongs here to react to favorite changes

  const isCurrentSongFavorite = useMemo(() => {
    if (!loggedId) return false;
    const loggedVersion = getSongById(loggedId);
    return loggedVersion ? loggedVersion.isFavorite : false;
  }, [loggedId, getSongById, loggedSongs]); // Keep loggedSongs here to react to favorite changes

  const stationHistory = useMemo(() => {
    return loggedSongs.filter(s => s.stationName === station.name).slice(0, 5);
  }, [loggedSongs, station.name]);

  useEffect(() => {
    if (station.url) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioRef.current = new Audio(station.url);
        audioRef.current.crossOrigin = "anonymous";
        audioRef.current.preload = 'none';

        analyserRef.current = audioContext.createAnalyser();
        analyserRef.current.fftSize = 256;

        sourceRef.current = audioContext.createMediaElementSource(audioRef.current);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContext.destination);

        return () => {
            audioContext.close();
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [station.url]);

  useEffect(() => {
    const playAudio = async () => {
        if (isPlaying && audioRef.current?.paused) {
            try {
                audioRef.current.volume = 0.5;
                await audioRef.current.play();
            } catch (e: any) {
                if (e.name !== 'AbortError') {
                    console.error("Playback Error:", e);
                    toast({
                        variant: "destructive",
                        title: "Playback Error",
                        description: "Could not play stream. The URL may be invalid or the station might be offline.",
                    });
                    setCurrentlyPlayingStationId(null);
                }
            }
        }
    };

    if (isPlaying) {
        playAudio();
    } else {
        audioRef.current?.pause();
    }
  }, [isPlaying, setCurrentlyPlayingStationId, toast]);

  const handlePlayPauseToggle = () => {
    if (!station.url) {
        toast({
            variant: "destructive",
            title: "No Stream URL",
            description: "This station does not have a stream URL to play.",
        });
        return;
    }
    if (isPlaying) {
      setCurrentlyPlayingStationId(null);
    } else {
      setCurrentlyPlayingStationId(station.id);
    }
  };
  
  const triggerRefresh = () => {
    setLocalRefreshSignal(prev => prev + 1);
  };
  
  useEffect(() => {
    let isMounted = true;
    let interval: NodeJS.Timeout | undefined;

    const updateNowPlaying = async (isInitialLoad = false) => {
      if (!station.url) {
        if (isMounted) {
          setError("No stream URL for this station.");
          setIsLoading(false);
        }
        return;
      }
      
      if (isMounted) {
        setIsLoading(true);
      }

      try {
        const result = await fetchNowPlaying(station.url);
        if (!isMounted) return;

        if (result.error) {
          setError(result.error);
          setCurrentSong(null);
        } else if (result.song) {
          setError(null);
          setCurrentSong(prevSong => {
            if (result.song.title !== prevSong?.title || result.song.artist !== prevSong?.artist) {
              return {
                id: `song-${Date.now()}`,
                artist: result.song.artist,
                title: result.song.title,
              };
            }
            return prevSong;
          });
        }
      } catch (e: any) {
        if (isMounted) {
          setError("Failed to fetch now playing data.");
          setCurrentSong(null);
        }
      } finally {
        if (isMounted) {
            setIsLoading(false);
        }
      }
    };

    updateNowPlaying(true);
    interval = setInterval(() => updateNowPlaying(false), 120000);

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [station.url, refreshSignal, localRefreshSignal]);
  
  useEffect(() => {
    if (currentSong) {
      logSong({
        artist: currentSong.artist,
        title: currentSong.title,
        stationName: station.name,
        stationCategory: station.category,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong]);


  const handleFavoriteClick = () => {
    if (loggedId) {
      toggleFavorite(loggedId);
      const isFav = isCurrentSongFavorite;
      toast({
        title: isFav ? "Favorilerden Kaldırıldı" : "Favorilere Eklendi",
        description: `${currentSong?.title} by ${currentSong?.artist}`,
      });
    } else if (currentSong) {
        const newSongEntry: Omit<Song, 'id' | 'timestamp' | 'isFavorite'> = {
            artist: currentSong.artist,
            title: currentSong.title,
            stationName: station.name,
            stationCategory: station.category,
        };
        const newId = logSong(newSongEntry);
        
        if (newId) {
            toggleFavorite(newId);
            toast({
                title: "Favorilere Eklendi",
                description: `${currentSong.title} by ${currentSong.artist}`,
            });
        }
    }
  };
  
  const handleRemoveStation = () => {
    removeStation(station.id);
    toast({
        title: "İstasyon Kaldırıldı",
        description: `${station.name} listenizden kaldırıldı.`,
    });
  };

  const stationColor = useMemo(() => {
    return categories[station.category] || '#888888';
  }, [station.category, categories]);

  const colorPalette = useMemo(() => {
    const color = new TinyColor(stationColor);
    return {
      '--station-color-primary-hex': color.toHexString(),
      '--station-color-primary': color.toHslString(),
      '--station-color-foreground': color.isDark() ? 'hsl(0, 0%, 100%)' : 'hsl(0, 0%, 0%)',
      '--station-color-shadow': color.setAlpha(0.3).toRgbString(),
      '--station-color-badge': color.isDark() ? color.lighten(15).toHslString() : color.darken(15).toHslString(),
    } as React.CSSProperties;
  }, [stationColor]);


  return (
    <>
      <div className="station-card-wrapper" style={colorPalette}>
        <Card 
          className="flex flex-col justify-between transition-all duration-300 border-border bg-card/60 backdrop-blur-sm relative group overflow-hidden"
          style={{ boxShadow: `0 4px 14px 0 var(--station-color-shadow)` }}
        >
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <Button variant="ghost" size="icon" className="h-7 w-7 bg-black/20 hover:bg-black/40" onClick={triggerRefresh} title="Yenile">
                  <RefreshCw className="w-4 h-4"/>
                  <span className="sr-only">Yenile</span>
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 bg-black/20 hover:bg-black/40" disabled={stationHistory.length === 0} title="Geçmiş">
                      <Clock className="w-4 h-4"/>
                      <span className="sr-only">Yakın geçmiş</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <h4 className="font-medium leading-none">Yakın Geçmiş</h4>
                    <div className="flex flex-col gap-2">
                      {stationHistory.map(song => (
                        <div key={song.id} className="text-sm">
                          <p className="font-semibold truncate">{song.title}</p>
                          <p className="text-muted-foreground truncate">{song.artist}</p>
                          <p className="text-xs text-muted-foreground/70">{formatDistanceToNow(new Date(song.timestamp), { addSuffix: true })}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <Button variant="ghost" size="icon" className="h-7 w-7 bg-black/20 hover:bg-black/40" onClick={() => setIsEditDialogOpen(true)} title="Düzenle">
                  <Pencil className="w-4 h-4"/>
                  <span className="sr-only">İstasyonu düzenle</span>
              </Button>
              <AlertDialog>
                  <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 bg-black/20 hover:bg-black/40" title="Kaldır">
                          <X className="w-4 h-4"/>
                          <span className="sr-only">İstasyonu kaldır</span>
                      </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                      <AlertDialogHeader>
                          <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                          <AlertDialogDescription>
                              Bu, "{station.name}" istasyonunu listenizden kalıcı olarak kaldıracaktır.
                          </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                          <AlertDialogCancel>İptal</AlertDialogCancel>
                          <AlertDialogAction onClick={handleRemoveStation}>Kaldır</AlertDialogAction>
                      </AlertDialogFooter>
                  </AlertDialogContent>
              </AlertDialog>
          </div>
          <CardHeader>
              <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                      <CardTitle className="font-headline text-xl flex items-center gap-3" style={{ color: 'var(--station-color-primary)' }}>
                          <Icon className="w-6 h-6 flex-shrink-0" />
                          <span className="truncate">{station.name}</span>
                      </CardTitle>
                      <CardDescription>{station.category}</CardDescription>
                  </div>
                  <Badge style={{ backgroundColor: 'var(--station-color-badge)', color: 'var(--station-color-foreground)'}} className="text-xs whitespace-nowrap">{station.genre}</Badge>
              </div>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-center items-center text-center min-h-[120px] p-4">
            {isLoading ? (
              <div className="flex justify-center items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin"/>
                  <span>Ayarlanıyor...</span>
              </div>
            ) : currentSong ? (
              <div className="w-full">
                <p className="text-muted-foreground font-semibold mb-1 text-xs">ŞİMDİ ÇALIYOR</p>
                <p className="text-lg font-bold leading-tight text-primary">{currentSong.title}</p>
                <p className="text-md text-secondary-foreground">{currentSong.artist}</p>
              </div>
            ) : (
               <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <PowerOff className="w-8 h-8"/>
                  <p className="font-semibold">{error || 'İstasyon Çevrimdışı'}</p>
                  <p className="text-xs max-w-xs truncate">{station.url}</p>
               </div>
            )}
          </CardContent>

          <div className="h-16 relative">
              {isPlaying && analyserRef.current && <SoundWave analyser={analyserRef.current} />}
          </div>
          
          <CardFooter className="flex justify-around items-center gap-2 bg-black/20 z-10 p-3">
             <Button variant="ghost" size="icon" onClick={handleFavoriteClick} disabled={!currentSong || isLoading}>
              <Star className={cn("w-5 h-5 transition-colors", isCurrentSongFavorite ? 'fill-amber-400 text-amber-400' : 'text-primary/70')} />
              <span className="sr-only">Favori</span>
            </Button>
            
             <Button variant="outline" size="icon" onClick={handlePlayPauseToggle} className="w-12 h-12 rounded-full border-2">
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
              <span className="sr-only">{isPlaying ? 'Duraklat' : 'Oynat'}</span>
            </Button>

            <div className="w-10 h-10" />
          </CardFooter>
        </Card>
      </div>
      
      <EditStationForm 
        station={station}
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
      />
    </>
  );
}
