
'use server';

import { NextResponse } from 'next/server';
import type { BusLine } from '@/lib/types';

const BASE_URL = 'https://tobis-backend.onrender.com';

// This route acts as a proxy to fetch line details from the server-side, avoiding CORS issues.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lineIdParam = searchParams.get('line_id');
  console.log('[API_LINE_DETAILS_PROXY] Received request for line_id:', lineIdParam);

  if (!lineIdParam) {
    console.error('[API_LINE_DETAILS_PROXY] Missing line_id parameter');
    return NextResponse.json({ error: 'Missing line_id parameter' }, { status: 400 });
  }
  
  const lineId = parseInt(lineIdParam, 10);
   if (isNaN(lineId)) {
    console.error('[API_LINE_DETAILS_PROXY] Invalid line_id parameter');
    return NextResponse.json({ error: 'Invalid line_id parameter' }, { status: 400 });
  }

  try {
    const url = `${BASE_URL}/station/lines`;
    console.log('[API_LINE_DETAILS_PROXY] Fetching all lines from external API to find details for line_id:', lineId);
    const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[API_LINE_DETAILS_PROXY] Error fetching from external API (${response.status}): ${errorText}`);
        throw new Error(`External API request failed with status ${response.status}`);
    }

    const externalData = await response.json();
    const allLines: BusLine[] = (externalData && externalData.example) ? externalData.example : externalData;

    const lineDetails = allLines.find(line => line.id === lineId);

    if (!lineDetails) {
      console.error('[API_LINE_DETAILS_PROXY] Line not found for line_id:', lineId);
      return NextResponse.json({ error: `Line with ID ${lineId} not found` }, { status: 404 });
    }
    
    console.log('[API_LINE_DETAILS_PROXY] Successfully found line details:', lineDetails);
    return NextResponse.json(lineDetails);
  } catch (error) {
    console.error('[API_LINE_DETAILS_PROXY] Internal error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Internal server error.', details: errorMessage }, { status: 500 });
  }
}
