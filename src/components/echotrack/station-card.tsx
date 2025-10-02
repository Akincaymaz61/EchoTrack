
'use client';

import type { Song, Station } from '@/lib/types';
import { ICONS } from '@/lib/data';
import { useAppContext } from '@/context/app-context';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Music, Loader2, X, PowerOff, Play, Pause, Pencil, Clock } from 'lucide-react';
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

type StationCardProps = {
  station: Station;
};

type CurrentSongInfo = {
  id: string;
  artist: string;
  title: string;
}

const MAX_RETRIES = 3;

export function StationCard({ station }: StationCardProps) {
  const { logSong, loggedSongs, toggleFavorite, removeStation, currentlyPlayingStationId, setCurrentlyPlayingStationId } = useAppContext();
  const [currentSong, setCurrentSong] = useState<CurrentSongInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const Icon = ICONS[station.icon] || Music;
  const isPlaying = currentlyPlayingStationId === station.id;
  
  const loggedId = useMemo(() => {
     if (!currentSong) return null;
     const loggedVersion = loggedSongs.find(s => s.title === currentSong.title && s.artist === currentSong.artist && s.stationName === station.name);
     return loggedVersion?.id;
  },[currentSong, loggedSongs, station.name]);

  const isCurrentSongFavorite = useMemo(() => {
    if (!loggedId) return false;
    const loggedVersion = loggedSongs.find(s => s.id === loggedId);
    return loggedVersion ? loggedVersion.isFavorite : false;
  }, [loggedId, loggedSongs]);

  const stationHistory = useMemo(() => {
    return loggedSongs.filter(s => s.stationName === station.name).slice(0, 5);
  }, [loggedSongs, station.name]);

  useEffect(() => {
    if (station.url) {
        audioRef.current = new Audio(station.url);
        audioRef.current.crossOrigin = "anonymous";
        audioRef.current.preload = 'none';

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyserRef.current = audioContext.createAnalyser();
        analyserRef.current.fftSize = 256;

        if (audioRef.current) {
            sourceRef.current = audioContext.createMediaElementSource(audioRef.current);
            sourceRef.current.connect(analyserRef.current);
            analyserRef.current.connect(audioContext.destination);
        }
    }
    return () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        if (sourceRef.current) {
            sourceRef.current.disconnect();
        }
        if (analyserRef.current) {
            analyserRef.current.disconnect();
        }
    };
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
      
      if (isInitialLoad && isMounted) {
        setIsLoading(true);
      }

      try {
        const result = await fetchNowPlaying(station.url);
        if (!isMounted) return;

        if (result.error) {
          if (retryCount < MAX_RETRIES) {
            setRetryCount(prev => prev + 1);
          } else {
            setError(result.error);
            setCurrentSong(null);
          }
        } else if (result.song) {
          setError(null);
          setRetryCount(0); // Reset on success
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
          if (retryCount < MAX_RETRIES) {
            setRetryCount(prev => prev + 1);
          } else {
            setError("Failed to fetch now playing data.");
            setCurrentSong(null);
          }
        }
      } finally {
        if (isMounted && isInitialLoad) {
            setIsLoading(false);
        }
      }
    };

    updateNowPlaying(true);
    interval = setInterval(() => updateNowPlaying(false), 15000);

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [station.url, retryCount]);
  
  useEffect(() => {
    if (currentSong) {
      logSong({
        artist: currentSong.artist,
        title: currentSong.title,
        stationName: station.name,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong]);


  const handleFavoriteClick = () => {
    if (loggedId) {
      toggleFavorite(loggedId);
      const isFav = isCurrentSongFavorite;
      toast({
        title: isFav ? "Removed from Favorites" : "Added to Favorites",
        description: `${currentSong?.title} by ${currentSong?.artist}`,
      });
    } else if (currentSong) {
        const newSongEntry: Omit<Song, 'id' | 'timestamp' | 'isFavorite'> = {
            artist: currentSong.artist,
            title: currentSong.title,
            stationName: station.name,
        };
        const newId = logSong(newSongEntry);
        
        if (newId) {
            toggleFavorite(newId);
            toast({
                title: "Added to Favorites",
                description: `${currentSong.title} by ${currentSong.artist}`,
            });
        }
    }
  };
  
  const handleRemoveStation = () => {
    removeStation(station.id);
    toast({
        title: "Station Removed",
        description: `${station.name} has been removed from your list.`,
    });
  };

  return (
    <>
      <Card className="flex flex-col justify-between transition-all duration-300 hover:shadow-primary/20 hover:shadow-lg border-border bg-card/60 backdrop-blur-sm relative group overflow-hidden">
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 bg-black/20 hover:bg-black/40" disabled={stationHistory.length === 0}>
                    <Clock className="w-4 h-4"/>
                    <span className="sr-only">Recent history</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium leading-none">Recent History</h4>
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
            <Button variant="ghost" size="icon" className="h-7 w-7 bg-black/20 hover:bg-black/40" onClick={() => setIsEditDialogOpen(true)}>
                <Pencil className="w-4 h-4"/>
                <span className="sr-only">Edit station</span>
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 bg-black/20 hover:bg-black/40">
                        <X className="w-4 h-4"/>
                        <span className="sr-only">Remove station</span>
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove the "{station.name}" station from your list.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRemoveStation}>Remove</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="font-headline text-xl flex items-center gap-3 pr-16">
                <Icon className="w-6 h-6 text-primary flex-shrink-0" />
                <span className="truncate">{station.name}</span>
              </CardTitle>
              <CardDescription>{station.genre}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-center items-center text-center min-h-[120px] p-4">
          {isLoading ? (
            <div className="flex justify-center items-center gap-2 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin"/>
                <span>Tuning in...</span>
            </div>
          ) : currentSong ? (
            <div className="w-full">
              <p className="text-xs text-primary font-semibold mb-1">NOW PLAYING</p>
              <p className="text-lg font-bold text-primary leading-tight">{currentSong.title}</p>
              <p className="text-md text-secondary-foreground">{currentSong.artist}</p>
            </div>
          ) : (
             <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <PowerOff className="w-8 h-8"/>
                <p className="font-semibold">{error || 'Station Offline'}</p>
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
            <span className="sr-only">Favorite</span>
          </Button>
          
           <Button variant="outline" size="icon" onClick={handlePlayPauseToggle} className="w-12 h-12 rounded-full border-2">
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
            <span className="sr-only">{isPlaying ? 'Pause' : 'Play'}</span>
          </Button>

          <div className="w-10 h-10" />
        </CardFooter>
      </Card>
      
      <EditStationForm 
        station={station}
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
      />
    </>
  );
}
