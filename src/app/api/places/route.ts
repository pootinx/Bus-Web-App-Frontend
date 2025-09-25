import { NextResponse } from 'next/server';
import { Client } from "@googlemaps/google-maps-services-js";

const client = new Client({});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get('input');
  
  if (!input) {
    return NextResponse.json({ error: 'Missing input parameter' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("Google Maps API key is not configured.");
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const response = await client.placeAutocomplete({
      params: {
        input: input,
        key: apiKey,
        // You can add more options here, like components for country restriction
        // components: ['country:ma'],
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error calling Google Places API:", error.response?.data || error.message);
    return NextResponse.json({ error: 'Failed to fetch suggestions from Google' }, { status: 500 });
  }
}
