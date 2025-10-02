'use client';

import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/context/app-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Star, Download, Music, History } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function SongHistory() {
  const { loggedSongs, toggleFavorite, exportAllSongs, exportFavoriteSongs } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const { toast } = useToast();

  const filteredSongs = useMemo(() => {
    return loggedSongs
      .filter(song => {
        if (showFavoritesOnly && !song.isFavorite) {
          return false;
        }
        if (searchTerm.trim() === '') {
          return true;
        }
        const lowercasedTerm = searchTerm.toLowerCase();
        return (
          song.title.toLowerCase().includes(lowercasedTerm) ||
          song.artist.toLowerCase().includes(lowercasedTerm) ||
          song.stationName.toLowerCase().includes(lowercasedTerm)
        );
      });
  }, [loggedSongs, searchTerm, showFavoritesOnly]);

  const handleFavoriteClick = (songId: string, title: string, artist: string, isFavorite: boolean) => {
    toggleFavorite(songId);
    toast({
      title: isFavorite ? "Removed from Favorites" : "Added to Favorites",
      description: `${title} by ${artist}`,
    });
  };

  return (
    <Card className="border-transparent bg-card/50 backdrop-blur-sm">
       <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-3">
            <History className="w-7 h-7 text-primary" />
            Song History
        </CardTitle>
        <CardDescription>
          Here you can see all the songs you've discovered. Search, filter, and export your history.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by title, artist, station..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center space-x-2">
              <Switch 
                id="favorites-only" 
                checked={showFavoritesOnly}
                onCheckedChange={setShowFavoritesOnly}
                />
              <Label htmlFor="favorites-only" className="text-primary-foreground">Favorites Only</Label>
            </div>
            <Button variant="outline" onClick={exportAllSongs} disabled={loggedSongs.length === 0}>
              <Download className="mr-2 h-4 w-4" /> Export All
            </Button>
            <Button variant="outline" onClick={exportFavoriteSongs} disabled={loggedSongs.filter(s => s.isFavorite).length === 0}>
              <Star className="mr-2 h-4 w-4" /> Export Favorites
            </Button>
          </div>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Song</TableHead>
                <TableHead>Station</TableHead>
                <TableHead className="text-right">Logged</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSongs.length > 0 ? (
                filteredSongs.map((song) => (
                  <TableRow key={song.id} className="transition-colors hover:bg-muted/20">
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleFavoriteClick(song.id, song.title, song.artist, song.isFavorite)}
                      >
                        <Star
                          className={cn(
                            'h-5 w-5 transition-all',
                            song.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-primary/50 hover:text-primary'
                          )}
                        />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-primary-foreground">{song.title}</div>
                      <div className="text-sm text-muted-foreground">{song.artist}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{song.stationName}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatDistanceToNow(new Date(song.timestamp), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Music className="w-8 h-8"/>
                        <p className="font-bold">No Songs Logged</p>
                        <p className="text-sm">Songs you hear on stations will appear here.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
