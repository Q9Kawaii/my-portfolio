"use client";
import { useCallback, useMemo, useSyncExternalStore } from "react";

// Small client-only helpers for the demos. Both render a stable server value first
// (so hydration matches) and switch to the browser's value right after.

const noop = () => () => {};

/** false during server render and hydration, true afterwards. */
export function useHydrated() {
  return useSyncExternalStore(noop, () => true, () => false);
}

// In-memory copy, used when localStorage is blocked (private mode, disabled storage).
const memory = new Map<string, string>();
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(key) ?? memory.get(key) ?? null;
  } catch {
    return memory.get(key) ?? null;
  }
}

/**
 * JSON value kept in localStorage and shared by every component using the same key.
 * `fallback` should be a stable reference (a module-level constant).
 */
export function useLocalStore<T>(key: string, fallback: T): [T, (next: T) => void] {
  const raw = useSyncExternalStore(subscribe, () => read(key), () => null);
  const value = useMemo(() => {
    if (raw === null) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }, [raw, fallback]);

  const set = useCallback(
    (next: T) => {
      const s = JSON.stringify(next);
      memory.set(key, s);
      try {
        localStorage.setItem(key, s);
      } catch {}
      listeners.forEach((l) => l());
    },
    [key],
  );
  return [value, set];
}
