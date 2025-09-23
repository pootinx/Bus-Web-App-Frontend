
'use client';

import { Suspense } from 'react';
import { ItineraryDetailsClient } from './ItineraryDetailsClient';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Using suspense to handle the client component's loading of search params
export default function ItineraryDetailsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
        <ItineraryDetailsClient />
    </Suspense>
  );
}

function LoadingState() {
    return (
        <div className="h-[calc(100vh-4rem)] w-full flex items-center justify-center">
            <Card>
                <CardHeader>
                    <CardTitle>Chargement de l'itinéraire</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        </div>
    )
}
