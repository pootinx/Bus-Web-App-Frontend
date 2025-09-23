import { NextResponse } from 'next/server';
import type { BusLine } from '@/lib/types';

const BASE_URL = 'https://tobis-backend.onrender.com';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lineId = searchParams.get('line_id');
  console.log('[API_LINE_DETAILS_PROXY] Received request for line_id:', lineId);

  if (!lineId) {
    console.error('[API_LINE_DETAILS_PROXY] Missing line_id parameter');
    return NextResponse.json({ error: 'Missing line_id parameter' }, { status: 400 });
  }

  try {
    const apiUrl = `${BASE_URL}/station/line-details?line_id=${lineId}`;
    console.log('[API_LINE_DETAILS_PROXY] Fetching from external API:', apiUrl);
    
    const response = await fetch(apiUrl, { next: { revalidate: 3600 } }); // Cache for 1 hour

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[API_LINE_DETAILS_PROXY] External API error (${response.status}):`, errorText);
        return NextResponse.json({ error: 'Failed to fetch line details from external API.', details: errorText }, { status: response.status });
    }

    const data = await response.json();
    
    // The external API returns an array, we want the first element
    const lineDetails: BusLine[] = (data && data.example) ? data.example : data;

    if (!lineDetails || lineDetails.length === 0) {
      console.error('[API_LINE_DETAILS_PROXY] Line not found from external API for line_id:', lineId);
      return NextResponse.json({ error: `Line with ID ${lineId} not found` }, { status: 404 });
    }
    
    console.log('[API_LINE_DETAILS_PROXY] Successfully fetched line details:', lineDetails[0]);
    return NextResponse.json(lineDetails[0]);
  } catch (error) {
    console.error('[API_LINE_DETAILS_PROXY] Internal error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Internal server error.', details: errorMessage }, { status: 500 });
  }
}
