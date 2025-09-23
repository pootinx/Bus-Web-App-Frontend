
'use client';

import type { BusLine, Stop } from '@/lib/types';
import { MapPin } from 'lucide-react';
import { StopsTimeline } from './StopsTimeline';

type LineDetailsProps = {
    line: BusLine;
    stops: Stop[];
};

export function LineDetails({ line, stops }: LineDetailsProps) {
    
    return (
        <div className="h-full overflow-y-auto bg-card">
            <div className="p-6">
                <h1 className="font-headline text-2xl font-bold text-primary" style={{color: 'var(--line-color)'}}>Ligne {line.route_name}</h1>
                <div className="text-muted-foreground pt-4 space-y-2">
                    <div className="flex items-start gap-2">
                        <MapPin className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-sm text-foreground/80">Départ</p>
                            <p className="font-medium text-foreground">{line.start_address}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <MapPin className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-sm text-foreground/80">Arrivée</p>
                            <p className="font-medium text-foreground">{line.end_address}</p>
                        </div>
                    </div>
                </div>
            </div>
            <StopsTimeline stops={stops} />
        </div>
    )
}
