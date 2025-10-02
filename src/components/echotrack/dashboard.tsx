'use client';

import { AppProvider, useAppContext } from '@/context/app-context';
import { Header } from '@/components/echotrack/header';
import { StationCard } from '@/components/echotrack/station-card';
import { SongHistory } from '@/components/echotrack/song-history';
import { StationSuggestions } from '@/components/echotrack/station-suggestions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { STATIONS } from '@/lib/data';

function MainUI() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Header />
      <Tabs defaultValue="stations" className="mt-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="stations">Live Stations</TabsTrigger>
          <TabsTrigger value="history">Song History</TabsTrigger>
        </TabsList>
        <TabsContent value="stations" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {STATIONS.map(station => (
              <StationCard key={station.id} station={station} />
            ))}
          </div>
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
