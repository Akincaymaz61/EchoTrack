
'use client';

import React, { useState } from 'react';
import { useActionState } from 'react';
import { getStationSuggestions, StationSuggestionState } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Sparkles, Loader2, Bot, PlusCircle, Globe } from 'lucide-react';
import { useAppContext } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import type { Station } from '@/lib/types';

const initialState: StationSuggestionState = {
  stations: [],
  message: '',
};

export function StationSuggestions() {
  const [state, formAction, isPending] = useActionState(getStationSuggestions, initialState);
  const [prompt, setPrompt] = useState('');
  const { addStation } = useAppContext();
  const { toast } = useToast();
  
  const handleAddStation = (station: Omit<Station, 'id'>) => {
    addStation(station);
    toast({
        title: "Station Added!",
        description: `${station.name} has been added to your list.`,
    });
  }

  return (
    <Card className="mt-12 border-transparent bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-3">
            <Bot className="w-7 h-7 text-primary" />
            Find New Stations
        </CardTitle>
        <CardDescription>
          Describe a music genre, artist, or vibe, and our AI will suggest working radio stations for you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col md:flex-row gap-2">
          <Input
            name="prompt"
            placeholder="e.g., '80s synth-pop', 'lo-fi hip hop for studying'"
            className="flex-grow"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            required
            disabled={isPending}
          />
          <Button type="submit" disabled={!prompt || isPending}>
             {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {isPending ? 'Suggesting...' : 'Suggest Stations'}
          </Button>
        </form>

        {isPending && (
          <div className="mt-6 flex items-center justify-center text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            <span>Finding stations... This may take a moment.</span>
          </div>
        )}

        {state.stations && state.stations.length > 0 && (
          <div className="mt-6">
            <h4 className="font-bold text-lg text-primary-foreground mb-3">AI Suggestions:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.stations.map((station, index) => (
                <Card key={index} className="bg-background/40">
                  <CardHeader>
                    <CardTitle className="text-base">{station.name}</CardTitle>
                    <CardDescription>{station.genre}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground break-all">
                      <div className="flex items-center gap-2">
                        <Globe className="w-3 h-3"/>
                        <span className="truncate">{station.url}</span>
                      </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleAddStation(station)}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add to My Stations
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {state.message && !isPending && state.message !== 'success' && (
          <p className="mt-4 text-destructive">{state.message}</p>
        )}
      </CardContent>
    </Card>
  );
}
