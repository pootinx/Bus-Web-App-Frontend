
'use client';

import DelayPrediction from './DelayPrediction';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Map } from 'lucide-react';

type ItineraryActionsProps = {
    routeName: string;
    startAddress: string;
    endAddress: string;
};


export default function ItineraryActions({ routeName, startAddress, endAddress}: ItineraryActionsProps) {
    
    // A simple way to get a line ID for the details link. This might need to be improved
    // if route names are not unique or don't match the IDs.
    const lineId = routeName.match(/\d+/)?.[0];

    return (
        <div className="flex w-full gap-2">
            <DelayPrediction 
                routeName={routeName}
                startAddress={startAddress}
                endAddress={endAddress}
            />
            {lineId && (
                <Button variant="outline" className="w-full" asChild>
                    <Link href={`/lines/details/${lineId}`}>
                        <Map className="mr-2 h-4 w-4" />
                        Voir la ligne
                    </Link>
                </Button>
            )}
        </div>
    )
}
