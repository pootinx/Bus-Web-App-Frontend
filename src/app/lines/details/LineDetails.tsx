'use client';

import type { BusLine, Stop } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Milestone } from 'lucide-react';
import { StopsTimeline } from './StopsTimeline';

type LineDetailsProps = {
    line: BusLine;
    stops: Stop[];
};

export function LineDetails({ line, stops }: LineDetailsProps) {
    
    return (
        <div className="h-full overflow-y-auto">
            <Card className="border-none shadow-none rounded-none">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Ligne {line.route_name}</CardTitle>
                     <div className="text-muted-foreground pt-4 space-y-2">
                        <div className="flex items-start gap-2">
                            <MapPin className="h-5 w-5 text-green-500 mt-1" />
                            <div>
                                <p className="font-semibold">Départ</p>
                                <p>{line.start_address}</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-2">
                            <MapPin className="h-5 w-5 text-red-500 mt-1" />
                            <div>
                                <p className="font-semibold">Arrivée</p>
                                <p>{line.end_address}</p>
                            </div>
                        </div>
                     </div>
                </CardHeader>
                <CardContent>
                    <StopsTimeline stops={stops} />
                </CardContent>
            </Card>
        </div>
    )
}
