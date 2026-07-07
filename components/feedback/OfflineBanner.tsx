"use client";

import React, { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { usePWA } from "../../hooks/usePWA";
import { useLanguage } from "../../lib/i18n";

/**
 * OfflineBanner
 *
 * A fixed top notification strip that appears when the user goes offline.
 * Uses the --warning semantic color token — honest, non-alarming.
 * Respects prefers-reduced-motion for the entrance animation.
 */
export function OfflineBanner() {
  const { isOffline } = usePWA();
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  // Small delay avoids flashing on fast reconnects
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isOffline) {
      timer = setTimeout(() => setVisible(true), 300);
    } else {
      setVisible(false);
    }
    return () => clearTimeout(timer);
  }, [isOffline]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="
        fixed top-0 left-0 right-0 z-50
        flex items-center justify-center gap-2
        px-4 py-2.5
        text-sm font-medium
        animate-slide-down
      "
      style={{
        backgroundColor: "var(--warning)",
        color: "#fff",
      }}
    >
      <WifiOff
        className="h-3.5 w-3.5 shrink-0"
        aria-hidden="true"
      />
      <span>{t("pwa.offline")}</span>
    </div>
  );
}

export default OfflineBanner;
