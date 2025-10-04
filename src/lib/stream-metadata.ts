'use server';
import * as http from 'http';
import * as https from 'https';
import { URL } from 'url';

export type NowPlaying = {
  artist?: string;
  title?: string;
  error?: string;
}

async function fetchStreamMetadata(streamUrl: string, redirectCount = 0): Promise<NowPlaying> {
    if (redirectCount > 5) {
        return Promise.resolve({ error: 'Too many redirects.' });
    }

    return new Promise((resolve) => {
        let url;
        try {
            url = new URL(streamUrl);
        } catch (e: any) {
             resolve({ error: `URL parsing error: ${e.message}` });
             return;
        }

        const protocol = url.protocol === 'https:' ? https : http;
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
            const cleanup = () => {
                if (timeout) clearTimeout(timeout);
                // Ensure event listeners are removed to prevent memory leaks
                res.off('data', onData);
                res.off('end', onEnd);
                res.off('error', onError);
                try {
                  if (!res.destroyed) res.destroy();
                } catch(e) { /* ignore */ }
                try {
                  if (!req.destroyed) req.destroy();
                } catch(e) { /* ignore */ }
            };

            if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                cleanup();
                try {
                    const newUrl = new URL(res.headers.location, streamUrl).href;
                    fetchStreamMetadata(newUrl, redirectCount + 1).then(resolve).catch(e => resolve({ error: `Redirect failed: ${e.message}`}));
                } catch (e: any) {
                     resolve({ error: `URL parsing error on redirect: ${e.message}` });
                }
                return;
            }

            let metaInt = 0;
            const icyMetaIntHeader = res.headers['icy-metaint'];
            if (typeof icyMetaIntHeader === 'string') {
                metaInt = parseInt(icyMetaIntHeader, 10);
            }

            if (!metaInt) {
                cleanup();
                resolve({ error: 'Stream does not support Icy-MetaData.' });
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
                        
                        cleanup();

                        if (streamTitle) {
                            const isAd = /ad|advert|commercial|sponsor/i.test(streamTitle);
                            const justNumbers = /^\d+$/.test(streamTitle.replace(/ - /g, '').trim());

                            if (isAd || justNumbers || streamTitle.length < 5) {
                                resolve({ error: 'Metadata does not appear to be a song title.' });
                                return;
                            }

                            const parts = streamTitle.split(' - ');
                            if (parts.length >= 2) {
                                resolve({ artist: parts[0].trim(), title: parts.slice(1).join(' - ').trim() });
                            } else {
                                resolve({ title: streamTitle.trim() });
                            }
                        } else {
                            resolve({ error: 'No StreamTitle found in metadata.' });
                        }
                    }
                }
            };

            const onEnd = () => {
                cleanup();
                resolve({ error: 'Stream ended before metadata could be read.' });
            };

            const onError = (e: Error) => {
                cleanup();
                resolve({ error: `Stream error: ${e.message}` });
            };

            res.on('data', onData);
            res.on('end', onEnd);
            res.on('error', onError);
        });
        
        const timeout = setTimeout(() => {
            try {
              if(!req.destroyed) req.destroy();
            } catch(e) {/* ignore */}
            clearTimeout(timeout);
            resolve({ error: 'Metadata fetch timed out.' });
        }, 5000); // Increased timeout for stability

        req.on('error', (e) => {
            if(timeout) clearTimeout(timeout);
            resolve({ error: `Request error: ${e.message}` });
        });
        
        req.end();
    });
}

export async function getStationNowPlaying(url: string): Promise<NowPlaying> {
  try {
      new URL(url);
  } catch (e) {
      return { error: 'Invalid URL format provided.' };
  }
  
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
      console.error("Error in getStationNowPlaying", e);
      return { error: e.message || 'An unknown error occurred while fetching stream data.' };
  }
}
