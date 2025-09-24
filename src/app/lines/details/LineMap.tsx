
'use client';

import { useEffect, useMemo } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import type { BusLine, Stop, ItineraryV2 } from '@/lib/types';
import { decode } from '@/lib/polyline';
import { getLineColor } from '@/lib/constants';

declare global {
    interface Window {
        google: any;
    }
}

function MapController({ line, stops, itinerary }: { line?: BusLine, stops: Stop[], itinerary?: ItineraryV2 }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !window.google) return;
    
    const bounds = new window.google.maps.LatLngBounds();

    if (itinerary) {
      itinerary.steps.forEach(step => {
        const stepPath = decode(step.polyline).map(([lat, lng]) => ({ lat, lng }));
        stepPath.forEach(pos => bounds.extend(pos));
      });
    } else if (line) {
      const linePath = decode(line.polyline || '').map(([lat, lng]) => ({ lat, lng }));
      linePath.forEach(pos => bounds.extend(pos));
      stops.forEach(stop => bounds.extend({ lat: stop.lat, lng: stop.lon }));
    }
    
    if (bounds.isEmpty()) return;
    map.fitBounds(bounds, 100);
    
  }, [map, line, stops, itinerary]);

  return null;
}

type LineMapProps = {
  line?: BusLine;
  stops?: Stop[];
  itinerary?: ItineraryV2;
};

export default function LineMap({ line, stops = [], itinerary }: LineMapProps) {
  const map = useMap();

  // Draw single line polyline and markers
  useEffect(() => {
    if (!map || !window.google || !line) return;

    const linePath = decode(line.polyline || '').map(([lat, lng]) => ({ lat, lng }));
    const lineColor = getLineColor(line.id);

    const polyline = new window.google.maps.Polyline({
        path: linePath,
        strokeColor: lineColor,
        strokeOpacity: 0.8,
        strokeWeight: 5,
        map: map,
    });

    const markers: google.maps.Marker[] = [];
    // Start and End Markers
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
        // Intermediate stop dots
        stops.slice(1, -1).forEach(stop => {
          const stopMarker = new window.google.maps.Marker({
              position: { lat: stop.lat, lng: stop.lon },
              map: map,
              title: stop.name,
              icon: {
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 4,
                  fillColor: lineColor,
                  fillOpacity: 1,
                  strokeColor: 'white',
                  strokeWeight: 1.5,
              }
          });
          markers.push(stopMarker);
      });
    }

    return () => {
        polyline.setMap(null);
        markers.forEach(marker => marker.setMap(null));
    };
  }, [map, line, stops]);

  // Draw itinerary polylines
  useEffect(() => {
    if (!map || !window.google || !itinerary) return;

    const elements: (google.maps.Polyline | google.maps.Marker)[] = [];

    itinerary.steps.forEach(step => {
        const path = decode(step.polyline).map(([lat, lng]) => ({ lat, lng }));
        const color = step.type === 'WALK' ? '#555555' : getLineColor(step.line_id || 0);
        
        const poly = new window.google.maps.Polyline({
            path,
            strokeColor: color,
            strokeOpacity: step.type === 'WALK' ? 0.7 : 0.8,
            strokeWeight: step.type === 'WALK' ? 6 : 5,
            map: map,
            icons: step.type === 'WALK' ? [{
                icon: {
                    path: 'M 0,-1 0,1',
                    strokeOpacity: 1,
                    scale: 3,
                },
                offset: '0',
                repeat: '20px',
            }] : [],
        });
        elements.push(poly);
    });

    return () => {
        elements.forEach(p => p.setMap(null));
    }

  }, [map, itinerary]);

  return (
    <MapController line={line} stops={stops} itinerary={itinerary} />
  );
}
