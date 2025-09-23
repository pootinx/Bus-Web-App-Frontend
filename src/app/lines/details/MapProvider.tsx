'use client';

import { APIProvider } from '@vis.gl/react-google-maps';
import LineMap from './LineMap';
import type { BusLine, Stop } from '@/lib/types';
import { Alert, AlertTitle } from '@/components/ui/alert';

type MapProviderProps = {
  line: BusLine;
  stops: Stop[];
};

export function MapProvider({ line, stops }: MapProviderProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="h-full flex items-center justify-center bg-muted">
        <Alert variant="destructive" className="w-auto">
          <AlertTitle>Clé API Google Maps manquante</AlertTitle>
        </Alert>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <LineMap line={line} stops={stops} />
    </APIProvider>
  );
}
