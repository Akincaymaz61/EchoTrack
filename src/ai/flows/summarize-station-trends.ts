'use server';

/**
 * @fileOverview Summarizes the trends of songs played on a radio station.
 *
 * - summarizeStationTrends - A function that summarizes song trends for a radio station.
 * - SummarizeStationTrendsInput - The input type for the summarizeStationTrends function.
 * - SummarizeStationTrendsOutput - The return type for the summarizeStationTrends function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeStationTrendsInputSchema = z.object({
  stationName: z.string().describe('The name of the radio station.'),
  songHistory: z.array(
    z.object({
      artist: z.string(),
      title: z.string(),
      timestamp: z.string(),
    })
  ).describe('The history of songs played on the station.'),
});
export type SummarizeStationTrendsInput = z.infer<typeof SummarizeStationTrendsInputSchema>;

const SummarizeStationTrendsOutputSchema = z.object({
  summary: z.string().describe('A summary of the trends and characteristics of the songs played on the station.'),
});
export type SummarizeStationTrendsOutput = z.infer<typeof SummarizeStationTrendsOutputSchema>;

export async function summarizeStationTrends(input: SummarizeStationTrendsInput): Promise<SummarizeStationTrendsOutput> {
  return summarizeStationTrendsFlow(input);
}

const summarizeStationTrendsPrompt = ai.definePrompt({
  name: 'summarizeStationTrendsPrompt',
  input: {schema: SummarizeStationTrendsInputSchema},
  output: {schema: SummarizeStationTrendsOutputSchema},
  prompt: `You are an expert music analyst. Analyze the song history of a radio station and summarize its overall trends and characteristics.

Station Name: {{{stationName}}}
Song History:
{{#each songHistory}}
- {{{title}}} by {{{artist}}} ({{{timestamp}}})
{{/each}}

Summary:`,
});

const summarizeStationTrendsFlow = ai.defineFlow(
  {
    name: 'summarizeStationTrendsFlow',
    inputSchema: SummarizeStationTrendsInputSchema,
    outputSchema: SummarizeStationTrendsOutputSchema,
  },
  async input => {
    const {output} = await summarizeStationTrendsPrompt(input);
    return output!;
  }
);
