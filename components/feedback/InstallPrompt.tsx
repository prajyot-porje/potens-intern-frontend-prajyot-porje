"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { usePWA } from "../../hooks/usePWA";
import { useLanguage } from "../../lib/i18n";

const DISMISS_KEY = "nagrik_install_dismissed";

/**
 * InstallPrompt
 *
 * A native-feeling bottom sheet that invites the user to install the PWA.
 * - Only visible when `isInstallable` is true (beforeinstallprompt was captured).
 * - Not shown if the user dismissed it this session (sessionStorage).
 * - Does not block any functionality; install is always optional.
 * - Rounded top corners + safe-area-inset so it clears the home indicator on
 *   notched iOS / Android phones.
 */
export function InstallPrompt() {
  const { isInstallable, isInstalled, promptInstall } = usePWA();
  const { t } = useLanguage();
  // Start dismissed=true to avoid SSR flash
  const [dismissed, setDismissed] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const wasDismissed = sessionStorage.getItem(DISMISS_KEY) === "1";
    setDismissed(wasDismissed);
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    // Defer the unmount by one event-loop tick so the browser can finish the
    // current pointer event before the element is removed from the DOM.
    // Without this, Next.js DevTools throws a releasePointerCapture error.
    setTimeout(() => setDismissed(true), 0);
  };

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (!accepted) {
      handleDismiss();
    }
  };

  if (!mounted || !isInstallable || isInstalled || dismissed) return null;

  return (
    <div
      role="complementary"
      aria-label={t("pwa.installPrompt")}
      className="fixed bottom-0 left-0 right-0 z-40 animate-slide-up"
      style={{
        borderRadius: "16px 16px 0 0",
        backgroundColor: "var(--surface)",
        borderTop: "1px solid var(--border)",
        boxShadow: "var(--shadow-toast)",
        /* Push content above the home indicator on iOS/Android */
        paddingBottom: "max(16px, env(safe-area-inset-bottom))",
      }}
    >
      {/* Drag-handle pill — visual bottom-sheet affordance */}
      <div className="flex justify-center pt-3 pb-1" aria-hidden="true">
        <div
          className="w-8 h-1 rounded-full"
          style={{ backgroundColor: "var(--border-strong)" }}
        />
      </div>

      {/* Content area */}
      <div className="px-4 pt-2 pb-1">
        {/* Row: app icon + name + tagline + dismiss X */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/icon-192.png"
              alt="Nagrik app icon"
              width={48}
              height={48}
              className="rounded-xl shrink-0"
              style={{ border: "1px solid var(--border)" }}
            />
            <div className="flex flex-col min-w-0">
              <span
                className="text-sm font-semibold leading-tight"
                style={{ color: "var(--text-primary)" }}
              >
                {t("common.appTitle")}
              </span>
              <span
                className="text-xs leading-snug mt-0.5"
                style={{ color: "var(--text-secondary)" }}
              >
                {t("pwa.installPrompt")}
              </span>
            </div>
          </div>

          {/* Dismiss X */}
          <button
            onClick={handleDismiss}
            aria-label={t("pwa.dismiss")}
            className="h-8 w-8 flex items-center justify-center rounded-full shrink-0"
            style={{ color: "var(--text-tertiary)" }}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Primary CTA — full width, 48px height (meets touch target spec) */}
        <button
          onClick={handleInstall}
          aria-label={t("pwa.installButton")}
          className="w-full flex items-center justify-center text-sm font-semibold rounded-xl transition-opacity duration-150 active:opacity-80"
          style={{
            minHeight: "48px",
            backgroundColor: "var(--text-primary)",
            color: "var(--bg)",
          }}
        >
          {t("pwa.installButton")}
        </button>

        {/* Secondary dismiss text link */}
        <button
          onClick={handleDismiss}
          className="w-full text-center text-xs mt-3 mb-1 transition-opacity duration-150 active:opacity-60"
          style={{ color: "var(--text-tertiary)" }}
        >
          {t("pwa.dismiss")}
        </button>
      </div>
    </div>
  );
}

export default InstallPrompt;
