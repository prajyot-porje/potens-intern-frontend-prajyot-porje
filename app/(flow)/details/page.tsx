"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Camera, Mic, Check, HelpCircle, Road, Trash2, Droplet, Lightbulb, ShieldAlert } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { DisplayText, Heading, ParagraphText } from "@/components/typography";
import { Button, Card, Section, TextArea, IconWrapper } from "@/components/primitives";
import { CATEGORIES } from "@/lib/utils/constants";
import { ReducedMotionWrapper } from "@/components/motion";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<any>> = {
  Road,
  Trash2,
  Droplet,
  Lightbulb,
  ShieldAlert,
  HelpCircle,
};

function DetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const categoryKey = searchParams.get("category") || "other";
  const categoryConfig = CATEGORIES[categoryKey] || CATEGORIES.other;
  const IconComp = iconMap[categoryConfig.icon] || HelpCircle;

  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate submission without executing real storage logic or validation blockage
    router.replace(`/confirmation?category=${categoryKey}&description=${encodeURIComponent(description)}`);
  };

  const handleCancel = () => {
    router.push(`/category?category=${categoryKey}`);
  };

  const charCount = description.length;
  const charsRemaining = Math.max(0, 500 - charCount);

  return (
    <ReducedMotionWrapper variantType="slideHorizontal" direction="forward" className="flex flex-col flex-1">
      {/* Category Badge & Screen Title */}
      <Section spacing="space-4" className="text-left pb-0">
        <div className="inline-flex items-center gap-space-2 bg-surface-variant border border-border px-space-3 py-space-1 rounded-full text-xs text-text-primary mb-space-3">
          <IconWrapper icon={IconComp} size="micro" />
          <span className="font-uiLabel">{t(categoryConfig.labelKey)}</span>
        </div>
        <DisplayText size="medium" className="mb-space-2 !text-3xl md:!text-4xl tracking-tight font-bold">
          {t("form.title")}
        </DisplayText>
      </Section>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between">
        <Section spacing="space-6" className="flex-1 flex flex-col gap-space-6 pb-0">
          
          {/* Description Textarea Field */}
          <div className="flex flex-col gap-space-2">
            <label htmlFor="description" className="font-uiLabel text-sm text-text-primary">
              {t("form.descriptionLabel")}
            </label>
            <TextArea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 500))}
              placeholder={t("form.descriptionPlaceholder")}
              className="min-h-[160px] text-base"
              maxLength={500}
              required
            />
            <div className="flex justify-between items-center text-xs">
              <span className={cn(
                "transition-colors",
                charCount > 450 ? "text-error" : "text-text-tertiary"
              )}>
                {t("form.charRemaining", { count: charsRemaining })}
              </span>
              <span className="text-text-tertiary font-mono">
                {charCount}/500
              </span>
            </div>
          </div>

          {/* Placeholders for Upload & Voice */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-4">
            
            {/* Voice Input Placeholder Card */}
            <Card className="flex flex-col items-center justify-center p-space-4 border border-border bg-surface text-center h-44 relative group">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-surface-variant border border-border text-text-secondary group-hover:text-text-primary transition-colors mb-space-2">
                <IconWrapper icon={Mic} size="standard" />
              </div>
              <Heading level={3} className="!text-sm font-semibold mb-space-1">
                {t("form.voiceLabel")}
              </Heading>
              <ParagraphText variant="caption" className="max-w-[20ch] !text-text-secondary">
                {t("form.voiceTapToSpeak")}
              </ParagraphText>
            </Card>

            {/* Photo Upload Placeholder Card */}
            <Card className="flex flex-col items-center justify-center p-space-4 border border-dashed border-border-strong bg-surface/30 text-center h-44 relative group">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-surface-variant border border-border text-text-secondary group-hover:text-text-primary transition-colors mb-space-2">
                <IconWrapper icon={Camera} size="standard" />
              </div>
              <Heading level={3} className="!text-sm font-semibold mb-space-1">
                {t("form.photoLabel")}
              </Heading>
              <ParagraphText variant="caption" className="max-w-[20ch] !text-text-secondary">
                {t("form.addPhoto")}
              </ParagraphText>
            </Card>

          </div>
        </Section>

        {/* Action Buttons */}
        <div className="pt-space-6 pb-space-2 mt-auto border-t border-border/50 flex flex-col sm:flex-row gap-space-3">
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-1/3 flex items-center justify-center"
            onClick={handleCancel}
          >
            {t("common.back")}
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="w-full sm:w-2/3 flex items-center justify-center gap-space-2"
          >
            <span>{t("common.submit")}</span>
            <IconWrapper icon={Check} className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </ReducedMotionWrapper>
  );
}

export default function DetailsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col flex-1 items-center justify-center py-space-12">
        <ParagraphText variant="regular" className="animate-pulse">
          Loading report details...
        </ParagraphText>
      </div>
    }>
      <DetailsContent />
    </Suspense>
  );
}
