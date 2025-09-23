
'use client';

import { useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import type { BusLine, ItineraryLine, ItineraryResponse } from '@/lib/types';
import { decode } from '@/lib/polyline';
import { getLineColor } from '@/lib/constants';
import { Alert, AlertTitle } from '@/components/ui/alert';

// The Polyline component is not a direct export, it's part of the google.maps object
// We will render it dynamically when the map is available.
declare global {
    interface Window {
        google: any;
    }
}

function MapPolylines({ line, lineDetails }: { line: ItineraryLine, lineDetails: BusLine }) {
    const map = useMap();

    const busPath = useMemo(() => {
        if (!lineDetails.polyline) return [];
        return decode(lineDetails.polyline).map(([lat, lng]) => ({ lat, lng }));
    }, [lineDetails.polyline]);

    const walkToStartPath = useMemo(() => {
        if (!line.walk_to_start_polyline) return [];
        return decode(line.walk_to_start_polyline).map(([lat, lng]) => ({ lat, lng }));
    }, [line.walk_to_start_polyline]);
  
    const walkToDestPath = useMemo(() => {
        if (!line.walk_to_dest_polyline) return [];
        return decode(line.walk_to_dest_polyline).map(([lat, lng]) => ({ lat, lng }));
    }, [line.walk_to_dest_polyline]);

    const color = getLineColor(line.line_id);

    if (!map || !window.google) return null;

    // This useEffect is to manage the lifecycle of the polylines on the map
    React.useEffect(() => {
      const busPolyline = new window.google.maps.Polyline({
          path: busPath,
          strokeColor: color,
          strokeOpacity: 0.9,
          strokeWeight: 6,
          map: map,
      });

      const walkToStartPolyline = new window.google.maps.Polyline({
          path: walkToStartPath,
          strokeColor: '#4285F4',
          strokeOpacity: 0,
          strokeWeight: 5,
          icons: [{
              icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 4 },
              offset: '0',
              repeat: '20px'
          }],
          map: map,
      });

      const walkToDestPolyline = new window.google.maps.Polyline({
          path: walkToDestPath,
          strokeColor: '#4285F4',
          strokeOpacity: 0,
          strokeWeight: 5,
          icons: [{
              icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 4 },
              offset: '0',
              repeat: '20px'
          }],
          map: map,
      });

      // Cleanup function to remove polylines when component unmounts or dependencies change
      return () => {
          busPolyline.setMap(null);
          walkToStartPolyline.setMap(null);
          walkToDestPolyline.setMap(null);
      };

    }, [map, busPath, walkToStartPath, walkToDestPath, color]);


    return null; // The polylines are rendered directly via the effect
}


function MapController({ line, lineDetails, response }: { line: ItineraryLine, lineDetails: BusLine, response: ItineraryResponse }) {
  const map = useMap();

  useMemo(() => {
    if (map && window.google) {
        const bounds = new window.google.maps.LatLngBounds();
        
        // Add start and end points of the journey
        if (response.start) {
            bounds.extend({ lat: response.start.lat, lng: response.start.lon });
        }
        bounds.extend({ lat: response.destination.lat, lng: response.destination.lon });
        
        // Add bus polyline
        if (lineDetails.polyline) {
            const busPath = decode(lineDetails.polyline);
            busPath.forEach(pos => bounds.extend({ lat: pos[0], lng: pos[1] }));
        }

        // Add walk polylines
        if (line.walk_to_start_polyline) {
            const walkPath = decode(line.walk_to_start_polyline);
            walkPath.forEach(pos => bounds.extend({ lat: pos[0], lng: pos[1] }));
        }
         if (line.walk_to_dest_polyline) {
            const walkPath = decode(line.walk_to_dest_polyline);
            walkPath.forEach(pos => bounds.extend({ lat: pos[0], lng: pos[1] }));
        }

        map.fitBounds(bounds, 100);
    }
  }, [map, line, lineDetails, response]);

  return null;
}

type ItineraryMapProps = {
  line: ItineraryLine;
  lineDetails: BusLine;
  response: ItineraryResponse;
};

export default function ItineraryMap({ line, lineDetails, response }: ItineraryMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID;
  
  if (!apiKey || !mapId) {
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
        className="w-full h-full rounded-md"
        defaultCenter={{ lat: 33.5731, lng: -7.5898 }} // Default center on Casablanca
        defaultZoom={11}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
      >
        <MapPolylines line={line} lineDetails={lineDetails} />
        
        {response.start && (
           <AdvancedMarker position={{ lat: response.start.lat, lng: response.start.lon }} title="Start">
               <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-md"></div>
           </AdvancedMarker>
        )}

        <AdvancedMarker position={{ lat: response.destination.lat, lng: response.destination.lon }} title="Destination">
            <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-md"></div>
        </AdvancedMarker>
        
        <MapController line={line} lineDetails={lineDetails} response={response} />
      </Map>
    </APIProvider>
  );
}
