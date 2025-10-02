'use client';

import type { Song, Station } from '@/lib/types';
import { SONG_POOL } from '@/lib/data';
import { useAppContext } from '@/context/app-context';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Music, Loader2, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { getTrendSummary } from '@/app/actions';
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

export function StationCard({ station }: StationCardProps) {
  const { logSong, loggedSongs, toggleFavorite } = useAppContext();
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);
  const { toast } = useToast();

  const stationSongPool = useMemo(() => SONG_POOL.filter(s => s.stationIds.includes(station.id)), [station.id]);

  const isCurrentSongFavorite = useMemo(() => {
    if (!currentSong) return false;
    const loggedVersion = loggedSongs.find(s => s.id === currentSong.id);
    return loggedVersion ? loggedVersion.isFavorite : false;
  }, [currentSong, loggedSongs]);

  const playNextSong = useCallback(() => {
    if (stationSongPool.length === 0) {
      console.warn(`No songs in pool for station: ${station.name}`);
      setIsLoading(false);
      return;
    }

    const songData = stationSongPool[Math.floor(Math.random() * stationSongPool.length)];
    const newSong: Song = {
      id: `song-${Date.now()}-${Math.random()}`,
      artist: songData.artist,
      title: songData.title,
      stationName: station.name,
      timestamp: new Date(),
      isFavorite: false,
    };
    setCurrentSong(newSong);
    logSong(newSong);
    if (isLoading) setIsLoading(false);
  }, [logSong, station.name, isLoading, stationSongPool]);

  useEffect(() => {
    playNextSong();
    const interval = setInterval(playNextSong, Math.floor(Math.random() * 10000) + 20000); // 20-30 seconds
    return () => clearInterval(interval);
  }, [playNextSong]);

  const handleFavoriteClick = () => {
    if (currentSong) {
      toggleFavorite(currentSong.id);
      const isFav = isCurrentSongFavorite;
      toast({
        title: isFav ? "Removed from Favorites" : "Added to Favorites",
        description: `${currentSong.title} by ${currentSong.artist}`,
      });
    }
  };

  const handleAnalyzeTrends = async () => {
    setIsAnalyzing(true);
    const stationHistory = loggedSongs
      .filter(s => s.stationName === station.name)
      .map(s => ({ artist: s.artist, title: s.title, timestamp: s.timestamp.toISOString() }));

    if (stationHistory.length < 3) {
      toast({
        variant: "destructive",
        title: "Not Enough Data",
        description: "Need at least 3 logged songs to analyze trends for this station.",
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
      <Card className="flex flex-col justify-between transition-all duration-300 hover:shadow-primary/20 hover:shadow-lg border-transparent bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="font-headline text-xl flex items-center gap-2">
                <station.icon className="w-6 h-6 text-primary" />
                {station.name}
              </CardTitle>
              <CardDescription>{station.genre}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-center items-center text-center animate-in fade-in duration-500">
          {isLoading ? (
            <div className="space-y-2 w-full">
              <Skeleton className="h-6 w-3/4 mx-auto" />
              <Skeleton className="h-4 w-1/2 mx-auto" />
            </div>
          ) : currentSong ? (
            <>
              <Music className="w-8 h-8 text-muted-foreground mb-4" />
              <p className="text-lg font-bold text-primary-foreground">{currentSong.title}</p>
              <p className="text-md text-muted-foreground">{currentSong.artist}</p>
            </>
          ) : (
             <p className="text-md text-muted-foreground">Station Offline</p>
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
