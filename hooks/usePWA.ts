"use client";

import { useState, useEffect } from "react";
import {
  initPWA,
  getState,
  subscribe,
  promptInstall,
  type PWAState,
} from "../lib/pwa";

let _initialized = false;

/**
 * usePWA
 *
 * React hook that exposes PWA state and actions:
 *   - isInstallable  : true when browser install prompt is capturable
 *   - isInstalled    : true when running in standalone mode
 *   - isOffline      : true when navigator.onLine === false
 *   - promptInstall  : triggers the native install dialog
 */
export function usePWA() {
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOffline: false,
  });

  useEffect(() => {
    // Initialise PWA once across the whole app lifetime
    if (!_initialized) {
      initPWA();
      _initialized = true;
    }

    // Sync current state immediately (in case init already ran)
    setState(getState());

    // Subscribe to future changes
    const unsubscribe = subscribe(setState);
    return unsubscribe;
  }, []);

  return {
    ...state,
    promptInstall,
  };
}

export default usePWA;
