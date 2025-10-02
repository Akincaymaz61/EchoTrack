'use server';

import { suggestStationsFromPrompt, SuggestStationsFromPromptOutput } from '@/ai/flows/suggest-stations-from-prompt';
import { summarizeStationTrends } from '@/ai/flows/summarize-station-trends';
import { getStationNowPlaying } from '@/ai/flows/get-station-now-playing';
import { z } from 'zod';

const suggestionSchema = z.object({
  prompt: z.string().min(3, 'Prompt must be at least 3 characters long.'),
});

export type StationSuggestionState = {
    stations: SuggestStationsFromPromptOutput['stations'];
    message: string;
}

export async function getStationSuggestions(prevState: StationSuggestionState, formData: FormData): Promise<StationSuggestionState> {
  const validatedFields = suggestionSchema.safeParse({
    prompt: formData.get('prompt'),
  });

  if (!validatedFields.success) {
    return {
      stations: [],
      message: validatedFields.error.flatten().fieldErrors.prompt?.[0] || 'Invalid prompt.',
    };
  }

  try {
    const result = await suggestStationsFromPrompt({ prompt: validatedFields.data.prompt });
    if (!result || result.stations.length === 0) {
        return { stations: [], message: 'No suggestions found for this prompt.' };
    }
    return {
      stations: result.stations,
      message: 'success',
    };
  } catch (error) {
    console.error(error);
    return {
      stations: [],
      message: 'AI service failed to get suggestions. Please try again later.',
    };
  }
}

export async function getTrendSummary(stationName: string, songHistory: { artist: string; title: string; timestamp: string }[]) {
  if (!stationName || !songHistory || songHistory.length === 0) {
    return { summary: null, error: "Invalid input provided for trend summary." };
  }
  
  try {
    const result = await summarizeStationTrends({ stationName, songHistory });
    return { summary: result.summary, error: null };
  } catch (error) {
    console.error(error);
    return { summary: null, error: 'Failed to analyze trends due to an AI service error.' };
  }
}

export async function fetchNowPlaying(url: string) {
    if (!url) {
        return { song: null, error: "No URL provided." };
    }

    try {
        const result = await getStationNowPlaying({ url });
        if (result.error) {
            return { song: null, error: result.error };
        }
        if(result.title) {
            return { song: { title: result.title, artist: result.artist || 'Unknown Artist' }, error: null };
        }
        return { song: null, error: "Could not retrieve song information." };
    } catch (error) {
        console.error(error);
        return { song: null, error: 'Server action failed to get now playing info.' };
    }
}
