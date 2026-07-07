"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sun, Moon, Languages, Activity, ArrowLeft } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import { useLanguage } from "../../hooks/useLanguage";
import { Heading, ParagraphText, MonoText } from "../../components/typography";
import { Button, IconWrapper } from "../../components/primitives";
import { OfflineBanner, InstallPrompt } from "../../components/feedback";

export default function FlowLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { locale, setLanguage, t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cycleLanguage = () => {
    setLanguage(locale === "en" ? "mr" : "en");
  };

  const handleBack = () => {
    if (pathname === "/confirmation") {
      router.push("/category");
    } else {
      router.back();
    }
  };

  const showBackButton = pathname === "/details" || pathname === "/confirmation";

  return (
    <div className="flex flex-col flex-1 min-h-screen py-space-4 md:py-space-6 relative">
      {/* PWA offline indicator */}
      <OfflineBanner />
      {/* PWA install prompt */}
      <InstallPrompt />
      {/* Header section with theme/lang controls */}
      <header className="flex items-center justify-between border-b border-border pb-space-4 h-16 min-h-16 relative z-10">
        <div className="flex items-center gap-space-2 min-w-[120px]">
          {mounted && showBackButton ? (
            <Button
              variant="secondary"
              className="!min-h-[40px] !h-[40px] !w-[40px] !p-0 rounded-md border border-border-strong hover:bg-surface-variant transition-transform active:scale-95 flex items-center justify-center"
              onClick={handleBack}
              aria-label={t("common.back")}
            >
              <IconWrapper icon={ArrowLeft} className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex items-center gap-space-2">
              <IconWrapper icon={Activity} className="text-text-primary" />
              <Heading level={2} className="!text-lg">
                {t("common.appTitle")}
              </Heading>
            </div>
          )}
        </div>
        
        {/* Contextual screen title in center of header */}
        {mounted && showBackButton && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden xs:block">
            <Heading level={2} className="!text-base whitespace-nowrap">
              {pathname === "/details" ? t("form.title") : t("confirmation.successTitle")}
            </Heading>
          </div>
        )}

        <div className="flex gap-space-2 min-w-[120px] justify-end">
          {/* Language Toggle */}
          <Button
            variant="secondary"
            className="!min-h-[40px] !h-[40px] !px-space-3 text-xs flex items-center gap-space-1"
            onClick={cycleLanguage}
            aria-label="Toggle language"
          >
            <IconWrapper icon={Languages} className="h-3.5 w-3.5" />
            <span className="font-uiLabel">{t("common.toggleLanguage")}</span>
          </Button>

          {/* Theme Cycle Toggle */}
          <Button
            variant="secondary"
            className="!min-h-[40px] !h-[40px] !w-[40px] !p-0 flex items-center justify-center"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <IconWrapper
              icon={mounted && resolvedTheme === "light" ? Moon : Sun}
              className="h-4 w-4"
            />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col py-space-4">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border pt-space-4 flex justify-between items-center h-12 min-h-12 text-text-secondary">
        <ParagraphText variant="caption" className="!text-text-secondary">
          {t("common.appTitle")} · Potens Internship
        </ParagraphText>
        <MonoText className="text-xs text-text-tertiary">
          v0.1.0-alpha
        </MonoText>
      </footer>
    </div>
  );
}
