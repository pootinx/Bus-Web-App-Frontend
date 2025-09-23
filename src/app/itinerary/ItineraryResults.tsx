
'use client';

import type { ItineraryResponse } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MapPin } from 'lucide-react';
import ItineraryLineCard from './ItineraryLineCard';
import ItineraryTimeline from './ItineraryTimeline';
import ItineraryActions from './ItineraryActions';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

type ItineraryResultsProps = {
  response: ItineraryResponse;
};

export default function ItineraryResults({ response }: ItineraryResultsProps) {
  const [expandedItinerary, setExpandedItinerary] = useState<number | null>(0); // Expand the first one by default

  const toggleItinerary = (index: number) => {
    setExpandedItinerary(expandedItinerary === index ? null : index);
  };

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
          const isExpanded = expandedItinerary === index;

          return (
            <Card key={index} className="overflow-hidden transition-all duration-300">
              <div onClick={() => toggleItinerary(index)} className="cursor-pointer">
                <ItineraryLineCard itinerary={itinerary} />
              </div>
              
              {isExpanded && (
                <CardContent className="p-0">
                  <Separator />
                  <ItineraryTimeline itinerary={itinerary} />
                </CardContent>
              )}

              <CardFooter className="bg-muted/50 p-2 flex-col items-stretch gap-2">
                {transitStep && isExpanded && (
                  <ItineraryActions
                    routeName={transitStep.line_name || 'N/A'}
                    startAddress={itinerary.steps[0].start_stop_name}
                    endAddress={itinerary.steps[itinerary.steps.length - 1].end_stop_name}
                  />
                )}
                <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={() => toggleItinerary(index)}>
                  {isExpanded ? 'Voir moins' : 'Voir les détails'}
                  {isExpanded ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                </Button>
              </CardFooter>
            </Card>
          );
        }) : 
        response.lines.map((line, index) => {
            // Fallback for V1
            const isExpanded = expandedItinerary === index;
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
