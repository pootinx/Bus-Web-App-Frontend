import type { Trip } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function TripSchedule({ trips }: { trips: Trip[] }) {
  if (!trips || trips.length === 0) {
    return null;
  }
  
  return (
    <section>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Clock />
            <span>Horaires</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {trips.map((trip) => (
              <div key={trip.id} className="flex items-center gap-3 p-2 border rounded-lg bg-muted/50">
                <Badge variant={trip.direct ? 'default' : 'secondary'} className={trip.direct ? 'bg-[var(--line-color)] text-white' : ''}>
                  {trip.direct ? 'Direct' : 'Retour'}
                </Badge>
                <div className="flex items-center gap-1.5 text-sm font-semibold font-code">
                  <span>{trip.start_time.substring(0, 5)}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground"/>
                  <span>{trip.end_time.substring(0, 5)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
