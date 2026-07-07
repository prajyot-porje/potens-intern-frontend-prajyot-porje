"use client";

import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isMounted, setIsMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        const parsed = JSON.parse(item);
        Promise.resolve().then(() => {
          setStoredValue(parsed);
          setIsMounted(true);
        });
      } else {
        Promise.resolve().then(() => {
          setIsMounted(true);
        });
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      Promise.resolve().then(() => {
        setIsMounted(true);
      });
    }
  }, [key]);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [isMounted ? storedValue : initialValue, setValue] as const;
}

export default useLocalStorage;
