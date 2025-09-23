
'use client';

import type { ItineraryResponse } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import ItineraryLineCard from './ItineraryLineCard';
import ItineraryTimeline from './ItineraryTimeline';

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
      <Accordion type="single" collapsible className="w-full space-y-2">
        {response.v2_itin?.map((itinerary, index) => (
          <AccordionItem value={`item-${index}`} key={index} className="border-b-0">
             <Card className="hover:shadow-lg transition-all duration-200">
                <AccordionTrigger className="p-0 hover:no-underline group">
                    <ItineraryLineCard itinerary={itinerary} />
                </AccordionTrigger>
                <AccordionContent>
                    <ItineraryTimeline itinerary={itinerary} />
                </AccordionContent>
             </Card>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
