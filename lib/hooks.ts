"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

// Waits until the user stops typing before returning the new value,
// so we don't fire a request on every keystroke.
export function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// Favorites saved in localStorage, shared by every component that uses the hook.
const FAV_KEY = "astraspin-demo-favorites";
const listeners = new Set<() => void>();
let cache: string[] | null = null;
const EMPTY: string[] = [];

function readFavs(): string[] {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(FAV_KEY) ?? "[]") as string[];
  } catch {
    cache = [];
  }
  return cache;
}

function writeFavs(next: string[]) {
  cache = next;
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify(next));
  } catch {
    /* storage blocked: favorites last for this visit only */
  }
  listeners.forEach((l) => l());
}

export function useFavorites() {
  const favorites = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    readFavs,
    () => EMPTY, // during the static build there is no localStorage
  );
  const toggle = (id: string) =>
    writeFavs(favorites.includes(id) ? favorites.filter((f) => f !== id) : [...favorites, id]);
  return { favorites, toggle };
}
