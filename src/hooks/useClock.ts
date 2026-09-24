import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

export function useClock() {
  const [now, setNow] = useState(Date.now);
  useFocusEffect(
    useCallback(() => {
      setNow(Date.now());
      const timer = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(timer);
    }, []),
  );
  useEffect(() => {
    const listener = AppState.addEventListener('change', (s) => {
      if (s === 'active') setNow(Date.now());
    });
    return () => listener.remove();
  }, []);
  return now;
}
