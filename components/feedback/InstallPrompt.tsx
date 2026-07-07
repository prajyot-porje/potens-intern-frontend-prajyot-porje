"use client";

import React, { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { usePWA } from "../../hooks/usePWA";
import { useLanguage } from "../../lib/i18n";
import { Button } from "../primitives";
import { IconWrapper } from "../primitives";

const DISMISS_KEY = "nagrik_install_dismissed";

/**
 * InstallPrompt
 *
 * A subtle bottom banner that offers to install the PWA.
 * - Only visible when `isInstallable` is true (beforeinstallprompt was captured).
 * - Not shown if the user dismissed it this session.
 * - Does not block any functionality; install is always optional.
 * - Accessible: role="complementary", keyboard dismissable.
 */
export function InstallPrompt() {
  const { isInstallable, isInstalled, promptInstall } = usePWA();
  const { t } = useLanguage();
  const [dismissed, setDismissed] = useState(true); // Start hidden to prevent flash
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check session-level dismissal
    const wasDismissed = sessionStorage.getItem(DISMISS_KEY) === "1";
    setDismissed(wasDismissed);
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (!accepted) {
      // User declined native prompt — dismiss our banner for this session
      handleDismiss();
    }
  };

  // Don't render until mounted (SSR safety) and only when installable and not dismissed
  if (!mounted || !isInstallable || isInstalled || dismissed) return null;

  return (
    <div
      role="complementary"
      aria-label={t("pwa.installPrompt")}
      className="
        fixed bottom-0 left-0 right-0 z-40
        flex items-center justify-between gap-3
        px-4 py-3
        border-t border-border
        animate-slide-up
      "
      style={{
        backgroundColor: "var(--surface)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      {/* Icon + message */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className="h-8 w-8 rounded-md flex items-center justify-center shrink-0 border border-border"
          style={{ backgroundColor: "var(--surface-variant)" }}
        >
          <IconWrapper icon={Download} className="h-4 w-4 text-text-secondary" />
        </div>
        <p className="text-sm text-text-secondary leading-snug truncate">
          {t("pwa.installPrompt")}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="secondary"
          className="!h-8 !min-h-8 !px-3 !text-xs"
          onClick={handleInstall}
          aria-label={t("pwa.installButton")}
        >
          {t("pwa.installButton")}
        </Button>

        <button
          onClick={handleDismiss}
          aria-label={t("pwa.dismiss")}
          className="
            h-8 w-8 flex items-center justify-center rounded-md
            text-text-tertiary hover:text-text-secondary
            hover:bg-surface-variant
            transition-colors duration-150
            focus-visible:outline-none focus-visible:ring-2
          "
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export default InstallPrompt;
