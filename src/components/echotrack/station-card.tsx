'use client';

import type { Song, Station } from '@/lib/types';
import { ICONS } from '@/lib/data';
import { useAppContext } from '@/context/app-context';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Music, Loader2, BrainCircuit, X, PowerOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { getTrendSummary, fetchNowPlaying } from '@/app/actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
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
  const { logSong, loggedSongs, toggleFavorite, removeStation } = useAppContext();
  const [currentSong, setCurrentSong] = useState<CurrentSongInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const intervalRef = useRef<NodeJS.Timeout>();

  const Icon = ICONS[station.icon] || Music;

  const isCurrentSongFavorite = useMemo(() => {
    if (!currentSong) return false;
    const loggedVersion = loggedSongs.find(s => s.title === currentSong.title && s.artist === currentSong.artist && s.stationName === station.name);
    return loggedVersion ? loggedVersion.isFavorite : false;
  }, [currentSong, loggedSongs, station.name]);
  
  const loggedId = useMemo(() => {
     if (!currentSong) return null;
     const loggedVersion = loggedSongs.find(s => s.title === currentSong.title && s.artist === currentSong.artist && s.stationName === station.name);
     return loggedVersion?.id;
  },[currentSong, loggedSongs, station.name]);

  const updateNowPlaying = useCallback(async () => {
    if (!station.url) {
      setError("No stream URL for this station.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const result = await fetchNowPlaying(station.url);
    setIsLoading(false);

    if (result.error) {
      setError(result.error);
      setCurrentSong(null);
    } else if (result.song) {
      setError(null);
      // Only update if the song is different
      if (result.song.title !== currentSong?.title || result.song.artist !== currentSong?.artist) {
        const newSong: CurrentSongInfo = {
            id: `song-${Date.now()}`,
            artist: result.song.artist,
            title: result.song.title,
        };
        setCurrentSong(newSong);
        
        // Log the new song
        logSong({
            artist: newSong.artist,
            title: newSong.title,
            stationName: station.name,
        });
      }
    }
  }, [station.url, station.name, currentSong?.title, currentSong?.artist, logSong]);

  useEffect(() => {
    updateNowPlaying(); // Fetch immediately on mount
    // And then fetch every 15 seconds
    intervalRef.current = setInterval(updateNowPlaying, 15000);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [updateNowPlaying]);


  const handleFavoriteClick = () => {
    if (loggedId) {
      toggleFavorite(loggedId);
      const isFav = isCurrentSongFavorite;
      toast({
        title: isFav ? "Removed from Favorites" : "Added to Favorites",
        description: `${currentSong?.title} by ${currentSong?.artist}`,
      });
    } else if (currentSong) {
        // This case handles favoriting a song that was just fetched but not yet in the main log
        const newSongEntry: Omit<Song, 'id' | 'timestamp' | 'isFavorite'> = {
            artist: currentSong.artist,
            title: currentSong.title,
            stationName: station.name,
        };
        logSong(newSongEntry);
        // We need to find the just-added song to favorite it. This is a bit of a workaround.
        setTimeout(() => {
            const latestSong = loggedSongs[0];
            if(latestSong.title === currentSong.title) {
                toggleFavorite(latestSong.id);
            }
        }, 100);

        toast({
            title: "Added to Favorites",
            description: `${currentSong.title} by ${currentSong.artist}`,
        });
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
      .map(s => ({ artist: s.artist, title: s.title, timestamp: s.timestamp.toISOString() }));

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
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10" onClick={handleRemoveStation}>
            <X className="w-4 h-4"/>
            <span className="sr-only">Remove station</span>
        </Button>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="font-headline text-xl flex items-center gap-2">
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
    </>
  );
}
