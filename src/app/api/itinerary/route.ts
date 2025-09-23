import { NextResponse } from 'next/server';
import { getItinerary, type GetItineraryParams } from '@/lib/api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  console.log('[API_ITINERARY_PROXY] Received request:', request.url);

  const params: GetItineraryParams = {
    dest_add: searchParams.get('dest_add') || '',
    city_id: parseInt(searchParams.get('city_id') || '0', 10),
    start_add: searchParams.get('start_add') || undefined,
    start_lat: searchParams.get('start_lat') ? parseFloat(searchParams.get('start_lat')!) : undefined,
    start_lon: searchParams.get('start_lon') ? parseFloat(searchParams.get('start_lon')!) : undefined,
  };
  console.log('[API_ITINERARY_PROXY] Parsed params:', params);


  if (!params.dest_add || !params.city_id) {
    console.error('[API_ITINERARY_PROXY] Missing required parameters');
    return NextResponse.json({ error: 'Missing required parameters: dest_add and city_id' }, { status: 400 });
  }

  try {
    console.log('[API_ITINERARY_PROXY] Fetching itinerary from external API...');
    const data = await getItinerary(params);
    console.log('[API_ITINERARY_PROXY] Successfully fetched itinerary:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API_ITINERARY_PROXY] Error fetching itinerary:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch itinerary from external API.', details: errorMessage }, { status: 500 });
  }
}
