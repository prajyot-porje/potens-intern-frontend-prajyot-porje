"use client";

import { useState, useEffect } from "react";

/**
 * useNetworkStatus
 * 
 * A React hook that monitors client network connectivity.
 * Listens to standard 'online' and 'offline' window events.
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof window !== "undefined" ? window.navigator.onLine : true
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      Promise.resolve().then(() => setIsOnline(true));
    };
    
    const handleOffline = () => {
      Promise.resolve().then(() => setIsOnline(false));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Sync state immediately on mount
    Promise.resolve().then(() => {
      setIsOnline(window.navigator.onLine);
    });

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

export default useNetworkStatus;
