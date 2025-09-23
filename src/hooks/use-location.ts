'use client';

import { useState, useCallback } from 'react';

export type LocationState = {
  loading: boolean;
  error: GeolocationPositionError | Error | null;
  position: GeolocationPosition | null;
};

export const useLocation = () => {
  const [locationState, setLocationState] = useState<LocationState>({
    loading: false,
    error: null,
    position: null,
  });

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationState({
        loading: false,
        error: new Error('Geolocation is not supported by your browser'),
        position: null,
      });
      return;
    }

    setLocationState({ loading: true, error: null, position: null });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationState({ loading: false, error: null, position });
      },
      (error) => {
        setLocationState({ loading: false, error, position: null });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  const clearLocation = useCallback(() => {
    setLocationState({
      loading: false,
      error: null,
      position: null,
    });
  }, []);

  return { ...locationState, getLocation, clearLocation };
};
