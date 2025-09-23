'use client';

import { ItineraryLine } from '@/lib/types';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Clock, Bus, Milestone, Dot } from 'lucide-react';
import { getLineColor } from '@/lib/constants';
import DelayPrediction from './DelayPrediction';

type ItineraryLineCardProps = {
  line: ItineraryLine;
};

export default function ItineraryLineCard({ line }: ItineraryLineCardProps) {
  const color = getLineColor(line.line_id);

  return (
    <AccordionItem value={`line-${line.line_id}`} className="rounded-lg border bg-card shadow-sm">
      <AccordionTrigger className="p-4 hover:no-underline">
        <div className="flex w-full items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0" style={{ color }}>
                <Bus size={32} />
            </div>
            <div>
              <Badge style={{ backgroundColor: color, color: 'white' }} className="mb-1">{line.route_name}</Badge>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span>{line.start_stop_arrival_time}</span>
                <span>&rarr;</span>
                <span>{line.arrival_time}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>~{line.ride_eta_min} min</span>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-4 pt-0">
        <div className="space-y-4">
            <div className="relative pl-6">
                {line.stops.map((stop, index) => (
                <div key={stop.id} className="relative flex gap-4 py-2">
                    <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                        <Dot className="h-6 w-6 text-primary" />
                    </div>
                     {index < line.stops.length -1 && <div className="absolute left-0 top-1/2 h-full w-px bg-border -translate-x-1/2"></div>}
                    <div className="flex-shrink-0 text-sm font-medium text-muted-foreground w-12 text-right">{stop.time}</div>
                    <div className="font-medium">{stop.name}</div>
                </div>
                ))}
            </div>
            <DelayPrediction 
                // Assuming start/end stop names are available. API docs show start_stop and end_stop for trips, but not for Itinerary.
                // Using first and last stop names from the stops list as a fallback.
                routeName={line.route_name}
                startAddress={line.stops[0]?.name || 'Unknown Start'}
                endAddress={line.stops[line.stops.length-1]?.name || 'Unknown End'}
            />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
