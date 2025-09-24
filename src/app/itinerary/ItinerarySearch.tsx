
'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { ItineraryResponse, ItineraryV2 } from '@/lib/types';
import { CITIES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ItineraryResults from './ItineraryResults';
import { AutocompleteInput } from './AutocompleteInput';

const formSchema = z.object({
  start: z.string().min(3, { message: 'Le point de départ doit comporter au moins 3 caractères.' }),
  destination: z.string().min(3, { message: 'La destination doit comporter au moins 3 caractères.' }),
  city_id: z.coerce.number().int().positive(),
});

type FormValues = z.infer<typeof formSchema>;

type PlaceInfo = {
  lat: number | null;
  lng: number | null;
  address: string;
};

// This function transforms the backend response into a Google-like format
function transformItinerary(data: ItineraryResponse): ItineraryV2[] {
    if (data.v2_itin && data.v2_itin.length > 0) {
        return data.v2_itin;
    }
    // Fallback for V1 Itineraries (transforming them to V2 structure)
    if (data.lines && data.lines.length > 0) {
        return data.lines.map(line => {
            const startStep = line.walk_to_start_polyline ? [{
                type: 'WALK',
                duration_seconds: 5 * 60, // approximate
                distance_meters: 300, // approximate
                polyline: line.walk_to_start_polyline,
                start_time: line.start_stop_arrival_time, // This is not perfect
                end_time: line.start_stop_arrival_time,
                start_stop_name: data.start?.name || "Point de départ",
                end_stop_name: line.stops[0]?.name || "Premier arrêt"
            }] : [];

            const transitStep = {
                type: 'TRANSIT',
                duration_seconds: line.ride_eta_min * 60,
                polyline: "", // V1 doesn't provide a polyline for the whole transit leg
                start_time: line.start_stop_arrival_time,
                end_time: line.arrival_time,
                start_stop_name: line.stops[0]?.name,
                end_stop_name: line.stops[line.stops.length-1]?.name,
                line_id: line.line_id,
                line_name: line.route_name,
                num_stops: line.stops.length
            };
            
            const endStep = line.walk_to_dest_polyline ? [{
                type: 'WALK',
                duration_seconds: 5 * 60, // approximate
                distance_meters: 300, // approximate
                polyline: line.walk_to_dest_polyline,
                start_time: line.arrival_time, // This is not perfect
                end_time: line.arrival_time,
                start_stop_name: line.stops[line.stops.length-1]?.name || "Dernier arrêt",
                end_stop_name: data.destination.name || "Destination"
            }] : [];

            const steps = [...startStep, transitStep, ...endStep];

            return {
                duration_seconds: steps.reduce((sum, s) => sum + s.duration_seconds, 0),
                start_time: steps[0].start_time,
                end_time: steps[steps.length - 1].end_time,
                steps: steps,
            };
        });
    }

    return [];
}


export default function ItinerarySearch() {
  const [startPlace, setStartPlace] = useState<PlaceInfo | null>(null);
  const [destinationPlace, setDestinationPlace] = useState<PlaceInfo | null>(null);

  const [searchState, setSearchState] = useState<{
    loading: boolean;
    error: string | null;
    results: ItineraryV2[] | null;
  }>({ loading: false, error: null, results: null });

  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      start: '',
      destination: '',
      city_id: 1, // Default to Casablanca
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!startPlace?.lat || !startPlace?.lng) {
        toast({ variant: "destructive", title: "Point de départ manquant", description: "Veuillez sélectionner un point de départ valide à partir des suggestions." });
        return;
    }
    if (!destinationPlace?.address) {
        toast({ variant: "destructive", title: "Destination manquante", description: "Veuillez sélectionner une destination valide à partir des suggestions." });
        return;
    }

    setSearchState({ loading: true, error: null, results: null });

    const params = {
      start_lat: startPlace.lat.toString(),
      start_lon: startPlace.lng.toString(),
      dest_add: destinationPlace.address,
      city_id: data.city_id.toString(),
    };

    console.log('Sending API request with params:', params);

    try {
      const query = new URLSearchParams(params).toString();
      const response = await fetch(`/api/itinerary/route?${query}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'An unknown error occurred');
      }

      const rawResults: ItineraryResponse = await response.json();
      console.log('API response received:', rawResults);
      
      const transformedResults = transformItinerary(rawResults);
      console.log('Transformed results:', transformedResults);

      setSearchState({ loading: false, error: null, results: transformedResults });
    } catch (error) {
      console.error('API request failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      setSearchState({ loading: false, error: errorMessage, results: null });
      toast({
        variant: 'destructive',
        title: 'Erreur de recherche',
        description: errorMessage,
      });
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
           <FormField
            control={form.control}
            name="city_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ville</FormLabel>
                <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selectionner une ville" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CITIES.map((city) => (
                      <SelectItem key={city.id} value={city.id.toString()}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="start"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Point de départ</FormLabel>
                <FormControl>
                   <AutocompleteInput 
                      placeholder="Adresse de départ" 
                      {...field} 
                      onPlaceSelect={(place) => {
                          field.onChange(place?.formatted_address || '');
                          setStartPlace({
                              lat: place?.geometry?.location?.lat() || null,
                              lng: place?.geometry?.location?.lng() || null,
                              address: place?.formatted_address || '',
                          });
                      }}
                   />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="destination"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destination</FormLabel>
                <FormControl>
                    <AutocompleteInput 
                        placeholder="Adresse de destination" 
                        {...field}
                        onPlaceSelect={(place) => {
                            field.onChange(place?.formatted_address || '');
                            setDestinationPlace({
                                lat: place?.geometry?.location?.lat() || null,
                                lng: place?.geometry?.location?.lng() || null,
                                address: place?.formatted_address || '',
                            });
                        }}
                    />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={searchState.loading}>
            {searchState.loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            Rechercher
          </Button>
        </form>
      </Form>
      
      {searchState.loading && (
        <div className="flex justify-center p-8 mt-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      {searchState.error && (
        <div className="mt-8 text-center text-destructive">
          <p>Erreur: {searchState.error}</p>
          <Button variant="outline" onClick={() => form.handleSubmit(onSubmit)()} className="mt-4">
            Réessayer
          </Button>
        </div>
      )}
      {searchState.results && <ItineraryResults itineraries={searchState.results} />}
    </>
  );
}
