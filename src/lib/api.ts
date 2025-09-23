import type { BusLine, ItineraryResponse, NearestStop, Stop, Trip } from './types';

const BASE_URL = 'https://tobis-backend.onrender.com';

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(errorText || `Request failed with status ${response.status}`, response.status);
  }
  const data = await response.json();
  // The API sometimes wraps responses in an "example" object
  if (data && typeof data === 'object' && 'example' in data && Array.isArray(data.example)) {
    return data.example as T;
  }
  return data as T;
}

export async function getHealth(): Promise<string> {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    throw new ApiError('Health check failed', response.status);
  }
  return response.text();
}

export async function getLines(): Promise<BusLine[]> {
  const response = await fetch(`${BASE_URL}/station/lines`, { next: { revalidate: 3600 } }); // Cache for 1 hour
  return handleResponse<BusLine[]>(response);
}

export async function getStopsByLine(lineId: number): Promise<Stop[]> {
  const response = await fetch(`${BASE_URL}/station/stops?line_id=${lineId}`, { next: { revalidate: 3600 } });
  return handleResponse<Stop[]>(response);
}

export async function getNearestStop(lat: number, lon: number): Promise<NearestStop> {
  const response = await fetch(`${BASE_URL}/station/nearest-stop?lat=${lat}&lon=${lon}`);
  return handleResponse<NearestStop>(response);
}

export async function getTripsByLine(lineId: number): Promise<Trip[]> {
  const response = await fetch(`${BASE_URL}/station/trips?line_id=${lineId}`, { next: { revalidate: 3600 } });
  return handleResponse<Trip[]>(response);
}

export async function getLinesByStop(stopId: number): Promise<BusLine[]> {
  const response = await fetch(`${BASE_URL}/station/lines-by-stop?stop_id=${stopId}`);
  return handleResponse<BusLine[]>(response);
}

export interface GetItineraryParams {
  dest_add: string;
  city_id: number;
  start_add?: string;
  start_lat?: number;
  start_lon?: number;
}

export async function getItinerary(params: GetItineraryParams): Promise<ItineraryResponse> {
  const query = new URLSearchParams({
    dest_add: params.dest_add,
    city_id: params.city_id.toString(),
    ...(params.start_add && { start_add: params.start_add }),
    ...(params.start_lat && { start_lat: params.start_lat.toString() }),
    ...(params.start_lon && { start_lon: params.start_lon.toString() }),
  });
  console.log('Fetching itinerary with query:', query.toString());
  const response = await fetch(`${BASE_URL}/itinerary/routes?${query.toString()}`);
  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Error fetching itinerary:', response.status, errorBody);
    throw new Error(`Failed to fetch: ${response.status} ${errorBody}`);
  }
  return handleResponse<ItineraryResponse>(response);
}
