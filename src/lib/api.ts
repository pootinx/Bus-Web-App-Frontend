import type { BusLine, ItineraryResponse, NearestStop, Stop, Trip } from './types';

const BASE_URL = 'https://tobis-backend.onrender.com';

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const url = response.url;
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[API_CLIENT] Error for ${url} (${response.status}): ${errorText}`);
    throw new ApiError(errorText || `Request failed with status ${response.status}`, response.status);
  }
  try {
    const data = await response.json();
    console.log(`[API_CLIENT] Response for ${url}:`, data);
    // The API sometimes wraps responses in an "example" object
    if (data && typeof data === 'object' && 'example' in data && Array.isArray(data.example)) {
      return data.example as T;
    }
    return data as T;
  } catch (e) {
    console.error(`[API_CLIENT] Failed to parse JSON response for ${url}:`, e);
    throw new ApiError('Invalid JSON response from server');
  }
}

export async function getHealth(): Promise<string> {
  const url = BASE_URL;
  console.log(`[API_CLIENT] Fetching health check from ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new ApiError('Health check failed', response.status);
  }
  return response.text();
}

export async function getLines(): Promise<BusLine[]> {
  const url = `${BASE_URL}/station/lines`;
  console.log(`[API_CLIENT] Fetching lines from ${url}`);
  const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
  return handleResponse<BusLine[]>(response);
}

// This function now calls the internal proxy API
export async function getLineDetails(lineId: number): Promise<BusLine> {
    const url = `/api/line-details?line_id=${lineId}`;
    console.log(`[API_CLIENT] Fetching line details via proxy from ${url}`);
    const response = await fetch(url);
    // The proxy will return a single object, not an array
    const line = await handleResponse<BusLine>(response);
    if (!line) {
        throw new ApiError(`Line with ID ${lineId} not found`, 404);
    }
    return line;
}

export async function getStopsByLine(lineId: number): Promise<Stop[]> {
  const url = `${BASE_URL}/station/stops?line_id=${lineId}`;
  console.log(`[API_CLIENT] Fetching stops from ${url}`);
  const response = await fetch(url, { next: { revalidate: 3600 } });
  return handleResponse<Stop[]>(response);
}

export async function getNearestStop(lat: number, lon: number): Promise<NearestStop> {
  const url = `${BASE_URL}/station/nearest-stop?lat=${lat}&lon=${lon}`;
  console.log(`[API_CLIENT] Fetching nearest stop from ${url}`);
  const response = await fetch(url);
  return handleResponse<NearestStop>(response);
}

export async function getTripsByLine(lineId: number): Promise<Trip[]> {
  const url = `${BASE_URL}/station/trips?line_id=${lineId}`;
  console.log(`[API_CLIENT] Fetching trips from ${url}`);
  const response = await fetch(url, { next: { revalidate: 3600 } });
  return handleResponse<Trip[]>(response);
}

export async function getLinesByStop(stopId: number): Promise<BusLine[]> {
  const url = `${BASE_URL}/station/lines-by-stop?stop_id=${stopId}`;
  console.log(`[API_CLIENT] Fetching lines by stop from ${url}`);
  const response = await fetch(url);
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
  
  const url = `${BASE_URL}/itinerary/routes?${query.toString()}`;
  console.log(`[API_CLIENT] Fetching itinerary from ${url}`);

  const response = await fetch(url);
  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[API_CLIENT] Error fetching itinerary from ${url}:`, response.status, errorBody);
    throw new Error(`Failed to fetch: ${response.status} ${errorBody}`);
  }
  return handleResponse<ItineraryResponse>(response);
}
