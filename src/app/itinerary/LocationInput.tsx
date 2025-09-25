
'use client';
import { useEffect, useRef, useState } from 'react';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { Input } from '@/components/ui/input';
import { Clock, MapPin } from 'lucide-react';

type PlaceInfo = {
  lat: number;
  lng: number;
  address: string;
} | null;

type LocationInputProps = {
  value: string;
  onSelect: (place: PlaceInfo) => void;
  placeholder?: string;
};

export default function LocationInput({ value, onSelect, placeholder }: LocationInputProps) {
  const {
    ready,
    value: autocompleteValue,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      /* Define search scope here */
    },
    debounce: 300,
  });
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setValue(value);
  }, [value, setValue]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleSelect = ({ description }: { description: string }) => async () => {
    setValue(description, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address: description });
      const { lat, lng } = await getLatLng(results[0]);
      onSelect({ lat, lng, address: description });
    } catch (error) {
      console.log('😱 Error: ', error);
    }
  };

  const renderSuggestions = () =>
    data.map((suggestion) => {
      const {
        place_id,
        structured_formatting: { main_text, secondary_text },
      } = suggestion;

      return (
        <li
          key={place_id}
          onClick={handleSelect(suggestion)}
          className="flex items-center gap-4 p-2 rounded-md cursor-pointer hover:bg-accent"
        >
          <div className="p-2 bg-gray-100 rounded-full">
            <MapPin className="h-5 w-5 text-gray-500" />
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
        clearSuggestions();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, clearSuggestions]);

  return (
    <div ref={ref} className="relative w-full">
      <Input
        value={autocompleteValue}
        onChange={handleInput}
        disabled={!ready}
        placeholder={placeholder}
        className="w-full"
      />
      {status === 'OK' && (
        <ul className="absolute z-10 w-full mt-1 bg-card border rounded-lg shadow-lg">
          {renderSuggestions()}
        </ul>
      )}
    </div>
  );
}
