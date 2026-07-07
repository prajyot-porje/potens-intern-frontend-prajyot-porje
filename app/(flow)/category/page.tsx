"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Road, Trash2, Droplet, Lightbulb, ShieldAlert, HelpCircle, ArrowRight } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { DisplayText, Heading, ParagraphText } from "@/components/typography";
import { Button, Card, Section, IconWrapper } from "@/components/primitives";
import { CATEGORY_LIST } from "@/lib/utils/constants";
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

function CategoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  
  // Read category from URL parameter to support back navigation state preservation
  const initialCategory = searchParams.get("category") || "";
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const handleContinue = () => {
    if (selectedCategory) {
      router.push(`/details?category=${selectedCategory}`);
    }
  };

  const handleCardKeyDown = (e: React.KeyboardEvent, key: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelectedCategory(key);
    }
  };

  return (
    <ReducedMotionWrapper variantType="slideHorizontal" direction="forward" className="flex flex-col flex-1">
      {/* Title & Description */}
      <Section spacing="space-4" className="text-left">
        <DisplayText size="medium" className="mb-space-2 !text-3xl md:!text-4xl tracking-tight font-bold">
          {t("category.title")}
        </DisplayText>
        <ParagraphText variant="large" className="max-w-[50ch] !text-text-secondary">
          {t("category.subtitle")}
        </ParagraphText>
      </Section>

      {/* Grid of Categories */}
      <Section spacing="space-6" className="flex-1 flex flex-col justify-center">
        <div 
          className="grid grid-cols-1 sm:grid-cols-2 gap-space-4 my-auto"
          role="radiogroup"
          aria-label={t("category.title")}
        >
          {CATEGORY_LIST.map((cat) => {
            const IconComp = iconMap[cat.icon] || HelpCircle;
            const isSelected = selectedCategory === cat.key;

            return (
              <Card
                key={cat.key}
                interactive
                onClick={() => setSelectedCategory(cat.key)}
                onKeyDown={(e) => handleCardKeyDown(e, cat.key)}
                aria-checked={isSelected}
                role="radio"
                tabIndex={0}
                className={cn(
                  "flex items-start gap-space-4 border transition-all duration-150 text-left p-space-4 min-h-[96px] cursor-pointer",
                  isSelected
                    ? "border-text-primary bg-surface-variant ring-1 ring-text-primary/10"
                    : "border-border hover:border-border-strong hover:bg-surface/50"
                )}
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-md bg-surface-variant text-text-primary border border-border shrink-0">
                  <IconWrapper icon={IconComp} size="standard" />
                </div>
                <div className="flex flex-col gap-space-1">
                  <Heading level={2} className="!text-sm font-semibold leading-tight">
                    {t(cat.labelKey)}
                  </Heading>
                  <ParagraphText variant="caption" className="line-clamp-2 leading-relaxed !text-text-secondary">
                    {t(cat.descKey)}
                  </ParagraphText>
                </div>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* Action Button */}
      <div className="pt-space-6 pb-space-2 mt-auto border-t border-border/50">
        <Button
          variant="primary"
          fullWidth
          disabled={!selectedCategory}
          onClick={handleContinue}
          className="w-full flex items-center justify-center gap-space-2 disabled:opacity-50 disabled:cursor-not-allowed group transition-all"
        >
          <span>{t("common.continue")}</span>
          <IconWrapper icon={ArrowRight} className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </ReducedMotionWrapper>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col flex-1 items-center justify-center py-space-12">
        <ParagraphText variant="regular" className="animate-pulse">
          Loading categories...
        </ParagraphText>
      </div>
    }>
      <CategoryContent />
    </Suspense>
  );
}
