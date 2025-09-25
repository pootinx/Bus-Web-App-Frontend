
'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Clock, MapPin, Search } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce'; // Assuming you have a debounce hook

declare global {
  interface Window {
    google: any;
  }
}

type PlaceInfo = {
  lat: number;
  lng: number;
  address: string;
} | null;

type LocationInputProps = {
  value: string;
  onSelect: (place: PlaceInfo) => void;
  placeholder?: string;
  isLoaded: boolean;
};

export default function LocationInput({ value, onSelect, placeholder, isLoaded }: LocationInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoder = useRef<google.maps.Geocoder | null>(null);

  useEffect(() => {
    if (isLoaded && window.google) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      geocoder.current = new window.google.maps.Geocoder();
    }
  }, [isLoaded]);

  const debouncedInput = useDebounce(inputValue, 300);

  useEffect(() => {
    if (debouncedInput && autocompleteService.current) {
      autocompleteService.current.getPlacePredictions(
        { input: debouncedInput },
        (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions);
          } else {
            setSuggestions([]);
          }
        }
      );
    } else {
      setSuggestions([]);
    }
  }, [debouncedInput]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSelect = (prediction: google.maps.places.AutocompletePrediction) => async () => {
    setInputValue(prediction.description);
    setSuggestions([]);

    if (!geocoder.current) return;

    try {
      geocoder.current.geocode({ address: prediction.description }, (results, status) => {
        if (status === window.google.maps.GeocoderStatus.OK && results && results[0]) {
          const { lat, lng } = results[0].geometry.location;
          onSelect({ lat: lat(), lng: lng(), address: prediction.description });
        } else {
          console.error('Geocode was not successful for the following reason: ' + status);
          onSelect(null);
        }
      });
    } catch (error) {
      console.log('😱 Error: ', error);
    }
  };

  const renderSuggestions = () =>
    suggestions.map((suggestion) => {
      const {
        place_id,
        structured_formatting: { main_text, secondary_text },
        types,
      } = suggestion;
      
      const isHistory = types.includes('geocode') || types.includes('address');

      return (
        <li
          key={place_id}
          onClick={handleSelect(suggestion)}
          className="flex items-center gap-4 p-2 rounded-md cursor-pointer hover:bg-accent"
        >
          <div className="p-2 bg-gray-100 rounded-full">
            {isHistory ? (
              <Clock className="h-5 w-5 text-gray-500" />
            ) : (
              <MapPin className="h-5 w-5 text-gray-500" />
            )}
          </div>
          <div>
            <p className="font-medium">{main_text}</p>
            <p className="text-sm text-muted-foreground">{secondary_text}</p>
          </div>
        </li>
      );
    });
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);

  return (
    <div ref={ref} className="relative w-full">
       <div className="relative">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            value={inputValue}
            onChange={handleInput}
            disabled={!isLoaded}
            placeholder={placeholder}
            className="w-full pl-10"
          />
       </div>
      {suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-card border rounded-lg shadow-lg p-2">
          {renderSuggestions()}
        </ul>
      )}
    </div>
  );
}
