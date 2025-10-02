'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting AI radio stations based on a text prompt describing the user's music preferences.
 *
 * - suggestStationsFromPrompt - A function that takes a text prompt as input and returns a list of suggested radio stations.
 * - SuggestStationsFromPromptInput - The input type for the suggestStationsFromPrompt function.
 * - SuggestStationsFromPromptOutput - The output type for the suggestStationsFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ICONS } from '@/lib/data';

const SuggestStationsFromPromptInputSchema = z.object({
  prompt: z
    .string()
    .describe("A text prompt describing the type of music the user likes (e.g., '80s synth-pop', 'lo-fi hip hop')."),
});
export type SuggestStationsFromPromptInput = z.infer<typeof SuggestStationsFromPromptInputSchema>;


const StationSuggestionSchema = z.object({
    name: z.string().describe('The name of the radio station.'),
    genre: z.string().describe('The primary genre of the station.'),
    url: z.string().url().describe('A valid, publicly accessible, and currently LIVE audio streaming URL for the station. This MUST NOT be a website URL, but a direct link to the audio stream (e.g., ending in .mp3, .aac, or a port number).'),
    icon: z.enum(Object.keys(ICONS) as [keyof typeof ICONS, ...(keyof typeof ICONS)[]]).describe('An appropriate icon for the station based on its genre.')
});

const SuggestStationsFromPromptOutputSchema = z.object({
  stations: z
    .array(StationSuggestionSchema)
    .describe('A list of suggested AI radio stations relevant to the user\'s music preferences. Each station must have a working stream URL.'),
});
export type SuggestStationsFromPromptOutput = z.infer<typeof SuggestStationsFromPromptOutputSchema>;

export async function suggestStationsFromPrompt(input: SuggestStationsFromPromptInput): Promise<SuggestStationsFromPromptOutput> {
  return suggestStationsFromPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestStationsFromPromptPrompt',
  input: {schema: SuggestStationsFromPromptInputSchema},
  output: {schema: SuggestStationsFromPromptOutputSchema},
  prompt: `You are an AI radio station recommendation expert. Given the following music preference prompt, suggest a list of 3 relevant AI radio stations. 
  
  CRITICAL: For each station, you MUST provide a valid, currently live, and publicly accessible audio streaming URL. This must be a direct link to the audio stream itself, not a website. Prioritize URLs that are likely to support Icy-MetaData (like SHOUTcast or Icecast streams). Base the icon on the genre.

Music Preference Prompt: {{{prompt}}}

Suggested Radio Stations:`,
});

const suggestStationsFromPromptFlow = ai.defineFlow(
  {
    name: 'suggestStationsFromPromptFlow',
    inputSchema: SuggestStationsFromPromptInputSchema,
    outputSchema: SuggestStationsFromPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
