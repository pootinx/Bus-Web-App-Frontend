
'use client';

import { useMemo } from 'react';
import { Map, useMap } from '@vis.gl/react-google-maps';
import type { BusLine, Stop } from '@/lib/types';
import { decode } from '@/lib/polyline';
import { getLineColor } from '@/lib/constants';

// The Polyline and Marker components are not direct exports, they are part of the google.maps object
// We will render it dynamically when the map is available.
declare global {
    interface Window {
        google: any;
    }
}

function MapController({ path, stops }: { path: {lat: number, lng: number}[]; stops: Stop[] }) {
  const map = useMap();

  useMemo(() => {
    if (map && window.google && path.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      path.forEach(pos => bounds.extend(pos));
      stops.forEach(stop => bounds.extend({ lat: stop.lat, lng: stop.lon }));
      map.fitBounds(bounds, 100);
    }
  }, [map, path, stops]);

  return null;
}

type LineMapProps = {
  line: BusLine;
  stops: Stop[];
};

export default function LineMap({ line, stops }: LineMapProps) {
  const map = useMap();
  const path = useMemo(() => {
    if (!line.polyline) return [];
    return decode(line.polyline).map(([lat, lng]) => ({ lat, lng }));
  }, [line.polyline]);

  const color = getLineColor(line.id);

  return (
    <>
      {map && window.google && (
        <>
          {path.length > 0 && (
            <window.google.maps.Polyline
              map={map}
              path={path}
              strokeColor={color}
              strokeOpacity={0.8}
              strokeWeight={5}
            />
          )}
          {stops.map((stop, index) => (
            <window.google.maps.Marker
              key={stop.id}
              position={{ lat: stop.lat, lng: stop.lon }}
              map={map}
              title={stop.name}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: (index === 0 || index === stops.length - 1) ? 6 : 4,
                fillColor: (index === 0) ? '#10B981' : (index === stops.length - 1) ? '#EF4444' : '#FFFFFF',
                fillOpacity: 1,
                strokeColor: color,
                strokeWeight: 2,
              }}
            />
          ))}
        </>
      )}
      <MapController path={path} stops={stops} />
    </>
  );
}
