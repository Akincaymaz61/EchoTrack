'use server';

import { getStationNowPlaying } from '@/lib/stream-metadata';

export async function fetchNowPlaying(url: string) {
    if (!url) {
        return { song: null, error: "No URL provided." };
    }

    try {
        const result = await getStationNowPlaying(url);
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
