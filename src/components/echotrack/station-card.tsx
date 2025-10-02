
'use client';

import type { Song, Station } from '@/lib/types';
import { ICONS } from '@/lib/data';
import { useAppContext } from '@/context/app-context';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Music, Loader2, BrainCircuit, X, PowerOff, Play, Pause, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { getTrendSummary, fetchNowPlaying } from '@/app/actions';
import { EditStationForm } from '@/components/echotrack/edit-station-form';
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
} from "@/components/ui/alert-dialog"

type StationCardProps = {
  station: Station;
};

type CurrentSongInfo = {
  id: string;
  artist: string;
  title: string;
}

export function StationCard({ station }: StationCardProps) {
  const { logSong, loggedSongs, toggleFavorite, removeStation, currentlyPlayingStationId, setCurrentlyPlayingStationId } = useAppContext();
  const [currentSong, setCurrentSong] = useState<CurrentSongInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  useEffect(() => {
    if (station.url) {
      audioRef.current = new Audio(station.url);
      audioRef.current.preload = 'none';
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
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
                    toast({
                        variant: "destructive",
                        title: "Playback Error",
                        description: "Could not play this station's stream. The URL may be invalid or unsupported.",
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
    const updateNowPlaying = async (isInitialLoad = false) => {
      if (!station.url) {
        setError("No stream URL for this station.");
        setIsLoading(false);
        return;
      }

      if (isInitialLoad) {
        setIsLoading(true);
      }

      try {
        const result = await fetchNowPlaying(station.url);
        
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
        setError("Failed to fetch now playing data.");
        setCurrentSong(null);
      } finally {
        if(isInitialLoad) {
            setIsLoading(false);
        }
      }
    };

    updateNowPlaying(true);
    const interval = setInterval(() => updateNowPlaying(false), 15000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [station.url]);
  
  useEffect(() => {
     if (!currentSong) return;

     const lastLoggedSong = loggedSongs[0];
     if (lastLoggedSong?.title !== currentSong.title || lastLoggedSong?.artist !== currentSong.artist) {
       logSong({
         artist: currentSong.artist,
         title: currentSong.title,
         stationName: station.name,
       });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong, station.name]);


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

  const handleAnalyzeTrends = async () => {
    setIsAnalyzing(true);
    const stationHistory = loggedSongs
      .filter(s => s.stationName === station.name)
      .map(s => ({ artist: s.artist, title: s.title, timestamp: s.timestamp.toString() }));

    if (stationHistory.length < 1) { 
      toast({
        variant: "destructive",
        title: "Not Enough Data",
        description: "Need at least 1 logged song to analyze trends for this station.",
      });
      setIsAnalyzing(false);
      return;
    }
    
    const result = await getTrendSummary(station.name, stationHistory);
    setIsAnalyzing(false);

    if (result.summary) {
      setAnalysisResult(result.summary);
      setIsAnalysisDialogOpen(true);
    } else {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: result.error || "Could not generate station trend summary.",
      });
    }
  };


  return (
    <>
      <Card className="flex flex-col justify-between transition-all duration-300 hover:shadow-primary/20 hover:shadow-lg border-transparent bg-card/50 backdrop-blur-sm relative group">
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsEditDialogOpen(true)}>
                <Pencil className="w-4 h-4"/>
                <span className="sr-only">Edit station</span>
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
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
              <CardTitle className="font-headline text-xl flex items-center gap-2 pr-16">
                <Icon className="w-6 h-6 text-primary" />
                {station.name}
              </CardTitle>
              <CardDescription>{station.genre}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-center items-center text-center min-h-[100px] animate-in fade-in duration-500">
          {isLoading ? (
            <div className="space-y-2 w-full">
                <div className="flex justify-center items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin"/>
                    <span>Tuning in...</span>
                </div>
              <Skeleton className="h-6 w-3/4 mx-auto mt-2" />
              <Skeleton className="h-4 w-1/2 mx-auto" />
            </div>
          ) : currentSong ? (
            <>
              <Music className="w-8 h-8 text-muted-foreground mb-4" />
              <p className="text-lg font-bold text-primary-foreground">{currentSong.title}</p>
              <p className="text-md text-muted-foreground">{currentSong.artist}</p>
            </>
          ) : (
             <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <PowerOff className="w-8 h-8"/>
                <p className="font-semibold">{error || 'Station Offline'}</p>
                <p className="text-xs max-w-xs truncate">{station.url}</p>
             </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center gap-2">
           <Button variant="ghost" size="icon" onClick={handleFavoriteClick} disabled={!currentSong || isLoading}>
            <Star className={cn("w-5 h-5 transition-colors", isCurrentSongFavorite ? 'fill-amber-400 text-amber-400' : 'text-primary/70')} />
            <span className="sr-only">Favorite</span>
          </Button>
          
           <Button variant="outline" size="icon" onClick={handlePlayPauseToggle}>
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            <span className="sr-only">{isPlaying ? 'Pause' : 'Play'}</span>
          </Button>

          <Button variant="outline" size="sm" onClick={handleAnalyzeTrends} disabled={isAnalyzing}>
            {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
            Analyze
          </Button>
        </CardFooter>
      </Card>
      
      <AlertDialog open={isAnalysisDialogOpen} onOpenChange={setIsAnalysisDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-primary" />
              Trend Analysis for {station.name}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left pt-4 max-h-[400px] overflow-y-auto">
              {analysisResult}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditStationForm 
        station={station}
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
      />
    </>
  );
}
