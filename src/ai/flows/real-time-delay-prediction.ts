'use server';

/**
 * @fileOverview Predicts potential delays for a selected route using real-time traffic and historical data.
 *
 * - predictDelay - A function that handles the delay prediction process.
 * - PredictDelayInput - The input type for the predictDelay function.
 * - PredictDelayOutput - The return type for the predictDelay function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictDelayInputSchema = z.object({
  routeName: z.string().describe('The name of the bus route.'),
  startAddress: z.string().describe('The starting address of the route.'),
  endAddress: z.string().describe('The ending address of the route.'),
  currentTime: z.string().describe('The current time in HH:mm format.'),
});
export type PredictDelayInput = z.infer<typeof PredictDelayInputSchema>;

const PredictDelayOutputSchema = z.object({
  estimatedDelayMinutes: z
    .number()
    .describe(
      'The estimated delay in minutes, based on real-time traffic and historical data.'
    ),
  alternateRouteSuggestion: z
    .string()
    .optional()
    .describe(
      'A suggestion for an alternate route, if a significant delay is expected.'
    ),
  confidenceLevel: z
    .string()
    .describe(
      'A level indicating how confident the model is in its prediction (e.g., high, medium, low).'
    ),
});
export type PredictDelayOutput = z.infer<typeof PredictDelayOutputSchema>;

const getTrafficConditions = ai.defineTool(
  {
    name: 'getTrafficConditions',
    description:
      'Retrieves real-time traffic conditions for a given route and time.',
    inputSchema: z.object({
      routeName: z.string().describe('The name of the bus route.'),
      startAddress: z.string().describe('The starting address of the route.'),
      endAddress: z.string().describe('The ending address of the route.'),
      currentTime: z.string().describe('The current time in HH:mm format.'),
    }),
    outputSchema: z.string().describe('A description of the current traffic conditions.'),
  },
  async input => {
    // Simulate fetching real-time traffic conditions.
    await new Promise(resolve => setTimeout(resolve, 500));
    return `Heavy traffic reported on ${input.routeName} between ${input.startAddress} and ${input.endAddress} at ${input.currentTime}.`;
  }
);

const getHistoricalDelayData = ai.defineTool({
  name: 'getHistoricalDelayData',
  description:
    'Retrieves historical delay data for a given route, day of week, and time.',
  inputSchema: z.object({
    routeName: z.string().describe('The name of the bus route.'),
    dayOfWeek: z.string().describe('The day of the week (e.g., Monday).'),
    timeRange: z
      .string()
      .describe('The time range (e.g., 08:00-09:00) to retrieve data for.'),
  }),
  outputSchema: z
    .string()
    .describe('Historical delay data (e.g., average delay in minutes).'),
},
async input => {
    // Simulate fetching historical delay data.
    await new Promise(resolve => setTimeout(resolve, 500));
    return `Historically, route ${input.routeName} experiences an average delay of 5-10 minutes on ${input.dayOfWeek} during ${input.timeRange}.`;
  }
);

export async function predictDelay(input: PredictDelayInput): Promise<PredictDelayOutput> {
  return predictDelayFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictDelayPrompt',
  input: {schema: PredictDelayInputSchema},
  output: {schema: PredictDelayOutputSchema},
  tools: [getTrafficConditions, getHistoricalDelayData],
  prompt: `You are a transit delay prediction expert. Use real-time traffic data and historical trends to predict potential delays for a given bus route.

  Current route information:
  Route Name: {{{routeName}}}
  Start Address: {{{startAddress}}}
  End Address: {{{endAddress}}}
  Current Time: {{{currentTime}}}

  First, use the getTrafficConditions tool to retrieve real-time traffic data for the specified route and time.
  Second, use the getHistoricalDelayData tool to retrieve historical delay data for the route. Make sure you pass the proper day of week and time.

  Based on the traffic conditions and historical data, estimate the potential delay in minutes.  Also estimate a confidence level for your prediction. If you predict a significant delay (e.g., more than 15 minutes), suggest an alternate route if possible.

  Output the estimated delay in minutes, an alternate route suggestion (if applicable), and a confidence level for the prediction.
  Confidence level options are: High, Medium, Low.
  Make sure the confidence level is capitalized, and one of the options.`, 
});

const predictDelayFlow = ai.defineFlow(
  {
    name: 'predictDelayFlow',
    inputSchema: PredictDelayInputSchema,
    outputSchema: PredictDelayOutputSchema,
  },
  async input => {
    const currentDate = new Date();
    const dayOfWeek = currentDate.toLocaleDateString('en-US', {weekday: 'long'});
    const currentHour = currentDate.getHours();
    const timeRange = `${currentHour}:00-${currentHour + 1}:00`;

    // Augment input with dayOfWeek and timeRange for tool calls
    const augmentedInput = {
      ...input,
      dayOfWeek: dayOfWeek,
      timeRange: timeRange,
    };

    const {output} = await prompt(augmentedInput);
    return output!;
  }
);
