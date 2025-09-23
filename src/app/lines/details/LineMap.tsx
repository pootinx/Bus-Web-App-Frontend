'use client';

import { useMemo } from 'react';
import { Map, Polyline, Marker, useMap } from '@vis.gl/react-google-maps';
import type { BusLine, Stop } from '@/lib/types';
import { decode } from '@/lib/polyline';
import { getLineColor } from '@/lib/constants';

function MapController({ path, stops }: { path: google.maps.LatLngLiteral[]; stops: Stop[] }) {
  const map = useMap();

  useMemo(() => {
    if (map && path.length > 0) {
      const bounds = new google.maps.LatLngBounds();
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
  const path = useMemo(() => {
    if (!line.polyline) return [];
    return decode(line.polyline).map(([lat, lng]) => ({ lat, lng }));
  }, [line.polyline]);

  const color = getLineColor(line.id);

  return (
    <Map
      mapId="transitsage-map"
      className="w-full h-full"
      defaultCenter={{ lat: 33.5731, lng: -7.5898 }} // Default center on Casablanca
      defaultZoom={11}
      gestureHandling={'greedy'}
      disableDefaultUI={true}
    >
      {path.length > 0 && (
        <Polyline
          path={path}
          strokeColor={color}
          strokeOpacity={0.8}
          strokeWeight={5}
        />
      )}
      {stops.map((stop, index) => (
        <Marker
          key={stop.id}
          position={{ lat: stop.lat, lng: stop.lon }}
          title={stop.name}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: (index === 0 || index === stops.length - 1) ? 6 : 4,
            fillColor: (index === 0) ? '#10B981' : (index === stops.length - 1) ? '#EF4444' : '#FFFFFF',
            fillOpacity: 1,
            strokeColor: color,
            strokeWeight: 2,
          }}
        />
      ))}
       <MapController path={path} stops={stops} />
    </Map>
  );
}
