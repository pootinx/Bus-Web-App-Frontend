
'use client';

import type { Stop } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Milestone } from 'lucide-react';

export function StopsTimeline({ stops }: { stops: Stop[] }) {
  if (!stops || stops.length === 0) {
    return null;
  }
  
  return (
    <section className="p-6 pt-0">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Milestone className="h-5 w-5" />
            <span>Arrêts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative pl-3">
            {/* The vertical line */}
            <div className="absolute left-3 top-2 h-[calc(100%-1rem)] w-0.5 bg-border -translate-x-1/2"></div>
            
            {stops.map((stop, index) => (
              <div key={stop.id} className="relative flex items-center gap-4 py-2">
                {/* The dot on the timeline */}
                <div className="absolute left-3 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 p-0.5 bg-card">
                  <div className="h-2.5 w-2.5 rounded-full" style={{backgroundColor: 'var(--line-color)'}}></div>
                </div>
                {/* The stop name */}
                <div className="flex-grow font-medium text-sm pl-4">
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
