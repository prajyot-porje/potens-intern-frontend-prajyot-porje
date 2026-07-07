"use client";

import React from "react";
import { HelpCircle, ArrowLeft } from "lucide-react";
import { DisplayText, ParagraphText } from "@/components/typography";
import { Button, IconWrapper } from "@/components/primitives";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-space-4 py-space-12 text-center max-w-[400px] mx-auto flex-1">
      {/* Icon visual */}
      <div className="text-text-secondary mb-space-6 bg-surface-variant p-space-3 rounded-full border border-border">
        <IconWrapper icon={HelpCircle} size="large" className="w-12 h-12" />
      </div>

      <DisplayText size="medium" className="mb-space-2 font-bold tracking-tight !text-2xl md:!text-3xl">
        Page Not Found
      </DisplayText>

      <ParagraphText variant="regular" className="text-text-secondary mb-space-8 leading-relaxed">
        The requested screen does not exist or may have moved. Let&apos;s return to the complaint reporting flow.
      </ParagraphText>

      <Button
        variant="primary"
        fullWidth
        onClick={() => {
          if (typeof window !== "undefined") {
            window.location.href = "/category";
          }
        }}
        className="w-full flex items-center justify-center gap-space-2 transition-transform active:scale-98"
      >
        <IconWrapper icon={ArrowLeft} className="h-4 w-4" />
        <span>Return to Categories</span>
      </Button>
    </div>
  );
}
