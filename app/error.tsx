"use client";

import React, { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { DisplayText, Heading, ParagraphText } from "@/components/typography";
import { Button, Card, IconWrapper } from "@/components/primitives";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error for diagnostics
    console.error("Unhandled global runtime error:", error);
  }, [error]);

  const handleClearAndReset = () => {
    try {
      // Recovery logic: if localStorage drafts are corrupted and cause the crash, clear them
      window.localStorage.removeItem("nagrik_draft_category");
      window.localStorage.removeItem("nagrik_draft_description");
      window.localStorage.removeItem("nagrik_draft_photo");
    } catch {}
    reset();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-space-4 py-space-12 text-center max-w-[440px] mx-auto flex-1">
      {/* Icon visual using semantic error color */}
      <div className="text-error mb-space-4 bg-error/10 p-space-3 rounded-full border border-error/20">
        <IconWrapper icon={AlertCircle} size="large" className="w-12 h-12" />
      </div>

      <DisplayText size="medium" className="mb-space-2 font-bold tracking-tight !text-2xl md:!text-3xl">
        Something went wrong
      </DisplayText>

      <ParagraphText variant="regular" className="text-text-secondary mb-space-8 max-w-[32ch] leading-relaxed">
        An unexpected application error occurred. We have prepared recovery controls to help you resume.
      </ParagraphText>

      <Card className="flex flex-col gap-space-4 border border-border bg-surface p-space-6 w-full text-left rounded-lg shadow-sm mb-space-8">
        <Heading level={3} className="!text-xs font-mono uppercase tracking-[0.2em] text-text-tertiary">
          Error Diagnostics
        </Heading>
        <p className="text-xs font-mono text-text-secondary bg-surface-variant p-space-3 rounded border border-border leading-relaxed overflow-x-auto max-w-full">
          {error.message || "Unknown rendering exception"}
        </p>
      </Card>

      <div className="flex flex-col gap-space-3 w-full">
        <Button
          variant="primary"
          fullWidth
          onClick={handleClearAndReset}
          className="w-full flex items-center justify-center gap-space-2 transition-transform active:scale-98"
        >
          <IconWrapper icon={RefreshCw} className="h-4 w-4" />
          <span>Reset and Try Again</span>
        </Button>
        <Button
          variant="secondary"
          fullWidth
          onClick={() => {
            if (typeof window !== "undefined") {
              window.location.href = "/category";
            }
          }}
          className="w-full text-sm font-medium"
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
}
