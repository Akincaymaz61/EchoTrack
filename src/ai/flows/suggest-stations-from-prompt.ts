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

const SuggestStationsFromPromptInputSchema = z.object({
  prompt: z
    .string()
    .describe("A text prompt describing the type of music the user likes (e.g., '80s synth-pop', 'lo-fi hip hop')."),
});
export type SuggestStationsFromPromptInput = z.infer<typeof SuggestStationsFromPromptInputSchema>;

const SuggestStationsFromPromptOutputSchema = z.object({
  stations: z
    .array(z.string())
    .describe('A list of suggested AI radio stations relevant to the user\s music preferences.'),
});
export type SuggestStationsFromPromptOutput = z.infer<typeof SuggestStationsFromPromptOutputSchema>;

export async function suggestStationsFromPrompt(input: SuggestStationsFromPromptInput): Promise<SuggestStationsFromPromptOutput> {
  return suggestStationsFromPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestStationsFromPromptPrompt',
  input: {schema: SuggestStationsFromPromptInputSchema},
  output: {schema: SuggestStationsFromPromptOutputSchema},
  prompt: `You are an AI radio station recommendation expert. Given the following music preference prompt, suggest a list of relevant AI radio stations. The output should be a JSON array of strings representing the names of suggested radio stations.

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
