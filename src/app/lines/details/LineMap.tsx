
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
      if (!map || !window.google || !stops || stops.length === 0) return;
      
      const markers: google.maps.Marker[] = [];

      // Start and End markers
      if (stops.length > 0) {
        const startMarker = new window.google.maps.Marker({
            position: { lat: stops[0].lat, lng: stops[0].lon },
            map: map,
            title: stops[0].name,
            icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#FFFFFF',
                fillOpacity: 1,
                strokeColor: '#000000',
                strokeWeight: 2,
            },
        });
        markers.push(startMarker);

        if (stops.length > 1) {
            const endMarker = new window.google.maps.Marker({
                position: { lat: stops[stops.length - 1].lat, lng: stops[stops.length - 1].lon },
                map: map,
                title: stops[stops.length - 1].name,
                icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 6,
                    fillColor: '#000000',
                    fillOpacity: 1,
                    strokeColor: 'white',
                    strokeWeight: 2,
                },
            });
            markers.push(endMarker);
        }
      }

      // Intermediate stop dots
      stops.slice(1, -1).forEach(stop => {
          const stopMarker = new window.google.maps.Marker({
              position: { lat: stop.lat, lng: stop.lon },
              map: map,
              title: stop.name,
              icon: {
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 4,
                  fillColor: color,
                  fillOpacity: 1,
                  strokeColor: 'white',
                  strokeWeight: 1.5,
              }
          });
          markers.push(stopMarker);
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
