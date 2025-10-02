'use client';

import { AppProvider, useAppContext } from '@/context/app-context';
import { Header } from '@/components/echotrack/header';
import { StationCard } from '@/components/echotrack/station-card';
import { SongHistory } from '@/components/echotrack/song-history';
import { StationSuggestions } from '@/components/echotrack/station-suggestions';
import { AddStationForm } from '@/components/echotrack/add-station-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Radio } from 'lucide-react';

function MainUI() {
  const { stations } = useAppContext();

  return (
    <div className="container mx-auto px-4 py-8">
      <Header />
      <Tabs defaultValue="stations" className="mt-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="stations">Live Stations</TabsTrigger>
          <TabsTrigger value="history">Song History</TabsTrigger>
        </TabsList>
        <TabsContent value="stations" className="mt-6">
          {stations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stations.map(station => (
                <StationCard key={station.id} station={station} />
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground border-2 border-dashed border-muted-foreground/30 rounded-lg p-12">
              <Radio className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No Stations Yet</h3>
              <p className="mt-1 text-sm">Add a station below to get started!</p>
            </div>
          )}
          <AddStationForm />
          <StationSuggestions />
        </TabsContent>
        <TabsContent value="history" className="mt-6">
          <SongHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function Dashboard() {
  return (
    <AppProvider>
      <MainUI />
    </AppProvider>
  );
}
