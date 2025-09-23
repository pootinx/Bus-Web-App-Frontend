
'use client';

import type { ItineraryResponse, ItineraryV2 } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MapPin, ArrowRight } from 'lucide-react';
import ItineraryLineCard from './ItineraryLineCard';
import ItineraryActions from './ItineraryActions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ItineraryTimeline from './ItineraryTimeline';

type ItineraryResultsProps = {
  response: ItineraryResponse;
};

export default function ItineraryResults({ response }: ItineraryResultsProps) {

  if (response.count === 0 && (!response.v2_itin || response.v2_itin.length === 0)) {
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

  const hasV2Itineraries = response.v2_itin && response.v2_itin.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <MapPin className="h-5 w-5 text-primary" />
        <span>Destination: {response.destination.name}</span>
      </div>
      <div className="w-full space-y-2">
        {hasV2Itineraries ? response.v2_itin?.map((itinerary, index) => {
          const transitStep = itinerary.steps.find(step => step.type === 'TRANSIT');
          
          return (
            <Card key={index} className="overflow-hidden transition-all duration-300">
                <ItineraryLineCard itinerary={itinerary} />
                <CardFooter className="bg-muted/50 p-2 flex-col items-stretch gap-2">
                    <Button variant="outline" className="w-full" asChild>
                        <Link href={`/itinerary/details?itinerary=${encodeURIComponent(JSON.stringify(itinerary))}`}>
                            Voir les détails
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
          );
        }) : 
        response.lines.map((line) => {
            return (
              <Card key={line.line_id} className="overflow-hidden transition-all duration-300">
                  <CardContent className="p-4">
                      <p className="font-bold text-lg">Ligne {line.route_name}</p>
                      <p>Départ à {line.start_stop_arrival_time}, arrivée à {line.arrival_time}</p>
                      <p>Durée du trajet: {line.ride_eta_min} minutes</p>
                  </CardContent>
                  <CardFooter className="bg-muted/50 p-2 flex-col items-stretch gap-2">
                      <ItineraryActions
                        routeName={line.route_name || 'N/A'}
                        startAddress={line.stops[0]?.name || response.start?.name || 'N/A'}
                        endAddress={line.stops[line.stops.length - 1]?.name || response.destination.name}
                      />
                  </CardFooter>
              </Card>
            )
        })
        }
      </div>
    </div>
  );
}
