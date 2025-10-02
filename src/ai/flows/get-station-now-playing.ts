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
import * as https from 'https';
import { URL } from 'url';

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
        const url = new URL(streamUrl);
        const protocol = url.protocol === 'https протоколы:' ? https : http;
        
        const options = {
            hostname: url.hostname,
            port: url.port || (url.protocol === 'https:' ? 443 : 80),
            path: url.pathname + url.search,
            headers: { 
                'Icy-MetaData': '1',
                'User-Agent': 'EchoTrack/1.0',
            },
        };

        const req = protocol.get(options, (res) => {
            // Handle redirects
            if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                res.destroy();
                // To avoid infinite loops, only follow a few redirects.
                // For this implementation, we'll just follow one.
                return fetchStreamMetadata(res.headers.location).then(resolve).catch(e => resolve({ error: `Redirect failed: ${e.message}`}));
            }

            let metaInt = 0;
            if (res.headers['icy-metaint']) {
                metaInt = parseInt(res.headers['icy-metaint'] as string, 10);
            }

            if (!metaInt) {
                // Check for SHOUTcast v1 style metadata on status page
                const statusPath = url.pathname.endsWith('/') ? `${url.pathname}7.html` : `${url.pathname}/7.html`;
                const statusOptions = { ...options, path: statusPath };
                
                protocol.get(statusOptions, (statusRes) => {
                     let body = '';
                     statusRes.on('data', chunk => body += chunk);
                     statusRes.on('end', () => {
                        const match = body.match(/<body.*?>.*?Current Song: (.*?)<\/body>/ims);
                        if (match && match[1]) {
                             const streamTitle = match[1].trim();
                             const parts = streamTitle.split(' - ');
                             if (parts.length >= 2) {
                                 resolve({ artist: parts[0].trim(), title: parts.slice(1).join(' - ').trim() });
                             } else {
                                 resolve({ title: streamTitle });
                             }
                        } else {
                            resolve({ error: 'Stream does not support Icy-MetaData and is not a SHOUTcast v1 stream.' });
                        }
                     });
                }).on('error', () => {
                     resolve({ error: 'Stream does not support Icy-MetaData.' });
                });
                return;
            }
            
            let buffer = Buffer.alloc(0);
            
            const onData = (chunk: Buffer) => {
                buffer = Buffer.concat([buffer, chunk]);
                
                if (buffer.length >= metaInt) {
                    const metadataLengthByte = buffer[metaInt];
                    const metadataLength = metadataLengthByte * 16;
                    const metadataEnd = metaInt + 1 + metadataLength;

                    if (buffer.length >= metadataEnd) {
                        const metadataRaw = buffer.subarray(metaInt + 1, metadataEnd).toString('utf8');
                        const metadata = new URLSearchParams(metadataRaw.replace(/\0/g, ''));
                        const streamTitle = metadata.get('StreamTitle');

                        res.destroy(); 

                        if (streamTitle) {
                            const parts = streamTitle.split(' - ');
                            if (parts.length >= 2 && !/ad|advert|commercial/i.test(streamTitle) && streamTitle.length > 5) {
                                resolve({ artist: parts[0].trim(), title: parts.slice(1).join(' - ').trim() });
                            } else if (parts.length === 1 && !/ad|advert|commercial/i.test(streamTitle) && streamTitle.length > 5) {
                                resolve({ title: streamTitle.trim() });
                            }
                             else {
                                resolve({ error: 'Metadata does not appear to be a song title.' });
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
        });
        
        // Timeout to prevent hanging connections
        const timeout = setTimeout(() => {
            req.destroy();
            resolve({ error: 'Metadata fetch timed out.' });
        }, 5000);

        req.on('error', (e) => {
            clearTimeout(timeout);
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
        if (!metadata.title) {
            return { error: 'Could not parse song title from stream.' };
        }
        return {
            artist: metadata.artist || 'Unknown Artist',
            title: metadata.title,
        };
    } catch (e: any) {
        console.error("Error in getStationNowPlayingFlow", e);
        return { error: e.message || 'An unknown error occurred while fetching stream data.' };
    }
  }
);
