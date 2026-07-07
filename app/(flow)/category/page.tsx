"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Road, Trash2, Droplet, Lightbulb, ShieldAlert, HelpCircle, ArrowRight } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { DisplayText, Heading, ParagraphText } from "@/components/typography";
import { Button, Card, Section, IconWrapper } from "@/components/primitives";
import { CATEGORY_LIST } from "@/lib/utils/constants";
import { ReducedMotionWrapper } from "@/components/motion";
import { cn } from "@/lib/utils";

const iconMap: Record<
  string,
  React.ComponentType<React.SVGProps<SVGSVGElement> & { strokeWidth?: number }>
> = {
  Road,
  Trash2,
  Droplet,
  Lightbulb,
  ShieldAlert,
  HelpCircle,
};

function CategorySkeleton() {
  return (
    <div className="flex flex-col flex-1">
      {/* Title & Description Skeleton */}
      <Section spacing="space-4" className="text-left animate-pulse">
        <div className="h-10 w-48 bg-surface-variant rounded mb-space-2" />
        <div className="h-5 w-64 bg-surface-variant rounded" />
      </Section>

      {/* Grid Skeleton */}
      <Section spacing="space-6" className="flex-1 flex flex-col justify-center animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-4 my-auto">
          {Array.from({ length: 6 }).map((__, i) => (
            <div key={i} className="flex items-center gap-space-4 border border-border bg-surface p-space-4 rounded-lg">
              <div className="w-12 h-12 rounded-md bg-surface-variant shrink-0" />
              <div className="flex flex-col gap-space-2 flex-1">
                <div className="h-4 w-24 bg-surface-variant rounded" />
                <div className="h-3 w-full bg-surface-variant rounded" />
                <div className="h-3 w-5/6 bg-surface-variant rounded" />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Button Skeleton */}
      <div className="pt-space-6 pb-space-2 mt-auto border-t border-border/50 animate-pulse">
        <div className="w-full h-12 bg-surface-variant rounded" />
      </div>
    </div>
  );
}

function CategoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  
  // Persist selected category draft in localStorage
  const [draftCategory, setDraftCategory] = useLocalStorage<string>("nagrik_draft_category", "");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Sync category from URL parameter or localStorage draft on mount/search parameter change
  useEffect(() => {
    const urlCategory = searchParams.get("category");
    Promise.resolve().then(() => {
      if (urlCategory) {
        setSelectedCategory(urlCategory);
        setDraftCategory(urlCategory);
      } else if (draftCategory) {
        setSelectedCategory(draftCategory);
        // Sync URL shallowly with draft category
        const params = new URLSearchParams(searchParams.toString());
        params.set("category", draftCategory);
        router.replace(`/category?${params.toString()}`, { scroll: false });
      }
    });
  }, [searchParams, draftCategory, setDraftCategory, router]);

  const handleSelectCategory = (key: string) => {
    setSelectedCategory(key);
    setDraftCategory(key);
    // Sync category state to URL parameters shallowly
    const params = new URLSearchParams(searchParams.toString());
    params.set("category", key);
    router.replace(`/category?${params.toString()}`, { scroll: false });
  };

  const handleContinue = () => {
    if (selectedCategory) {
      router.push(`/details?category=${selectedCategory}`);
    }
  };

  // Accessible Arrow-Key Grid Navigation (Left/Right/Up/Down, Home, End, Space/Enter to select)
  const handleGridKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const cards = Array.from(
      e.currentTarget.querySelectorAll('[role="radio"]')
    ) as HTMLElement[];
    
    const activeIndex = cards.indexOf(document.activeElement as HTMLElement);
    if (activeIndex === -1) return;

    let nextIndex = activeIndex;
    const isMobile = window.innerWidth < 640; // sm breakpoint is 640px

    switch (e.key) {
      case "ArrowRight":
        nextIndex = (activeIndex + 1) % cards.length;
        break;
      case "ArrowLeft":
        nextIndex = (activeIndex - 1 + cards.length) % cards.length;
        break;
      case "ArrowDown":
        if (isMobile) {
          nextIndex = (activeIndex + 1) % cards.length;
        } else {
          // 2-column layout navigation
          nextIndex = activeIndex + 2;
          if (nextIndex >= cards.length) {
            nextIndex = activeIndex % 2; // wrap around to top row
          }
        }
        break;
      case "ArrowUp":
        if (isMobile) {
          nextIndex = (activeIndex - 1 + cards.length) % cards.length;
        } else {
          // 2-column layout navigation
          nextIndex = activeIndex - 2;
          if (nextIndex < 0) {
            // wrap around to bottom row
            nextIndex = cards.length - 2 + (activeIndex % 2);
            if (nextIndex >= cards.length) {
              nextIndex = cards.length - 1;
            }
          }
        }
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = cards.length - 1;
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        const catKey = cards[activeIndex].getAttribute("data-category");
        if (catKey) {
          handleSelectCategory(catKey);
        }
        return;
      default:
        return; // Allow tab and other defaults
    }

    e.preventDefault();
    cards[nextIndex]?.focus();
  };

  const dirParam = searchParams.get("dir") === "backward" ? "backward" : "forward";

  return (
    <ReducedMotionWrapper variantType="slideHorizontal" direction={dirParam} className="flex flex-col flex-1">
      {/* Title & Description */}
      <Section spacing="space-4" className="text-left">
        <DisplayText as="h1" size="medium" className="mb-space-2 !text-3xl md:!text-4xl tracking-tight font-bold">
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
          onKeyDown={handleGridKeyDown}
        >
          {CATEGORY_LIST.map((cat) => {
            const IconComp = iconMap[cat.icon] || HelpCircle;
            const isSelected = selectedCategory === cat.key;
            
            // Standard ARIA tab index: only selected (or first) item is focusable, rest are reached via arrow keys
            const tabIndex = isSelected ? 0 : (selectedCategory === "" && cat.key === "roads" ? 0 : -1);

            return (
              <Card
                key={cat.key}
                data-category={cat.key}
                interactive
                onClick={() => handleSelectCategory(cat.key)}
                aria-checked={isSelected}
                role="radio"
                tabIndex={tabIndex}
                className={cn(
                  "group flex items-center gap-space-4 text-left p-space-4",
                  isSelected
                    ? "border-text-primary bg-surface-variant ring-1 ring-text-primary/10"
                    : "border-border bg-surface"
                )}
              >
                {/* Icon wrapper - inverts when card is selected */}
                <div className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-md shrink-0 border",
                  "transition-colors duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  isSelected
                    ? "bg-text-primary border-text-primary text-surface"
                    : "bg-surface-variant border-border text-text-secondary group-hover:text-text-primary group-hover:border-border-strong group-focus-visible:text-text-primary group-focus-visible:border-border-strong"
                )}>
                  <IconWrapper icon={IconComp} size="standard" />
                </div>
                
                {/* Labels */}
                <div className="flex flex-col gap-space-1">
                  <Heading 
                    level={2} 
                    className={cn(
                      "!text-sm font-semibold leading-tight transition-colors duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      isSelected ? "text-text-primary" : "text-text-primary/90 group-hover:text-text-primary group-focus-visible:text-text-primary"
                    )}
                  >
                    {t(cat.labelKey)}
                  </Heading>
                  <ParagraphText 
                    variant="caption" 
                    className={cn(
                      "line-clamp-2 leading-relaxed transition-colors duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      isSelected ? "text-text-secondary" : "text-text-tertiary group-hover:text-text-secondary group-focus-visible:text-text-secondary"
                    )}
                  >
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
          className="w-full flex items-center justify-center gap-space-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none group btn-hover-group"
        >
          <span>{t("common.continue")}</span>
          <IconWrapper 
            icon={ArrowRight} 
            className="h-4 w-4 transition-transform duration-150 ease-out btn-hover-arrow" 
          />
        </Button>
      </div>
    </ReducedMotionWrapper>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={<CategorySkeleton />}>
      <CategoryContent />
    </Suspense>
  );
}
