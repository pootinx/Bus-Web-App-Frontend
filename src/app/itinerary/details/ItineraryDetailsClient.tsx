
'use client';

import { useSearchParams } from 'next/navigation';
import type { ItineraryV2 } from '@/lib/types';
import { ItineraryTimeline } from '../ItineraryTimeline';
import { MapProvider } from '@/app/lines/details/MapProvider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getLineColor } from '@/lib/constants';

export function ItineraryDetailsClient() {
  const searchParams = useSearchParams();
  const itineraryParam = searchParams.get('itinerary');

  if (!itineraryParam) {
    return (
        <div className="container py-8">
            <Alert variant="destructive">
            <AlertTitle>Aucune donnée d'itinéraire</AlertTitle>
            <AlertDescription>Impossible de charger les détails de l'itinéraire. Veuillez réessayer.</AlertDescription>
            </Alert>
        </div>
    );
  }

  let itinerary: ItineraryV2;
  try {
    itinerary = JSON.parse(decodeURIComponent(itineraryParam));
  } catch (error) {
     return (
        <div className="container py-8">
            <Alert variant="destructive">
            <AlertTitle>Données d'itinéraire invalides</AlertTitle>
            <AlertDescription>Le format des données de l'itinéraire est incorrect.</AlertDescription>
            </Alert>
        </div>
    );
  }
  
  // We need a primary color for the details view. We can pick the first transit line's color.
  const firstTransitStep = itinerary.steps.find(step => step.type === 'TRANSIT');
  const color = getLineColor(firstTransitStep?.line_id || 0);

  return (
    <div style={{ '--line-color': color } as React.CSSProperties} className="h-[calc(100vh-4rem)]">
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
