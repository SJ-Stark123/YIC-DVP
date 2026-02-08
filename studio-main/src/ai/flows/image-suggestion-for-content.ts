'use server';

/**
 * @fileOverview An AI agent that suggests images based on content description.
 *
 * - suggestImages - A function that suggests images based on content description.
 * - ImageSuggestionInput - The input type for the suggestImages function.
 * - ImageSuggestionOutput - The return type for the suggestImages function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImageSuggestionInputSchema = z.object({
  contentDescription: z
    .string()
    .describe('The descriptive text about the site content.'),
});
export type ImageSuggestionInput = z.infer<typeof ImageSuggestionInputSchema>;

const ImageSuggestionOutputSchema = z.object({
  suggestedImageUrls: z
    .array(z.string())
    .describe('An array of suggested image URLs.'),
});
export type ImageSuggestionOutput = z.infer<typeof ImageSuggestionOutputSchema>;

export async function suggestImages(input: ImageSuggestionInput): Promise<ImageSuggestionOutput> {
  return imageSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'imageSuggestionPrompt',
  input: {schema: ImageSuggestionInputSchema},
  output: {schema: ImageSuggestionOutputSchema},
  prompt: `You are an AI assistant that suggests image URLs based on the provided content description.

  Given the following content description, generate a list of relevant image URLs that could be used to enhance the site's visual appeal.

  Content Description: {{{contentDescription}}}

  Please provide a JSON array of image URLs.
  `,
});

const imageSuggestionFlow = ai.defineFlow(
  {
    name: 'imageSuggestionFlow',
    inputSchema: ImageSuggestionInputSchema,
    outputSchema: ImageSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
