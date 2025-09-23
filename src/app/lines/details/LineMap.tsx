
'use client';

import { useEffect, useMemo } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import type { BusLine, Stop } from '@/lib/types';
import { decode } from '@/lib/polyline';
import { getLineColor } from '@/lib/constants';

declare global {
    interface Window {
        google: any;
    }
}

function MapController({ path, stops }: { path: {lat: number, lng: number}[]; stops: Stop[] }) {
  const map = useMap();

  useEffect(() => {
    if (map && window.google && (path.length > 0 || stops.length > 0)) {
      const bounds = new window.google.maps.LatLngBounds();
      path.forEach(pos => bounds.extend(pos));
      stops.forEach(stop => bounds.extend({ lat: stop.lat, lng: stop.lon }));
      if (bounds.isEmpty()) return;
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

  useEffect(() => {
    if (!map || !window.google || path.length === 0) return;

    const polyline = new window.google.maps.Polyline({
        path: path,
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 5,
        map: map,
    });

    return () => {
        polyline.setMap(null);
    };
  }, [map, path, color]);

  useEffect(() => {
      if (!map || !window.google) return;
      
      const markers = stops.map((stop, index) => {
          return new window.google.maps.Marker({
              position: { lat: stop.lat, lng: stop.lon },
              map: map,
              title: stop.name,
              icon: {
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: (index === 0 || index === stops.length - 1) ? 6 : 4,
                  fillColor: (index === 0) ? '#10B981' : (index === stops.length - 1) ? '#EF4444' : '#FFFFFF',
                  fillOpacity: 1,
                  strokeColor: color,
                  strokeWeight: 2,
              },
          });
      });

      return () => {
          markers.forEach(marker => marker.setMap(null));
      };

  }, [map, stops, color]);


  return (
    <>
      <MapController path={path} stops={stops} />
    </>
  );
}
