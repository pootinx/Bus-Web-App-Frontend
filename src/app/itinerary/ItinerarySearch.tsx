'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { GetItineraryParams } from '@/lib/api';
import type { ItineraryResponse } from '@/lib/types';
import { useLocation } from '@/hooks/use-location';
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
import { Switch } from '@/components/ui/switch';
import { Loader2, LocateFixed, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ItineraryResults from './ItineraryResults';
import { AutocompleteInput } from './AutocompleteInput';
import { APIProvider } from '@vis.gl/react-google-maps';

const formSchema = z.object({
  start: z.string(),
  destination: z.string().min(3, { message: 'La destination doit comporter au moins 3 caractères.' }),
  city_id: z.coerce.number().int().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ItinerarySearch() {
  const [useGps, setUseGps] = useState(false);
  const { position, loading: locationLoading, error: locationError, getLocation, clearLocation } = useLocation();
  const [searchState, setSearchState] = useState<{
    loading: boolean;
    error: string | null;
    results: ItineraryResponse | null;
  }>({ loading: false, error: null, results: null });

  const { toast } = useToast();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      start: '',
      destination: 'Gare routière Oulad Ziyane',
      city_id: 1, // Default to Casablanca
    },
  });

  const handleGpsToggle = (checked: boolean) => {
    setUseGps(checked);
    if (checked) {
      getLocation();
      form.setValue('start', 'Ma position');
    } else {
      clearLocation();
      form.setValue('start', '');
    }
  };

  if (useGps && position) {
    form.setValue('start', 'Ma position');
  } else if (useGps && locationError) {
    toast({
      variant: 'destructive',
      title: 'Erreur de localisation',
      description: 'Impossible d\'obtenir votre position. Veuillez vérifier vos paramètres.',
    });
    setUseGps(false);
    clearLocation();
  }

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    console.log('Form data submitted:', data);
    setSearchState({ loading: true, error: null, results: null });

    const params: GetItineraryParams = {
      dest_add: data.destination,
      city_id: data.city_id,
    };

    if (useGps && position) {
      params.start_lat = position.coords.latitude;
      params.start_lon = position.coords.longitude;
    } else if (data.start && data.start !== 'Ma position') {
      params.start_add = data.start;
    }

    console.log('Sending API request with params:', params);

    try {
      const query = new URLSearchParams(params as any).toString();
      const response = await fetch(`/api/itinerary?${query}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An unknown error occurred');
      }

      const results = await response.json();
      console.log('API response received:', results);
      setSearchState({ loading: false, error: null, results });
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
    <APIProvider apiKey={apiKey!}>
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
          <div className="flex items-end gap-2">
            <FormField
              control={form.control}
              name="start"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormLabel>Point de départ (optionnel)</FormLabel>
                  <FormControl>
                     <AutocompleteInput 
                        placeholder="Adresse de départ ou utiliser le GPS" 
                        {...field} 
                        disabled={useGps} 
                        onPlaceSelect={(place) => {
                            field.onChange(place?.formatted_address || '');
                        }}
                     />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col items-center gap-1">
              <label htmlFor="gps-switch" className="text-xs text-muted-foreground">GPS</label>
              <Switch id="gps-switch" checked={useGps} onCheckedChange={handleGpsToggle} disabled={locationLoading} />
            </div>
            {locationLoading && <Loader2 className="h-5 w-5 animate-spin" />}
          </div>

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
      </APIProvider>
      <div className="mt-8">
        {searchState.loading && (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {searchState.error && (
          <div className="text-center text-destructive">
            <p>Erreur: {searchState.error}</p>
            <Button variant="outline" onClick={() => form.handleSubmit(onSubmit)()} className="mt-4">
              Réessayer
            </Button>
          </div>
        )}
        {searchState.results && <ItineraryResults response={searchState.results} />}
      </div>
    </>
  );
}
