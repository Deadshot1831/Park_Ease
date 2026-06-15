import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

// Subscribes to live availability updates. `onUpdate` receives
// { spotId, availableSpots, totalSpots } for any spot that changes.
export const useAvailabilitySocket = (onUpdate, spotId) => {
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('availability:update', onUpdate);
    if (spotId) {
      socket.emit('spot:subscribe', spotId);
      socket.on('spot:availability', onUpdate);
    }

    return () => {
      if (spotId) socket.emit('spot:unsubscribe', spotId);
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotId]);

  return socketRef;
};
