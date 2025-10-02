'use client';

import React, { useState } from 'react';
import { AppProvider, useAppContext } from '@/context/app-context';
import { Header } from '@/components/echotrack/header';
import { StationCard } from '@/components/echotrack/station-card';
import { SongHistoryDialog } from '@/components/echotrack/song-history';
import { AddStationDialog } from '@/components/echotrack/add-station-dialog';
import { Radio, History, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

function MainUI() {
  const { stations } = useAppContext();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAddStationOpen, setIsAddStationOpen] = useState(false);

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <Header />
        
        <div className="flex justify-center gap-4 my-8">
          <AddStationDialog isOpen={isAddStationOpen} setIsOpen={setIsAddStationOpen} />
          <SongHistoryDialog isOpen={isHistoryOpen} setIsOpen={setIsHistoryOpen} />
        </div>

        {stations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {stations.map(station => (
              <StationCard key={station.id} station={station} />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground border-2 border-dashed border-border rounded-lg p-12 mt-8 max-w-md mx-auto">
            <Radio className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No Stations Yet</h3>
            <p className="mt-1 text-sm">Add a station to get started!</p>
            <Button onClick={() => setIsAddStationOpen(true)} className="mt-6">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Station
            </Button>
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
