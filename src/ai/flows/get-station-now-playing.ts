'use server';

/**
 * @fileOverview Fetches the currently playing song from a radio stream URL.
 *
 * - getStationNowPlaying - A function that takes a stream URL and attempts to fetch the "Now Playing" metadata.
 * - GetStationNowPlayingInput - The input type for the function.
 * - GetStationNowPlayingOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as http from 'http';
import { Stream } from 'stream';

const GetStationNowPlayingInputSchema = z.object({
  url: z.string().url().describe('The URL of the radio stream.'),
});
export type GetStationNowPlayingInput = z.infer<typeof GetStationNowPlayingInputSchema>;

const GetStationNowPlayingOutputSchema = z.object({
  artist: z.string().optional(),
  title: z.string().optional(),
  error: z.string().optional(),
});
export type GetStationNowPlayingOutput = z.infer<typeof GetStationNowPlayingOutputSchema>;


export async function getStationNowPlaying(input: GetStationNowPlayingInput): Promise<GetStationNowPlayingOutput> {
  return getStationNowPlayingFlow(input);
}


async function fetchStreamMetadata(streamUrl: string): Promise<{ artist?: string; title?: string; error?: string }> {
    return new Promise((resolve) => {
        const req = http.get(streamUrl, { headers: { 'Icy-MetaData': '1' } }, (res) => {
            let metaInt = 0;
            if (res.headers['icy-metaint']) {
                metaInt = parseInt(res.headers['icy-metaint'] as string, 10);
            }

            if (!metaInt) {
                res.destroy();
                return resolve({ error: 'Stream does not support metadata.' });
            }
            
            let buffer = Buffer.alloc(0);
            
            const onData = (chunk: Buffer) => {
                buffer = Buffer.concat([buffer, chunk]);
                
                if (buffer.length >= metaInt) {
                    // We have enough data to potentially read metadata
                    const metadataLengthByte = buffer[metaInt];
                    const metadataLength = metadataLengthByte * 16;
                    const metadataEnd = metaInt + 1 + metadataLength;

                    if (buffer.length >= metadataEnd) {
                        const metadataRaw = buffer.subarray(metaInt + 1, metadataEnd).toString('utf8');
                        const metadata = new URLSearchParams(metadataRaw.replace(/\0/g, ''));
                        const streamTitle = metadata.get('StreamTitle');

                        res.destroy(); // We got what we needed, close connection

                        if (streamTitle) {
                            const parts = streamTitle.split(' - ');
                            // Basic filter for ads/jingles: requires a separator and avoids common non-song patterns.
                            if (parts.length >= 2 && !streamTitle.toLowerCase().includes('advertising') && !streamTitle.toLowerCase().includes('commercial')) {
                                resolve({ artist: parts[0].trim(), title: parts.slice(1).join(' - ').trim() });
                            } else if (parts.length < 2) {
                                resolve({ error: 'Not a song title.' });
                            }
                             else {
                                resolve({ title: streamTitle.trim() });
                            }
                        } else {
                            resolve({ error: 'No StreamTitle found in metadata.' });
                        }
                    }
                }
            };

            res.on('data', onData);
            
            res.on('end', () => {
                resolve({ error: 'Stream ended before metadata could be read.' });
            });

            // Timeout to prevent hanging connections
            setTimeout(() => {
                res.destroy();
                resolve({ error: 'Metadata fetch timed out.' });
            }, 5000); // 5 seconds timeout
        });

        req.on('error', (e) => {
            resolve({ error: `Request error: ${e.message}` });
        });
        
        req.end();
    });
}


const getStationNowPlayingFlow = ai.defineFlow(
  {
    name: 'getStationNowPlayingFlow',
    inputSchema: GetStationNowPlayingInputSchema,
    outputSchema: GetStationNowPlayingOutputSchema,
  },
  async ({ url }) => {
    try {
        const metadata = await fetchStreamMetadata(url);
        if (metadata.error) {
            return { error: metadata.error };
        }
        if (!metadata.artist || !metadata.title) {
            return { error: 'Could not parse artist and title.' };
        }
        return {
            artist: metadata.artist,
            title: metadata.title,
        };
    } catch (e: any) {
        console.error("Error in getStationNowPlayingFlow", e);
        return { error: e.message || 'An unknown error occurred while fetching stream data.' };
    }
  }
);
