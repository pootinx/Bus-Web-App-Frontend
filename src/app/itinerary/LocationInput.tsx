
'use client';
import { useEffect, useRef, useState } from 'react';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { Input } from '@/components/ui/input';
import { Clock, MapPin, Search } from 'lucide-react';

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
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
    setValue(value, false);
  }, [value, setValue]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setValue(e.target.value);
  };

  const handleSelect = ({ description }: { description: string }) => async () => {
    setValue(description, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address: description });
      const { lat, lng } = await getLatLng(results[0]);
      onSelect({ lat, lng, address: description });
      setInputValue(description);
    } catch (error) {
      console.log('😱 Error: ', error);
    }
  };

  const renderSuggestions = () =>
    data.map((suggestion) => {
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
       <div className="relative">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            value={inputValue}
            onChange={handleInput}
            disabled={!ready}
            placeholder={placeholder}
            className="w-full pl-10"
          />
       </div>
      {status === 'OK' && (
        <ul className="absolute z-10 w-full mt-1 bg-card border rounded-lg shadow-lg p-2">
          {renderSuggestions()}
        </ul>
      )}
    </div>
  );
}
