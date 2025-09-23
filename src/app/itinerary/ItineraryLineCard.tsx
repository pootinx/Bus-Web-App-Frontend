
'use client';

import type { ItineraryV2 } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Bus, PersonStanding, ChevronRight } from 'lucide-react';
import { getLineColor } from '@/lib/constants';

type ItineraryLineCardProps = {
  itinerary: ItineraryV2;
};

// This component now renders the SUMMARY of a V2 Itinerary
export default function ItineraryLineCard({ itinerary }: ItineraryLineCardProps) {
  
  const totalDuration = Math.round(itinerary.duration_seconds / 60);

  return (
      <div className="p-4 flex flex-col gap-3 w-full">
            <div className="flex justify-between items-start">
                <div className="font-bold text-lg">{itinerary.start_time} - {itinerary.end_time}</div>
                <div className="font-bold text-lg">~{totalDuration} min</div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                {itinerary.steps.map((step, index) => {
                    if (step.type === 'WALK') {
                        return (
                           <div key={index} className="flex items-center gap-2">
                             <PersonStanding size={18} />
                             {index < itinerary.steps.length -1 && <ChevronRight className="h-4 w-4" />}
                           </div>
                        )
                    }
                    if (step.type === 'TRANSIT') {
                        return (
                           <div key={index} className="flex items-center gap-2">
                             <Badge 
                                key={step.line_id}
                                style={{ backgroundColor: getLineColor(step.line_id!), color: 'white' }}
                                className="text-xs font-bold"
                             >
                               {step.line_name}
                             </Badge>
                             {index < itinerary.steps.length -1 && <ChevronRight className="h-4 w-4" />}
                           </div>
                        )
                    }
                    return null;
                })}
            </div>
      </div>
  );
}
