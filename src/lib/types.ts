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
}

export interface ItineraryResponse {
  destination: {
    name: string;
    lat: number;
    lon: number;
  };
  count: number;
  lines: ItineraryLine[];
}

export interface City {
  id: number;
  name: string;
}
