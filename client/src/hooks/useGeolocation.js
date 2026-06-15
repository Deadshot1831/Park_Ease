import { useState, useEffect } from 'react';

// Default to central Bengaluru (matches the seed data) when geolocation is unavailable
const DEFAULT = { lat: 12.9759, lng: 77.6045 };

export const useGeolocation = () => {
  const [position, setPosition] = useState(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      () => {
        setDenied(true);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  return { position, setPosition, loading, denied };
};
