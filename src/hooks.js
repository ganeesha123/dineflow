import { useEffect, useState } from 'react';
import { watchRestaurant, watchTables, watchReservations, watchQueue, watchQueueAll } from './services/db';

function useWatch(fn, initial) {
  const [v, setV] = useState(initial);
  useEffect(() => fn(setV), []);
  return v;
}

export const useRestaurant = () => useWatch(watchRestaurant, undefined); // undefined = loading, null = missing
export const useTables = () => useWatch(watchTables, []);
export const useReservations = () => useWatch(watchReservations, []);
export const useQueue = () => useWatch(watchQueue, []);
export const useQueueAll = () => useWatch(watchQueueAll, []);

// the signed-in customer's own ticket in the active line
export function useMyQueue(uid) {
  const list = useQueue();
  const idx = list.findIndex((e) => e.userId === uid);
  return { list, entry: idx >= 0 ? list[idx] : null, position: idx + 1, total: list.length };
}

// re-render every `ms` (for countdowns)
export function useTick(ms = 1000) {
  const [t, setT] = useState(Date.now());
  useEffect(() => {
    const i = setInterval(() => setT(Date.now()), ms);
    return () => clearInterval(i);
  }, [ms]);
  return t;
}
