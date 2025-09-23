
'use client';

import type { ItineraryV2 } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Clock, Bus, PersonStanding, ChevronRight } from 'lucide-react';
import { getLineColor } from '@/lib/constants';

type ItineraryLineCardProps = {
  itinerary: ItineraryV2;
};

// This component now renders the SUMMARY of a V2 Itinerary
export default function ItineraryLineCard({ itinerary }: ItineraryLineCardProps) {
  
  const totalDuration = Math.round(itinerary.duration_seconds / 60);

  const transitSteps = itinerary.steps.filter(step => step.type === 'TRANSIT');

  return (
      <div className="p-4 flex items-center justify-between gap-4 w-full">
          <div className="flex flex-col gap-3 flex-grow">
              <div className="flex justify-between items-start">
                  <div className="font-bold text-lg">{itinerary.start_time} - {itinerary.end_time}</div>
                  <div className="font-bold text-lg">~{totalDuration} min</div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                  <PersonStanding size={18} />
                  {transitSteps.map((step, index) => (
                      <>
                        <ChevronRight className="h-4 w-4" />
                        <Badge 
                            key={step.line_id}
                            style={{ backgroundColor: getLineColor(step.line_id), color: 'white' }}
                            className="text-xs"
                        >
                           {step.line_name}
                        </Badge>
                      </>
                  ))}
                  <ChevronRight className="h-4 w-4" />
                  <PersonStanding size={18} />
              </div>
          </div>
          <ChevronRight className="h-6 w-6 text-muted-foreground flex-shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
      </div>
  );
}
