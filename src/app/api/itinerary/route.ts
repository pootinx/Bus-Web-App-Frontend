import { NextResponse } from 'next/server';
import { getItinerary, type GetItineraryParams } from '@/lib/api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const params: GetItineraryParams = {
    dest_add: searchParams.get('dest_add') || '',
    city_id: parseInt(searchParams.get('city_id') || '0', 10),
    start_add: searchParams.get('start_add') || undefined,
    start_lat: searchParams.get('start_lat') ? parseFloat(searchParams.get('start_lat')!) : undefined,
    start_lon: searchParams.get('start_lon') ? parseFloat(searchParams.get('start_lon')!) : undefined,
  };

  if (!params.dest_add || !params.city_id) {
    return NextResponse.json({ error: 'Missing required parameters: dest_add and city_id' }, { status: 400 });
  }

  try {
    const data = await getItinerary(params);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API_ITINERARY_ERROR]', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch itinerary from external API.', details: errorMessage }, { status: 500 });
  }
}
