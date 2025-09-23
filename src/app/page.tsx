import ItinerarySearch from '@/app/itinerary/ItinerarySearch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-center">Itinéraire</CardTitle>
        </CardHeader>
        <CardContent>
          <ItinerarySearch />
        </CardContent>
      </Card>
    </div>
  );
}
