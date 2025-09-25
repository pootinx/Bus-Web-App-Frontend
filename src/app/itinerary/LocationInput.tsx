
'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

type PlaceInfo = {
  lat: number;
  lng: number;
  address: string;
} | null;

type AutocompletePrediction = {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
};

type LocationInputProps = {
  value: string;
  onSelect: (place: PlaceInfo) => void;
  placeholder?: string;
  isDisabled?: boolean;
};

export default function LocationInput({ value, onSelect, placeholder, isDisabled }: LocationInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<AutocompletePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const debouncedInput = useDebounce(inputValue, 300);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const fetchSuggestions = useCallback(async (input: string) => {
    if (input.length < 3) {
      setSuggestions([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`/api/places?input=${encodeURIComponent(input)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }
      const data = await response.json();
      setSuggestions(data.predictions || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedInput && debouncedInput !== value) {
      fetchSuggestions(debouncedInput);
    } else {
      setSuggestions([]);
    }
  }, [debouncedInput, fetchSuggestions, value]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSelect = (suggestion: AutocompletePrediction) => async () => {
    setInputValue(suggestion.description);
    setSuggestions([]);
    setShowSuggestions(false);
    setIsLoading(true);
    try {
      const response = await fetch(`/api/places/details?placeId=${suggestion.place_id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch place details');
      }
      const data = await response.json();
      if (data.result && data.result.geometry) {
        onSelect({
          address: suggestion.description,
          lat: data.result.geometry.location.lat,
          lng: data.result.geometry.location.lng,
        });
      }
    } catch (error) {
      console.error("Error fetching place details:", error);
      onSelect(null);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <Input
        value={inputValue}
        onChange={handleInput}
        disabled={isDisabled}
        placeholder={placeholder}
        className="w-full"
        onFocus={() => { if(suggestions.length > 0) setShowSuggestions(true); }}
      />
      {isLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-gray-400" />}
      
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-card border rounded-lg shadow-lg">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.place_id}
              onClick={handleSelect(suggestion)}
              className="flex items-center gap-4 p-2 rounded-md cursor-pointer hover:bg-accent"
            >
              <div className="p-2 bg-gray-100 rounded-full">
                <MapPin className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p className="font-medium">{suggestion.structured_formatting.main_text}</p>
                <p className="text-sm text-muted-foreground">{suggestion.structured_formatting.secondary_text}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
