"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { DisplayText, Heading, ParagraphText, MonoText } from "@/components/typography";
import { Button, Card, Section, Divider, IconWrapper } from "@/components/primitives";
import { CATEGORIES } from "@/lib/utils/constants";
import { getSubmissionById, Submission } from "@/lib/storage";
import { ReducedMotionWrapper, CheckmarkDraw, StaggeredRefId } from "@/components/motion";

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useLanguage();

  const submissionId = searchParams.get("id") || "";
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const record = getSubmissionById(submissionId);
    if (!record) {
      router.replace("/category");
      return;
    }
    setSubmission(record);
  }, [submissionId, router]);

  const handleReset = () => {
    // Navigate back to a clean category selection screen with backward transition
    router.push("/category?dir=backward");
  };

  // Render a loading state during hydration or database check to prevent flash of empty values
  if (!mounted || !submission) {
    return (
      <div className="flex flex-col flex-1 gap-space-6 animate-pulse">
        {/* Success Visual Area Skeleton */}
        <Section spacing="space-4" className="flex flex-col items-center text-center pb-0">
          <div className="w-16 h-16 rounded-full bg-surface-variant mb-space-4" />
          <div className="h-8 w-48 bg-surface-variant rounded mb-space-2" />
          <div className="h-4 w-32 bg-surface-variant rounded" />
        </Section>

        {/* Summary Details Card Skeleton */}
        <Section spacing="space-4" className="py-0">
          <div className="border border-border bg-surface p-space-6 rounded-lg flex flex-col gap-space-4">
            <div className="flex flex-col gap-space-2">
              <div className="h-3 w-20 bg-surface-variant rounded" />
              <div className="h-6 w-40 bg-surface-variant rounded" />
            </div>
            <Divider />
            <div className="grid grid-cols-2 gap-space-4">
              <div className="flex flex-col gap-space-2">
                <div className="h-3 w-16 bg-surface-variant rounded" />
                <div className="h-5 w-24 bg-surface-variant rounded" />
              </div>
              <div className="flex flex-col gap-space-2">
                <div className="h-3 w-16 bg-surface-variant rounded" />
                <div className="h-5 w-24 bg-surface-variant rounded" />
              </div>
            </div>
          </div>
        </Section>

        {/* Next Steps Instructions Skeleton */}
        <Section spacing="space-4" className="py-0">
          <div className="border border-border bg-surface-variant/40 p-space-4 rounded-md h-24" />
        </Section>

        {/* Return Action Button Skeleton */}
        <div className="pt-space-6 pb-space-2 mt-auto border-t border-border/50">
          <div className="w-full h-12 bg-surface-variant rounded" />
        </div>
      </div>
    );
  }

  const categoryConfig = CATEGORIES[submission.category] || CATEGORIES.other;
  const timestamp = new Date(submission.createdAt).toLocaleString(
    locale === "mr" ? "mr-IN" : "en-US",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );

  return (
    <ReducedMotionWrapper variantType="slideHorizontal" direction="forward" className="flex flex-col flex-1 gap-space-6">
      
      {/* Success Visual Area */}
      <Section spacing="space-4" className="flex flex-col items-center text-center pb-0">
        <div className="text-success mb-space-4">
          <CheckmarkDraw />
        </div>
        <DisplayText size="medium" className="mb-space-2 !text-3xl tracking-tight font-bold">
          {t("confirmation.successTitle")}
        </DisplayText>
        <ParagraphText variant="regular" className="text-text-secondary max-w-[30ch]">
          {timestamp}
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
            <div className="text-xl font-bold !text-text-primary tracking-wider select-all h-7 flex items-center">
              <StaggeredRefId id={submission.id} />
            </div>
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

          {submission.description && (
            <>
              <Divider />
              <div className="flex flex-col gap-space-1">
                <ParagraphText variant="caption" className="uppercase tracking-wider !text-text-tertiary">
                  {t("confirmation.descriptionLabel")}
                </ParagraphText>
                <ParagraphText variant="regular" className="!text-text-primary italic leading-relaxed whitespace-pre-wrap max-w-full line-clamp-4">
                  &ldquo;{submission.description}&rdquo;
                </ParagraphText>
              </div>
            </>
          )}

          {submission.photo && (
            <>
              <Divider />
              <div className="flex flex-col gap-space-2">
                <ParagraphText variant="caption" className="uppercase tracking-wider !text-text-tertiary">
                  {t("confirmation.photoLabel")}
                </ParagraphText>
                <div className="border border-border rounded-md overflow-hidden bg-surface-variant max-w-[200px] aspect-square relative shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={submission.photo}
                    alt="Submitted complaint attachment"
                    className="w-full h-full object-cover"
                  />
                </div>
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
          className="w-full flex items-center justify-center gap-space-2 group btn-hover-group"
        >
          <IconWrapper icon={RefreshCw} className="h-4 w-4 transition-transform duration-200 ease-out btn-hover-rotate" />
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
