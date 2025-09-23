'use client';

import type { Stop } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Milestone } from 'lucide-react';

export function StopsTimeline({ stops }: { stops: Stop[] }) {
  return (
    <section>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Milestone />
            <span>Arrêts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative pl-6">
            {/* The vertical line */}
            <div className="absolute left-6 top-0 h-full w-0.5 bg-border -translate-x-1/2"></div>
            
            {stops.map((stop, index) => (
              <div key={stop.id} className="relative flex items-center gap-4 py-3">
                {/* The dot on the timeline */}
                <div className="absolute left-6 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 p-1 bg-background rounded-full">
                  <div className="h-3 w-3 rounded-full bg-[var(--line-color)] border-2 border-background"></div>
                </div>
                {/* The stop name */}
                <div className="flex-grow font-medium text-sm">
                    {stop.name}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
