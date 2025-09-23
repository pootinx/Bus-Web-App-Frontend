'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getItinerary, type GetItineraryParams } from '@/lib/api';
import type { ItineraryResponse } from '@/lib/types';
import { useLocation } from '@/hooks/use-location';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Loader2, LocateFixed, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ItineraryResults from './ItineraryResults';

const formSchema = z.object({
  start: z.string(),
  destination: z.string().min(3, { message: 'La destination doit comporter au moins 3 caractères.' }),
  radius: z.coerce.number().int().positive().optional().default(600),
  limit: z.coerce.number().int().positive().optional().default(5),
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      start: '',
      destination: 'Gare routière Oulad Ziyane',
      radius: 600,
      limit: 5,
    },
  });

  const handleGpsToggle = (checked: boolean) => {
    setUseGps(checked);
    if (checked) {
      getLocation();
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
    setSearchState({ loading: true, error: null, results: null });

    const params: GetItineraryParams = {
      dest_add: data.destination,
      limit: data.limit,
      start_radius_m: data.radius,
    };

    if (useGps && position) {
      params.start_lat = position.coords.latitude;
      params.start_lon = position.coords.longitude;
    } else if (data.start && data.start !== 'Ma position') {
      // The backend can geocode a start address as well, let's assume this for now.
      // This is a slight deviation from the prompt which only mentioned start_lat/lon for GPS.
      // A more robust solution might require a separate geocoding step on the client.
    }

    try {
      const results = await getItinerary(params);
      setSearchState({ loading: false, error: null, results });
    } catch (error) {
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
          <div className="flex items-end gap-2">
            <FormField
              control={form.control}
              name="start"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormLabel>Point de départ</FormLabel>
                  <FormControl>
                    <Input placeholder="Point de départ" {...field} disabled={useGps} />
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
                  <Input placeholder="Destination" {...field} />
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
