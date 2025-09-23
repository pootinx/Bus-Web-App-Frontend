import type { BusLine, ItineraryResponse, NearestStop, Stop, Trip } from './types';
import { CITIES } from './constants';

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

export async function getLines(cityId?: number): Promise<BusLine[]> {
    if (cityId) {
      const url = `${BASE_URL}/station/lines?city_id=${cityId}`;
      console.log(`[API_CLIENT] Fetching lines from ${url}`);
      const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
      try {
        return await handleResponse<BusLine[]>(response);
      } catch (e) {
        if (e instanceof ApiError && e.status === 400) {
            console.warn(`[API_CLIENT] Fetching lines for city ${cityId} failed, assuming no lines.`);
            return [];
        }
        throw e;
      }
    } else {
      // Fetch from all cities and merge
      console.log(`[API_CLIENT] Fetching lines from all cities`);
      const promises = CITIES.map(city => getLines(city.id));
      const results = await Promise.all(promises);
      return results.flat();
    }
}


export async function getStopsByLine(lineId: number): Promise<Stop[]> {
  // This endpoint seems to not require city_id which is strange, but we follow the API
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
    // The trips endpoint likely needs a city_id as well. Since we don't know it,
    // we'll have to guess or fetch from a default. Let's assume default of Casablanca (1)
    // as a temporary workaround. A proper solution would involve knowing the line's city.
    const city_id = 1; 
    const url = `${BASE_URL}/station/trips?line_id=${lineId}&city_id=${city_id}`;
    console.log(`[API_CLIENT] Fetching trips from ${url}`);
    const response = await fetch(url, { next: { revalidate: 3600 } });
    try {
        return await handleResponse<Trip[]>(response);
    } catch(e) {
        if (e instanceof ApiError && e.status === 400) {
            console.warn(`[API_CLIENT] Fetching trips for line ${lineId} with city 1 failed. Trying city 2.`);
            const city_id_2 = 2;
            const url_2 = `${BASE_URL}/station/trips?line_id=${lineId}&city_id=${city_id_2}`;
            const response_2 = await fetch(url_2, { next: { revalidate: 3600 } });
            return await handleResponse<Trip[]>(response_2);
        }
        throw e;
    }
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
  const v1Params = {
    dest_add: params.dest_add,
    city_id: params.city_id.toString(),
    ...(params.start_add && { start_add: params.start_add }),
    ...(params.start_lat && { start_lat: params.start_lat.toString() }),
    ...(params.start_lon && { start_lon: params.start_lon.toString() }),
  };
  
  const v1Query = new URLSearchParams(v1Params);
  const v1Url = `${BASE_URL}/itinerary/routes?${v1Query.toString()}`;
  
  console.log(`[API_CLIENT] Fetching itinerary from v1: ${v1Url}`);

  try {
    const v1Response = await fetch(v1Url);
    if (!v1Response.ok) {
        // Don't throw here, just log and proceed to v2
        console.error(`[API_CLIENT] V1 request failed with status ${v1Response.status}. Proceeding to v2.`);
    } else {
        const v1Data = await handleResponse<ItineraryResponse>(v1Response);
        if (v1Data.count > 0) {
          console.log('[API_CLIENT] V1 returned results, using them.');
          return v1Data;
        }
        console.log('[API_CLIENT] V1 returned no results, trying v2.');
    }
  } catch (error) {
    console.error('[API_CLIENT] Error fetching from V1, proceeding to v2:', error);
  }

  // Fallback to v2
  const v2Params = {
    dest_add: params.dest_add,
    ...(params.start_lat && { start_lat: params.start_lat.toString() }),
    ...(params.start_lon && { start_lon: params.start_lon.toString() }),
  };

  const v2Query = new URLSearchParams(v2Params);
  const v2Url = `${BASE_URL}/itinerary/v2/routes?${v2Query.toString()}`;

  console.log(`[API_CLIENT] Fetching itinerary from v2: ${v2Url}`);

  const v2Response = await fetch(v2Url);
  if (!v2Response.ok) {
    const errorBody = await v2Response.text();
    console.error(`[API_CLIENT] Error fetching itinerary from v2 ${v2Url}:`, v2Response.status, errorBody);
    throw new Error(`Failed to fetch from v2: ${v2Response.status} ${errorBody}`);
  }
  return handleResponse<ItineraryResponse>(v2Response);
}
