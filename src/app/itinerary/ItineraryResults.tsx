
'use client';

import type { ItineraryResponse, ItineraryV2 } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ItineraryTimeline from './ItineraryTimeline';
import { MapProvider } from '@/app/lines/details/MapProvider';

type ItineraryResultsProps = {
  itineraries: ItineraryV2[];
};

export default function ItineraryResults({ itineraries }: ItineraryResultsProps) {
  if (!itineraries || itineraries.length === 0) {
    return (
      <Card className="mt-8 text-center">
        <CardHeader>
          <CardTitle>Aucun trajet trouvé</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Essayez d'ajuster vos points de départ ou de destination.</p>
        </CardContent>
      </Card>
    );
  }

  // For now, we only display the first itinerary in the detailed view.
  // A tabbed interface could be added later to switch between options.
  const itinerary = itineraries[0];

  return (
    <div className="mt-8 h-[calc(100vh-20rem)] border rounded-lg overflow-hidden">
      <div className="flex flex-col md:flex-row h-full">
        <div className="md:w-1/3 lg:w-1/4 h-full overflow-y-auto border-r bg-card">
          <ItineraryTimeline itinerary={itinerary} />
        </div>
        <div className="flex-1 h-full">
          <MapProvider itinerary={itinerary} />
        </div>
      </div>
    </div>
  );
}
