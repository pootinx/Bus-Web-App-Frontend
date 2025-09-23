
'use client';

import { APIProvider, Map } from '@vis.gl/react-google-maps';
import LineMap from './LineMap';
import type { BusLine, Stop } from '@/lib/types';
import { Alert, AlertTitle } from '@/components/ui/alert';

type MapProviderProps = {
  line: BusLine;
  stops: Stop[];
};

export function MapProvider({ line, stops }: MapProviderProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID || 'transitsage-map';

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
        <Map
            mapId={mapId}
            className="w-full h-full"
            defaultCenter={{ lat: 33.5731, lng: -7.5898 }} // Default center on Casablanca
            defaultZoom={11}
            gestureHandling={'greedy'}
            disableDefaultUI={true}
        >
            <LineMap line={line} stops={stops} />
        </Map>
    </APIProvider>
  );
}
