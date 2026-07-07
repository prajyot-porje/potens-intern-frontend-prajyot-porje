"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, RefreshCw } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { DisplayText, Heading, ParagraphText, MonoText } from "@/components/typography";
import { Button, Card, Section, Divider, IconWrapper } from "@/components/primitives";
import { CATEGORIES } from "@/lib/utils/constants";
import { generateReferenceId } from "@/lib/utils/reference-id";
import { ReducedMotionWrapper } from "@/components/motion";

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useLanguage();

  const categoryKey = searchParams.get("category") || "other";
  const categoryConfig = CATEGORIES[categoryKey] || CATEGORIES.other;
  const description = searchParams.get("description") || "";

  const [mounted, setMounted] = useState(false);
  const [referenceId, setReferenceId] = useState("");
  const [timestamp, setTimestamp] = useState("");

  useEffect(() => {
    setMounted(true);
    setReferenceId(generateReferenceId(categoryKey));
    setTimestamp(
      new Date().toLocaleString(locale === "mr" ? "mr-IN" : "en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    );
  }, [categoryKey, locale]);

  const handleReset = () => {
    router.push("/category");
  };

  return (
    <ReducedMotionWrapper variantType="slideHorizontal" direction="forward" className="flex flex-col flex-1 gap-space-6">
      
      {/* Success Visual Area */}
      <Section spacing="space-4" className="flex flex-col items-center text-center pb-0">
        <div className="text-success mb-space-4">
          <IconWrapper icon={CheckCircle2} size="large" className="w-16 h-16 animate-none" />
        </div>
        <DisplayText size="medium" className="mb-space-2 !text-3xl tracking-tight font-bold">
          {t("confirmation.successTitle")}
        </DisplayText>
        <ParagraphText variant="regular" className="text-text-secondary max-w-[30ch]">
          {mounted ? timestamp : "..."}
        </ParagraphText>
      </Section>

      {/* Summary Details Card */}
      <Section spacing="space-4" className="py-0">
        <Card className="flex flex-col gap-space-4 border border-border bg-surface p-space-6 shadow-sm">
          {/* Reference ID Block */}
          <div className="flex flex-col gap-space-1">
            <ParagraphText variant="caption" className="uppercase tracking-wider !text-text-tertiary">
              {t("confirmation.referenceIdLabel")}
            </ParagraphText>
            <MonoText className="text-xl font-bold !text-text-primary tracking-wider select-all">
              {mounted ? referenceId : "..."}
            </MonoText>
          </div>

          <Divider />

          {/* Details Metadata List */}
          <div className="grid grid-cols-2 gap-space-4">
            <div className="flex flex-col gap-space-1">
              <ParagraphText variant="caption" className="uppercase tracking-wider !text-text-tertiary">
                {t("confirmation.categoryLabel")}
              </ParagraphText>
              <ParagraphText variant="uiLabel" className="!text-text-primary text-base">
                {t(categoryConfig.labelKey)}
              </ParagraphText>
            </div>
            
            <div className="flex flex-col gap-space-1">
              <ParagraphText variant="caption" className="uppercase tracking-wider !text-text-tertiary">
                {t("confirmation.statusLabel")}
              </ParagraphText>
              <ParagraphText variant="uiLabel" className="!text-success text-base font-semibold">
                {t("confirmation.statusSubmitted")}
              </ParagraphText>
            </div>
          </div>

          {description && (
            <>
              <Divider />
              <div className="flex flex-col gap-space-1">
                <ParagraphText variant="caption" className="uppercase tracking-wider !text-text-tertiary">
                  {t("confirmation.descriptionLabel")}
                </ParagraphText>
                <ParagraphText variant="regular" className="!text-text-primary italic leading-relaxed whitespace-pre-wrap max-w-full line-clamp-4">
                  &ldquo;{description}&rdquo;
                </ParagraphText>
              </div>
            </>
          )}
        </Card>
      </Section>

      {/* Next Steps Instructions */}
      <Section spacing="space-4" className="py-0">
        <div className="bg-surface-variant/40 border border-border p-space-4 rounded-md text-left">
          <Heading level={3} className="!text-sm font-semibold mb-space-1 !text-text-primary flex items-center gap-space-2">
            {t("confirmation.nextStepsTitle")}
          </Heading>
          <ParagraphText variant="caption" className="!text-text-secondary leading-relaxed">
            {t("confirmation.nextStepsDesc")}
          </ParagraphText>
        </div>
      </Section>

      {/* Return Action Button */}
      <div className="pt-space-6 pb-space-2 mt-auto border-t border-border/50">
        <Button
          variant="primary"
          fullWidth
          onClick={handleReset}
          className="w-full flex items-center justify-center gap-space-2 group transition-all"
        >
          <IconWrapper icon={RefreshCw} className="h-4 w-4 transition-transform group-hover:rotate-45" />
          <span>{t("confirmation.newReportButton")}</span>
        </Button>
      </div>

    </ReducedMotionWrapper>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col flex-1 items-center justify-center py-space-12">
        <ParagraphText variant="regular" className="animate-pulse">
          Generating confirmation details...
        </ParagraphText>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
