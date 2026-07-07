"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useLanguage } from "../../lib/i18n";
import { ParagraphText } from "../typography";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { cn } from "../../lib/utils";


interface StepConfig {
  key: string;
  labelKey: string;
  descKey: string;
}

const STEPS: StepConfig[] = [
  {
    key: "submitted",
    labelKey: "timeline.submitted",
    descKey: "timeline.submittedDesc",
  },
  {
    key: "under_review",
    labelKey: "timeline.underReview",
    descKey: "timeline.underReviewDesc",
  },
  {
    key: "in_progress",
    labelKey: "timeline.inProgress",
    descKey: "timeline.inProgressDesc",
  },
  {
    key: "resolved",
    labelKey: "timeline.resolved",
    descKey: "timeline.resolvedDesc",
  },
];

export function StatusTimeline() {
  const { t } = useLanguage();
  const isReduced = useReducedMotion();

  // Without a real backend we cannot honestly advance beyond "Under Review".
  // "Submitted" (index 0) is always completed; "Under Review" (index 1) is
  // permanently the active step. In Progress / Resolved stay pending.
  const currentStepIndex = 1;

  return (
    <div className="flex flex-col gap-space-4 border border-border bg-surface p-space-6 sm:p-space-8 rounded-lg shadow-sm">
      <div className="flex flex-col gap-space-1 mb-space-2">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-tertiary leading-none">
          {t("confirmation.statusLabel")}
        </span>
        <ParagraphText variant="uiLabel" className="!text-text-primary text-base font-semibold">
          {t("timeline.liveTracking")}
        </ParagraphText>
      </div>

      <div className="flex flex-col">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isActive = index === currentStepIndex;
          const isPending = index > currentStepIndex;
          const isLast = index === STEPS.length - 1;

          // No simulated progress fraction — timeline is static beyond Under Review

          return (
            <div key={step.key} className="flex gap-space-4 relative group">
              {/* Timeline dot and connecting line */}
              <div className="flex flex-col items-center shrink-0 w-8">
                {/* Visual Dot */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 relative z-10",
                    isCompleted && (index === STEPS.length - 1 || step.key === "resolved"
                      ? "bg-success border-success text-white"
                      : "bg-text-primary border-text-primary text-surface"),
                    isActive && "border-text-primary bg-surface shadow-sm",
                    isPending && "border-border-strong bg-surface text-text-tertiary"
                  )}
                  style={
                    isActive && !isCompleted
                      ? {
                          boxShadow: "0 0 0 2px var(--bg), 0 0 0 4px var(--border-strong)",
                        }
                      : {}
                  }
                  role="img"
                  aria-label={`${t(step.labelKey)}: ${
                    isCompleted ? "Completed" : isActive ? "Current" : "Pending"
                  }`}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={isReduced ? {} : { scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-center"
                    >
                      <Check className="h-4 w-4 stroke-[3px]" />
                    </motion.div>
                  ) : isActive ? (
                    /* Active pulsing dot */
                    <span className="relative flex h-3 w-3">
                      <span className={cn(
                        "animate-ping absolute inline-flex h-full w-full rounded-full bg-text-primary opacity-75",
                        isReduced && "hidden"
                      )}></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-text-primary"></span>
                    </span>
                  ) : (
                    /* Pending index number */
                    <span className="text-xs font-mono font-medium">{index + 1}</span>
                  )}
                </div>

                {/* Line to next step */}
                {!isLast && (
                  <div className="w-0.5 h-16 bg-border relative overflow-hidden my-1">
                    {/* Active completed line */}
                    {isCompleted && (
                      <motion.div
                        className="absolute top-0 left-0 right-0 bg-text-primary origin-top"
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={
                          isReduced
                            ? { duration: 0 }
                            : { ease: "easeOut", duration: 0.3 }
                        }
                        style={{ height: "100%" }}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Text content details */}
              <div className={cn(
                "pb-6 flex flex-col justify-start transition-colors duration-300",
                isActive ? "text-text-primary" : isCompleted ? "text-text-primary/80" : "text-text-tertiary"
              )}>
                <h2 className={cn(
                  "text-sm font-semibold leading-tight mb-1",
                  isActive && "text-text-primary",
                  isCompleted && "text-text-primary/95",
                  isPending && "text-text-secondary"
                )}>
                  {t(step.labelKey)}
                </h2>
                <ParagraphText
                  variant="caption"
                  className={cn(
                    "leading-relaxed transition-colors duration-300 max-w-[36ch]",
                    isActive ? "!text-text-secondary" : isCompleted ? "!text-text-tertiary" : "!text-text-tertiary"
                  )}
                >
                  {t(step.descKey)}
                </ParagraphText>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StatusTimeline;
