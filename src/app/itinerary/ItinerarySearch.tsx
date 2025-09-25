
'use client';

import { useState } from 'react';
import type { ItineraryV2 } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Loader2, Search, ArrowRightLeft, MapPin, Circle, MoreVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ItineraryResults from './ItineraryResults';
import LocationInput from './LocationInput';
import { CITIES } from '@/lib/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type PlaceInfo = {
  lat: number;
  lng: number;
  address: string;
} | null;

export default function ItinerarySearch() {
  const [startPlace, setStartPlace] = useState<PlaceInfo>(null);
  const [destinationPlace, setDestinationPlace] = useState<PlaceInfo>(null);
  const [cityId, setCityId] = useState(1); // Default to Casablanca

  const [searchState, setSearchState] = useState<{
    loading: boolean;
    error: string | null;
    results: ItineraryV2[] | null;
  }>({ loading: false, error: null, results: null });

  const { toast } = useToast();

  const handleSwap = () => {
      const tempStart = startPlace;
      setStartPlace(destinationPlace);
      setDestinationPlace(tempStart);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      city_id: cityId.toString(),
    };

    try {
      const query = new URLSearchParams(params).toString();
      const response = await fetch(`/api/itinerary?${query}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'An unknown error occurred');
      }

      const rawResults = await response.json();
      const transformedResults = rawResults.v2_itin ?? [];

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
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className='flex gap-4'>
            <div className='flex flex-col items-center justify-center gap-1.5 py-2'>
                <Circle className="h-3 w-3" />
                <MoreVertical className="h-6 w-6 text-gray-300" />
                <MapPin className="h-4 w-4 text-red-500" />
            </div>
            <div className='flex-grow space-y-2'>
                <LocationInput
                    value={startPlace?.address || ''}
                    onSelect={(place) => setStartPlace(place)}
                    placeholder="Choose starting point"
                />
                <LocationInput
                    value={destinationPlace?.address || ''}
                    onSelect={(place) => setDestinationPlace(place)}
                    placeholder="Choose destination, or click on the map"
                />
            </div>
            <div className="flex items-center justify-center">
                 <Button type="button" variant="ghost" size="icon" onClick={handleSwap}>
                    <ArrowRightLeft className="h-5 w-5 text-gray-500" />
                </Button>
            </div>
        </div>
         <div className="space-y-2">
            <label className="text-sm font-medium">Ville</label>
            <Select onValueChange={(value) => setCityId(parseInt(value))} defaultValue={cityId.toString()}>
                <SelectTrigger>
                  <SelectValue placeholder="Selectionner une ville" />
                </SelectTrigger>
              <SelectContent>
                {CITIES.map((city) => (
                  <SelectItem key={city.id} value={city.id.toString()}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>
        <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={searchState.loading}>
            {searchState.loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            Rechercher
        </Button>
      </form>
      
      {searchState.loading && (
        <div className="flex justify-center p-8 mt-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      {searchState.error && (
        <div className="mt-8 text-center text-destructive">
          <p>Erreur: {searchState.error}</p>
          <Button variant="outline" onClick={() => handleSubmit(new Event('submit') as any)} className="mt-4">
            Réessayer
          </Button>
        </div>
      )}
      {searchState.results && <ItineraryResults itineraries={searchState.results} />}
    </div>
  );
}
