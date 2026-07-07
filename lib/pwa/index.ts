/**
 * lib/pwa/index.ts
 *
 * Progressive Web App utilities:
 *   - Service Worker registration
 *   - beforeinstallprompt event capture
 *   - Install prompt trigger
 *   - Online/offline state
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOffline: boolean;
}

type PWAStateListener = (state: PWAState) => void;

// ---------------------------------------------------------------------------
// Module-level state (singleton)
// ---------------------------------------------------------------------------

let _deferredPrompt: BeforeInstallPromptEvent | null = null;
let _isInstalled = false;
let _isOffline = false;
let _listeners: PWAStateListener[] = [];

// Internal broadcast
function _notify() {
  const state: PWAState = {
    isInstallable: _deferredPrompt !== null && !_isInstalled,
    isInstalled: _isInstalled,
    isOffline: _isOffline,
  };
  _listeners.forEach((fn) => fn(state));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Subscribe to PWA state changes. Returns unsubscribe fn. */
export function subscribe(listener: PWAStateListener): () => void {
  _listeners.push(listener);
  return () => {
    _listeners = _listeners.filter((l) => l !== listener);
  };
}

/** Read current PWA state snapshot. */
export function getState(): PWAState {
  return {
    isInstallable: _deferredPrompt !== null && !_isInstalled,
    isInstalled: _isInstalled,
    isOffline: _isOffline,
  };
}

/** Trigger the native browser install prompt. Returns true if accepted. */
export async function promptInstall(): Promise<boolean> {
  if (!_deferredPrompt) return false;

  try {
    _deferredPrompt.prompt();
    const { outcome } = await _deferredPrompt.userChoice;
    _deferredPrompt = null;
    if (outcome === "accepted") {
      _isInstalled = true;
    }
    _notify();
    return outcome === "accepted";
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Service Worker registration
// ---------------------------------------------------------------------------

export function registerServiceWorker(): void {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        // Check for updates periodically (every 30 minutes)
        setInterval(() => registration.update(), 30 * 60 * 1000);
      })
      .catch((err) => {
        // SW registration failure is non-fatal — app still works
        console.warn("[PWA] Service worker registration failed:", err);
      });
  });
}

// ---------------------------------------------------------------------------
// Event bindings — called once on init
// ---------------------------------------------------------------------------

export function initPWA(): void {
  if (typeof window === "undefined") return;

  // Register SW
  registerServiceWorker();

  // Capture install prompt
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    _deferredPrompt = e as BeforeInstallPromptEvent;
    _notify();
  });

  // Detect if already installed (standalone mode)
  if (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  ) {
    _isInstalled = true;
    _notify();
  }

  // Track installed state changes
  window.addEventListener("appinstalled", () => {
    _isInstalled = true;
    _deferredPrompt = null;
    _notify();
  });

  // Track online/offline state
  _isOffline = !navigator.onLine;

  window.addEventListener("online", () => {
    _isOffline = false;
    _notify();
  });

  window.addEventListener("offline", () => {
    _isOffline = true;
    _notify();
  });
}

// ---------------------------------------------------------------------------
// BeforeInstallPromptEvent type (not in standard TS lib)
// ---------------------------------------------------------------------------

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
  prompt(): Promise<void>;
}
