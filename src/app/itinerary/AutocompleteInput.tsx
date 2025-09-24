
'use client';

import { useEffect, useRef, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { Input } from '@/components/ui/input';

type AutocompleteInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
    value: string;
};

export const AutocompleteInput = ({ onPlaceSelect, value, ...props }: AutocompleteInputProps) => {
    const [autoComplete, setAutoComplete] = useState<google.maps.places.Autocomplete | null>(null);
    const places = useMapsLibrary('places');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!places || !inputRef.current) return;

        const options = {
            fields: ['formatted_address', 'geometry', 'name'],
            types: ['address']
        };

        const ac = new places.Autocomplete(inputRef.current, options);
        setAutoComplete(ac);

        return () => {
            if (window.google) {
                window.google.maps.event.clearInstanceListeners(ac);
            }
        };
    }, [places]);

    useEffect(() => {
        if (!autoComplete) return;

        const listener = autoComplete.addListener('place_changed', () => {
            const place = autoComplete.getPlace();
            onPlaceSelect(place);
        });

        return () => {
            if (window.google) {
                window.google.maps.event.removeListener(listener);
            }
        };
    }, [autoComplete, onPlaceSelect]);
    
    return <Input ref={inputRef} value={value} {...props} />;
};

AutocompleteInput.displayName = 'AutocompleteInput';
