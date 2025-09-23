'use client';

import ItinerarySearch from '@/app/itinerary/ItinerarySearch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { APIProvider } from '@vis.gl/react-google-maps';

export default function Home() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-center">Itinéraire</CardTitle>
        </CardHeader>
        <CardContent>
          <APIProvider apiKey={apiKey!}>
            <ItinerarySearch />
          </APIProvider>
        </CardContent>
      </Card>
    </div>
  );
}
