
export interface BusLine {
  id: number;
  route_name: string;
  polyline: string | null;
  start_address: string;
  end_address: string;
}

export interface Stop {
  id: number;
  name: string;
  lat: number;
  lon: number;
}

export interface NearestStop {
  id: number;
  name: string;
  distance: number;
}

export interface Trip {
  id: number;
  trip_id: string;
  start_time: string;
  end_time: string;
  start_stop: string;
  end_stop: string;
  direct: boolean;
}

// V1 Itinerary Types
export interface ItineraryStop {
  id: number;
  name: string;
  eta_min_from_start: number;
  time: string;
}

export interface ItineraryLine {
  line_id: number;
  route_name: string;
  start_stop_arrival_time: string;
  arrival_time: string;
  ride_eta_min: number;
  stops: ItineraryStop[];
  walk_to_start_polyline?: string;
  walk_to_dest_polyline?: string;
}

// V2 Itinerary Types
export type ItineraryStep = {
    type: 'WALK' | 'TRANSIT';
    duration_seconds: number;
    distance_meters?: number; // For WALKING
    polyline: string;
    start_time: string;
    end_time: string;
    start_stop_name: string;
    end_stop_name: string;
    line_id?: number; // For TRANSIT
    line_name?: string; // For TRANSIT
    num_stops?: number; // For TRANSIT
}

export type ItineraryV2 = {
    duration_seconds: number;
    start_time: string;
    end_time: string;
    steps: ItineraryStep[];
}

export interface ItineraryResponse {
  start?: {
    name: string;
    lat: number;
    lon: number;
  };
  destination: {
    name: string;
    lat: number;
    lon: number;
  };
  count: number;
  lines: ItineraryLine[];
  v2_itin?: ItineraryV2[];
}

export interface City {
  id: number;
  name: string;
}
