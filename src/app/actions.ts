'use server';

import { summarizeStationTrends } from '@/ai/flows/summarize-station-trends';
import { getStationNowPlaying } from '@/ai/flows/get-station-now-playing';

export async function getTrendSummary(stationName: string, songHistory: { artist: string; title: string; timestamp: string }[]) {
  if (!stationName || !songHistory || songHistory.length === 0) {
    return { summary: null, error: "Invalid input provided for trend summary." };
  }
  
  try {
    const result = await summarizeStationTrends({ stationName, songHistory });
    return { summary: result.summary, error: null };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { summary: null, error: `Failed to analyze trends: ${errorMessage}` };
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
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { song: null, error: `Server action failed: ${errorMessage}` };
    }
}
