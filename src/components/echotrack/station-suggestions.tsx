'use client';

import React, { useState } from 'react';
import { useFormState } from 'react-dom';
import { getStationSuggestions } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2, Bot } from 'lucide-react';

const initialState = {
  stations: [],
  message: '',
};

export function StationSuggestions() {
  const [state, formAction] = useFormState(getStationSuggestions, initialState);
  const [prompt, setPrompt] = useState('');
  
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formAction(formData);
  };

  return (
    <Card className="mt-12 border-transparent bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-3">
            <Bot className="w-7 h-7 text-primary" />
            Find New Stations
        </CardTitle>
        <CardDescription>
          Describe a music genre, artist, or vibe, and our AI will suggest stations for you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2">
          <Input
            name="prompt"
            placeholder="e.g., '80s synth-pop', 'lo-fi hip hop for studying'"
            className="flex-grow"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            required
          />
          <Button type="submit" disabled={!prompt}>
             <Sparkles className="mr-2 h-4 w-4" />
            Suggest Stations
          </Button>
        </form>

        {state.message === 'loading' && (
          <div className="mt-4 flex items-center justify-center text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            <span>Finding stations...</span>
          </div>
        )}

        {state.stations && state.stations.length > 0 && (
          <div className="mt-6">
            <h4 className="font-bold text-lg text-primary-foreground mb-2">Suggested Stations:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              {state.stations.map((station, index) => (
                <li key={index}>{station}</li>
              ))}
            </ul>
          </div>
        )}

        {state.message && state.message !== 'success' && state.message !== 'loading' && (
          <p className="mt-4 text-destructive">{state.message}</p>
        )}
      </CardContent>
    </Card>
  );
}
