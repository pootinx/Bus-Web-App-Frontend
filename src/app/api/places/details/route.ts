import { NextResponse } from 'next/server';
import { Client } from "@googlemaps/google-maps-services-js";

const client = new Client({});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get('placeId');
  
  if (!placeId) {
    return NextResponse.json({ error: 'Missing placeId parameter' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("Google Maps API key is not configured.");
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const response = await client.placeDetails({
      params: {
        place_id: placeId,
        key: apiKey,
        fields: ['geometry.location', 'name', 'formatted_address'],
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error calling Google Place Details API:", error.response?.data || error.message);
    return NextResponse.json({ error: 'Failed to fetch place details from Google' }, { status: 500 });
  }
}
