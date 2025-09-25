
'use client';

import ItinerarySearch from '@/app/itinerary/ItinerarySearch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CardDescription } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-center">Itinéraire</CardTitle>
          <CardDescription className="text-center">Trouvez le meilleur itinéraire pour votre trajet en bus.</CardDescription>
        </CardHeader>
        <CardContent>
            <ItinerarySearch />
        </CardContent>
      </Card>
    </div>
  );
}
