'use client';

import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/context/app-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Star, Download, Music, History, Trash2, ChevronDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function SongHistoryDialog({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (open: boolean) => void }) {
  const { loggedSongs, toggleFavorite, exportAllSongs, exportFavoriteSongs, exportStationSongs, clearHistory } = useAppContext();
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
  
  const handleClearHistory = () => {
    clearHistory();
    toast({
      title: "History Cleared",
      description: "All logged songs have been removed.",
    });
  }

  const stationNamesFromHistory = useMemo(() => {
    return [...new Set(loggedSongs.map(s => s.stationName))]
  }, [loggedSongs]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <History className="mr-2 h-4 w-4" /> View History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-3">
            <History className="w-7 h-7 text-primary" />
            Song History
          </DialogTitle>
          <DialogDescription>
            Here you can see all the songs you've discovered. Search, filter, and export your history.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col md:flex-row gap-4 justify-between items-center py-4">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by title, artist, station..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
             <div className="flex items-center space-x-2">
              <Switch 
                id="favorites-only" 
                checked={showFavoritesOnly}
                onCheckedChange={setShowFavoritesOnly}
                />
              <Label htmlFor="favorites-only">Favorites Only</Label>
            </div>
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" /> Export <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={exportAllSongs} disabled={loggedSongs.length === 0}>
                  Export All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportFavoriteSongs} disabled={loggedSongs.filter(s => s.isFavorite).length === 0}>
                  <Star className="mr-2 h-4 w-4" /> Export Favorites
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Export by Station</DropdownMenuLabel>
                {stationNamesFromHistory.map(stationName => (
                  <DropdownMenuItem key={stationName} onClick={() => exportStationSongs(stationName)}>
                    {stationName}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                 <Button variant="destructive" disabled={loggedSongs.length === 0}>
                  <Trash2 className="mr-2 h-4 w-4" /> Clear
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to clear the history?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all {loggedSongs.length} logged songs.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearHistory}>Clear History</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        <div className="flex-grow overflow-y-auto rounded-lg border">
          <Table>
            <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-10">
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
                  <TableCell colSpan={4} className="h-48 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Music className="w-10 h-10"/>
                        <p className="font-semibold text-lg mt-2">No Songs Logged Yet</p>
                        <p className="text-sm">Songs you discover on stations will appear here.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
