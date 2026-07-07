"use client";

import React, { useEffect, useState, useRef } from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import { useLanguage } from "../../hooks/useLanguage";
import { IconWrapper } from "../primitives";
import { getSubmissions, syncQueuedSubmissions } from "../../lib/storage";

type BannerState = "online" | "offline" | "syncing" | "reconnected";

export function OfflineBanner() {
  const isOnline = useNetworkStatus();
  const { t } = useLanguage();
  const [bannerState, setBannerState] = useState<BannerState>("online");
  const wasOfflineRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isOnline) {
      wasOfflineRef.current = true;
      Promise.resolve().then(() => setBannerState("offline"));
    } else {
      if (wasOfflineRef.current) {
        // We transitioned from offline to online
        wasOfflineRef.current = false;
        
        // Check if there are queued reports to sync
        const currentReports = getSubmissions();
        const hasQueued = currentReports.some((r) => r.status === "queued");

        if (hasQueued) {
          Promise.resolve().then(() => setBannerState("syncing"));
          // Simulate sync delay of 1.5 seconds
          const syncTimer = setTimeout(() => {
            syncQueuedSubmissions();
            // Dispatch custom event to notify confirmation page to update
            window.dispatchEvent(new CustomEvent("submissions-synced"));
            setBannerState("reconnected");
            
            // Hide the success banner after 4 seconds
            const hideTimer = setTimeout(() => {
              setBannerState("online");
            }, 4000);
            
            return () => clearTimeout(hideTimer);
          }, 1500);
          
          return () => clearTimeout(syncTimer);
        } else {
          // If no reports were queued, show reconnected briefly anyway to acknowledge connection return
          Promise.resolve().then(() => setBannerState("reconnected"));
          const hideTimer = setTimeout(() => {
            setBannerState("online");
          }, 3000);
          return () => clearTimeout(hideTimer);
        }
      } else {
        Promise.resolve().then(() => setBannerState("online"));
      }
    }
  }, [isOnline]);

  if (bannerState === "online") return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="
        fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50
        flex items-center gap-space-3
        px-space-4 py-space-3
        border-b border-border bg-surface
        shadow-overlay
        animate-slide-down
      "
    >
      <div className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full">
        {bannerState === "offline" && (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-warning/10 text-warning">
            <IconWrapper icon={WifiOff} className="h-4 w-4" />
          </div>
        )}
        {bannerState === "syncing" && (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-variant text-text-secondary">
            <IconWrapper icon={RefreshCw} className="h-4 w-4 animate-spin" />
          </div>
        )}
        {bannerState === "reconnected" && (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-success/10 text-success">
            <IconWrapper icon={Wifi} className="h-4 w-4" />
          </div>
        )}
      </div>
      
      <div className="flex flex-col flex-1 text-left">
        <span className="text-xs font-semibold text-text-primary leading-tight">
          {bannerState === "offline" && t("pwa.offlineShort")}
          {bannerState === "syncing" && t("common.loading")}
          {bannerState === "reconnected" && t("confirmation.successTitle")}
        </span>
        <span className="text-[11px] text-text-secondary leading-snug mt-0.5 max-w-[360px]">
          {bannerState === "offline" && t("pwa.offlineBanner")}
          {bannerState === "syncing" && t("pwa.syncingBanner")}
          {bannerState === "reconnected" && t("pwa.reconnectBanner")}
        </span>
      </div>
    </div>
  );
}

export default OfflineBanner;
