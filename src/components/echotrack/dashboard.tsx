
'use client';

import React, { useState, useMemo } from 'react';
import { AppProvider, useAppContext } from '@/context/app-context';
import { Header } from '@/components/echotrack/header';
import { StationCard } from '@/components/echotrack/station-card';
import { SongHistoryDialog } from '@/components/echotrack/song-history';
import { AddStationDialog } from '@/components/echotrack/add-station-dialog';
import { Radio, Plus, ListFilter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

function MainUI() {
  const { stations } = useAppContext();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAddStationOpen, setIsAddStationOpen] = useState(false);
  const [genreFilter, setGenreFilter] = useState<string | null>(null);

  const allGenres = useMemo(() => {
    const genres = new Set(stations.map(s => s.genre));
    return Array.from(genres);
  }, [stations]);

  const filteredStations = useMemo(() => {
    if (!genreFilter) {
      return stations;
    }
    return stations.filter(station => station.genre === genreFilter);
  }, [stations, genreFilter]);

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <Header />
        
        <div className="flex justify-center gap-4 my-8">
          <AddStationDialog isOpen={isAddStationOpen} setIsOpen={setIsAddStationOpen} />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <ListFilter className="mr-2 h-4 w-4" />
                Filter by Genre
                {genreFilter && <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs">{genreFilter}</span>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Select a Genre</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked={!genreFilter} onCheckedChange={() => setGenreFilter(null)}>
                All Genres
              </DropdownMenuCheckboxItem>
              {allGenres.map(genre => (
                <DropdownMenuCheckboxItem 
                  key={genre} 
                  checked={genreFilter === genre} 
                  onCheckedChange={() => setGenreFilter(genre)}
                >
                  {genre}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <SongHistoryDialog isOpen={isHistoryOpen} setIsOpen={setIsHistoryOpen} />
        </div>

        {filteredStations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredStations.map(station => (
              <StationCard key={station.id} station={station} />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground border-2 border-dashed border-border rounded-lg p-12 mt-8 max-w-md mx-auto">
            <Radio className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">{genreFilter ? `No Stations in "${genreFilter}"` : "No Stations Yet"}</h3>
            <p className="mt-1 text-sm">{genreFilter ? 'Try a different filter or add a new station.' : 'Add a station to get started!'}</p>
            {genreFilter ? (
              <Button onClick={() => setGenreFilter(null)} className="mt-6" variant="secondary">
                <X className="mr-2 h-4 w-4" />
                Clear Filter
              </Button>
            ) : (
              <Button onClick={() => setIsAddStationOpen(true)} className="mt-6">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Station
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export function Dashboard() {
  return (
    <AppProvider>
      <MainUI />
    </AppProvider>
  );
}
