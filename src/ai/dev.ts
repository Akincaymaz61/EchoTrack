import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-station-trends.ts';
import '@/ai/flows/suggest-stations-from-prompt.ts';
import '@/ai/flows/get-station-now-playing.ts';
