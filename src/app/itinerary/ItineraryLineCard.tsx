
'use client';

import { ItineraryLine, ItineraryResponse } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Clock, Bus, ChevronRight, PersonStanding } from 'lucide-react';
import { getLineColor } from '@/lib/constants';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

type ItineraryLineCardProps = {
  line: ItineraryLine;
  response: ItineraryResponse;
};

export default function ItineraryLineCard({ line, response }: ItineraryLineCardProps) {
  const color = getLineColor(line.line_id);

  // A simple way to get total duration. A more robust solution might be needed.
  const totalDuration = () => {
    const startTime = new Date(`1970-01-01T${line.start_stop_arrival_time}Z`);
    const endTime = new Date(`1970-01-01T${line.arrival_time}Z`);
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        return line.ride_eta_min;
    }
    let diff = (endTime.getTime() - startTime.getTime()) / 1000 / 60;
    if (diff < 0) { // Handles overnight trips
        diff += 24 * 60;
    }
    return Math.round(diff);
  }

  return (
    <Link href={`/lines/details/${line.line_id}`}>
      <Card className="hover:shadow-lg hover:border-primary transition-all duration-200">
        <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex flex-col gap-3 flex-grow">
               <div className="flex justify-between items-start">
                    <div className="font-bold text-lg">{line.start_stop_arrival_time} - {line.arrival_time}</div>
                    <div className="font-bold text-lg">~{totalDuration()} min</div>
               </div>
               <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                    <PersonStanding />
                    <ChevronRight className="h-4 w-4" />
                    <Bus size={18} style={{ color }} />
                    <Badge style={{ backgroundColor: color, color: 'white' }} className="text-xs">{line.route_name}</Badge>
                    <ChevronRight className="h-4 w-4" />
                    <PersonStanding />
               </div>
            </div>
            <ChevronRight className="h-6 w-6 text-muted-foreground flex-shrink-0" />
        </CardContent>
      </Card>
    </Link>
  );
}
