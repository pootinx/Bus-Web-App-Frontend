
'use client';

import { ItineraryLine, ItineraryResponse } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Clock, Bus } from 'lucide-react';
import { getLineColor } from '@/lib/constants';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';

type ItineraryLineCardProps = {
  line: ItineraryLine;
  response: ItineraryResponse;
};

export default function ItineraryLineCard({ line, response }: ItineraryLineCardProps) {
  const color = getLineColor(line.line_id);

  return (
    <Link href={`/lines/details/${line.line_id}`}>
      <Card className="hover:shadow-lg hover:border-primary transition-all duration-200">
        <CardContent className="p-4 flex items-center justify-between gap-4">
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
            <ChevronRight className="h-6 w-6 text-muted-foreground flex-shrink-0" />
        </CardContent>
      </Card>
    </Link>
  );
}
