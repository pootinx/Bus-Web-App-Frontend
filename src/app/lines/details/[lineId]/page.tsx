
import { getLineColor } from '@/lib/constants';
import { getLines, getStopsByLine, getItinerary } from '@/lib/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MapProvider } from '../MapProvider';
import ItineraryTimeline from '@/app/itinerary/ItineraryTimeline';
import type { ItineraryV2 } from '@/lib/types';

type LineDetailsPageProps = {
  params: {
    lineId: string;
  };
};

// This page is now repurposed to show a detailed itinerary view
export default async function ItineraryDetailsPage({ params }: LineDetailsPageProps) {
  
  // We'll fetch a mock itinerary to build the UI, as the lineId doesn't directly map to a multi-leg itinerary.
  // This is a temporary measure to build the UI as requested.
  try {
    const itineraryResponse = await getItinerary({
        start_lat: 33.5358,
        start_lon: -7.6435,
        dest_add: 'Casa Voyageurs',
        city_id: 1, // Casablanca
    });

    const itinerary: ItineraryV2 | undefined = itineraryResponse.v2_itin?.[0];

    if (!itinerary) {
      throw new Error('No V2 itinerary found for mocking the details page.');
    }
    
    // We need to associate a line color with each step, we'll use a placeholder logic
    const color = getLineColor(parseInt(params.lineId, 10));

    return (
      <div style={{ '--line-color': color } as React.CSSProperties} className="h-[calc(100vh-4rem)]">
        <div className="flex flex-col md:flex-row h-full">
            <div className="md:w-1/3 lg:w-1/4 h-full border-r overflow-y-auto">
                <ItineraryTimeline itinerary={itinerary} />
            </div>
            <div className="flex-1 h-full">
                 <MapProvider line={{id: parseInt(params.lineId, 10), polyline: itinerary.steps.map(s => s.polyline).join('')} as any} stops={[]} />
            </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertTitle>Erreur de chargement de l'itinéraire</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : 'Une erreur est survenue.'}</AlertDescription>
        </Alert>
      </div>
    );
  }
}

export async function generateStaticParams() {
  try {
    const lines = await getLines(1); // Default to Casablanca for static generation
    return lines.map((line) => ({
      lineId: line.id.toString(),
    }));
  } catch (error) {
    console.error("Failed to generate static params for line details:", error);
    return [];
  }
}
