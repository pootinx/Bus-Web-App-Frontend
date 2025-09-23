
'use client';

import type { ItineraryResponse } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MapPin } from 'lucide-react';
import ItineraryLineCard from './ItineraryLineCard';
import ItineraryTimeline from './ItineraryTimeline';
import ItineraryActions from './ItineraryActions';

type ItineraryResultsProps = {
  response: ItineraryResponse;
};

export default function ItineraryResults({ response }: ItineraryResultsProps) {
  if (response.count === 0 && response.v2_itin?.length === 0) {
    return (
      <Card className="text-center">
        <CardHeader>
          <CardTitle>Aucun trajet trouvé</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Essayez d'ajuster vos points de départ ou de destination.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <MapPin className="h-5 w-5 text-primary" />
        <span>Destination: {response.destination.name}</span>
      </div>
      <div className="w-full space-y-2">
        {response.v2_itin?.map((itinerary, index) => {
            const transitStep = itinerary.steps.find(step => step.type === 'TRANSIT');
            return (
                <Card key={index} className="hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-0">
                        <ItineraryLineCard itinerary={itinerary} />
                        <Separator />
                        <ItineraryTimeline itinerary={itinerary} />
                    </CardContent>
                     {transitStep && (
                        <CardFooter className="bg-muted/50 p-2">
                           <ItineraryActions 
                             routeName={transitStep.line_name || 'N/A'}
                             startAddress={itinerary.steps[0].start_stop_name}
                             endAddress={itinerary.steps[itinerary.steps.length - 1].end_stop_name}
                           />
                        </CardFooter>
                     )}
                </Card>
            )
        })}
      </div>
    </div>
  );
}
