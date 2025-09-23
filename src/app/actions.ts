'use server';

import { predictDelay, type PredictDelayInput, type PredictDelayOutput } from '@/ai/flows/real-time-delay-prediction';

export async function getDelayPrediction(input: PredictDelayInput): Promise<PredictDelayOutput> {
  try {
    const result = await predictDelay(input);
    return result;
  } catch (error) {
    console.error('Error in getDelayPrediction action:', error);
    throw new Error('Failed to predict delay. Please try again later.');
  }
}
