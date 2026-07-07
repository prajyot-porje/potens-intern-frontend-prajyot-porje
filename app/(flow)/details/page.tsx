"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HelpCircle, ArrowLeft, Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { ParagraphText } from "@/components/typography";
import { Button, TextArea, IconWrapper } from "@/components/primitives";
import { CATEGORIES } from "@/lib/utils/constants";
import { generateReferenceId } from "@/lib/utils/reference-id";
import { saveSubmission, Submission } from "@/lib/storage";
import { ReducedMotionWrapper } from "@/components/motion";
import { cn } from "@/lib/utils";
import { useSpeech } from "@/hooks/useSpeech";
import { motion, AnimatePresence } from "framer-motion";
import { PhotoUploader } from "@/components/features/PhotoUploader";
import { VoiceInput } from "@/components/features/VoiceInput";
import { iconMap } from "@/components/icons";

function DetailsSkeleton() {
  return (
    <div className="flex flex-col flex-1 gap-space-6 animate-pulse">
      {/* Category Preview Skeleton */}
      <div className="bg-surface-variant/40 border border-border p-space-2 rounded-lg">
        <div className="bg-surface border border-border rounded-md p-space-3 flex items-center justify-between h-16">
          <div className="flex items-center gap-space-3">
            <div className="w-12 h-12 rounded-md bg-surface-variant" />
            <div className="flex flex-col gap-space-1">
              <div className="h-3 w-16 bg-surface-variant rounded" />
              <div className="h-4 w-24 bg-surface-variant rounded" />
            </div>
          </div>
          <div className="h-9 w-16 bg-surface-variant rounded" />
        </div>
      </div>

      {/* Form Area Skeleton */}
      <div className="flex-1 flex flex-col justify-between gap-space-6">
        <div className="flex-1 flex flex-col gap-space-6">
          {/* Textarea Skeleton */}
          <div className="flex flex-col gap-space-2">
            <div className="h-4 w-24 bg-surface-variant rounded" />
            <div className="h-3 w-48 bg-surface-variant rounded" />
            <div className="w-full h-40 bg-surface-variant rounded-md" />
          </div>

          {/* Grid Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-4">
            <div className="bg-surface-variant/40 border border-border p-space-2 rounded-lg h-44">
              <div className="bg-surface border border-border-strong border-dashed rounded-md h-full" />
            </div>
            <div className="bg-surface-variant/40 border border-border p-space-2 rounded-lg h-44">
              <div className="bg-surface border border-border rounded-md h-full" />
            </div>
          </div>
        </div>

        {/* Buttons Skeleton */}
        <div className="pt-space-6 pb-space-2 mt-auto border-t border-border/50 flex gap-space-3">
          <div className="w-1/3 h-12 bg-surface-variant rounded" />
          <div className="w-2/3 h-12 bg-surface-variant rounded" />
        </div>
      </div>
    </div>
  );
}

function DetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useLanguage();

  const categoryKey = searchParams.get("category") || "";
  const categoryConfig = CATEGORIES[categoryKey] || CATEGORIES.other;
  const IconComp = iconMap[categoryConfig.icon] || HelpCircle;

  // Form states persisted in localStorage
  const [description, setDescription] = useLocalStorage<string>("nagrik_draft_description", "");
  const [photo, setPhoto] = useLocalStorage<string | null>("nagrik_draft_photo", null);
  
  // Validation and UI states
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Redirection guard: Redirect to Category if category parameter is missing or invalid
  useEffect(() => {
    const urlCategory = searchParams.get("category");
    if (!urlCategory || !CATEGORIES[urlCategory]) {
      router.replace("/category");
    }
  }, [searchParams, router]);

  const speechLang = locale === "mr" ? "mr-IN" : "en-IN";

  const originalTextRef = useRef("");
  const selectionStartRef = useRef<number | null>(null);
  const cursorIndexRef = useRef<number | null>(null);
  const [usedVoiceInput, setUsedVoiceInput] = useState(false);

  const {
    isSupported: isSpeechSupported,
    isListening,
    duration: speechDuration,
    error: speechError,
    startListening,
    stopListening,
    cancelListening,
    setError: setSpeechError,
  } = useSpeech({
    lang: speechLang,
    onResult: ({ final, interim }) => {
      const selectionStart = selectionStartRef.current ?? originalTextRef.current.length;
      const beforeText = originalTextRef.current.slice(0, selectionStart);
      const afterText = originalTextRef.current.slice(selectionStart);
      
      const spacePrefix = beforeText && !beforeText.endsWith(" ") ? " " : "";
      const textToInsert = final + (interim ? (final ? " " : "") + interim : "");
      
      const newText = beforeText + spacePrefix + textToInsert + afterText;
      const trimmedVal = newText.slice(0, 500);
      
      setDescription(trimmedVal);
      
      // Calculate and save cursor index for useEffect restoration
      const newCursorPos = beforeText.length + spacePrefix.length + Math.min(textToInsert.length, 500 - beforeText.length - spacePrefix.length);
      cursorIndexRef.current = newCursorPos;
    },
    onEnd: (finalTranscript) => {
      if (finalTranscript.trim()) {
        setUsedVoiceInput(true);
      }
      cursorIndexRef.current = null;
    },
    onError: () => {
      cursorIndexRef.current = null;
    }
  });

  // Restore cursor position on details description change if listening
  useEffect(() => {
    if (isListening && textareaRef.current && cursorIndexRef.current !== null) {
      textareaRef.current.setSelectionRange(cursorIndexRef.current, cursorIndexRef.current);
    }
  }, [description, isListening]);

  // Handle dynamic description changes and clear errors inline
  const handleDescriptionChange = (val: string) => {
    // Stop recording to preserve manually typed text
    if (isListening) {
      stopListening();
    }

    const trimmedVal = val.slice(0, 500);
    setDescription(trimmedVal);

    if (descriptionError) {
      if (trimmedVal.trim().length === 0) {
        setDescriptionError(t("validation.emptyDescription"));
      } else if (trimmedVal.trim().length < 10) {
        setDescriptionError(t("validation.tooShortDescription"));
      } else {
        setDescriptionError(null);
      }
    }
  };

  const handleStartVoice = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      originalTextRef.current = description;
      selectionStartRef.current = textarea.selectionStart;
    } else {
      originalTextRef.current = description;
      selectionStartRef.current = description.length;
    }
    
    const announcement = document.getElementById("sr-announcement");
    if (announcement) {
      announcement.textContent = t("form.voiceListening");
    }
    
    startListening();
  };

  const handleStopVoice = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    stopListening();
  };

  const handleCancelVoice = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    cancelListening();
    setDescription(originalTextRef.current);
    
    const announcement = document.getElementById("sr-announcement");
    if (announcement) {
      announcement.textContent = t("form.voiceErrorCancelled");
    }
  };

  const handleResetSpeechError = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSpeechError(null);
    // Directly trigger start listening
    setTimeout(() => {
      handleStartVoice();
    }, 50);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent submission if category is missing or invalid
    if (!categoryKey || !CATEGORIES[categoryKey]) {
      router.replace("/category");
      return;
    }

    // Validate description
    const trimmedDesc = description.trim();
    let hasError = false;

    if (trimmedDesc.length === 0) {
      setDescriptionError(t("validation.emptyDescription"));
      hasError = true;
    } else if (trimmedDesc.length < 10) {
      setDescriptionError(t("validation.tooShortDescription"));
      hasError = true;
    } else if (trimmedDesc.length > 500) {
      setDescriptionError(t("validation.tooLongDescription"));
      hasError = true;
    }

    // Block submission if there is an unresolved image processing error
    if (imageError) {
      hasError = true;
    }

    if (hasError) {
      // Accessible focus management: focus invalid input element
      const textarea = document.getElementById("description");
      if (textarea) {
        textarea.focus();
      }
      
      const announcement = document.getElementById("sr-announcement");
      if (announcement) {
        announcement.textContent = descriptionError || imageError || "Validation error";
      }
      return;
    }

    // Submission flow implementation
    const isOnline = typeof window !== "undefined" ? window.navigator.onLine : true;
    const refId = generateReferenceId(categoryKey);
    const submission: Submission = {
      id: refId,
      category: categoryKey,
      description: trimmedDesc,
      photo: photo,
      usedVoiceInput: usedVoiceInput,
      createdAt: new Date().toISOString(),
      status: isOnline ? "submitted" : "queued",
      language: locale,
    };

    saveSubmission(submission);

    // Clear drafts from state and localStorage to prevent desync
    setDescription("");
    setPhoto(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("nagrik_draft_category");
    }

    // Announce successful submission to screen reader
    const announcement = document.getElementById("sr-announcement");
    if (announcement) {
      announcement.textContent = isOnline 
        ? t("confirmation.successTitle") 
        : t("confirmation.statusQueued");
    }

    // Navigate to confirmation step replacing details screen in history
    router.replace(`/confirmation?id=${refId}`);
  };

  const handleCancel = () => {
    // Preserve category selection on back
    router.push(`/category?category=${categoryKey}`);
  };

  // Character limit counts
  const charCount = description.length;
  const charsRemaining = Math.max(0, 500 - charCount);

  return (
    <ReducedMotionWrapper variantType="slideHorizontal" direction="forward" className="flex flex-col flex-1 gap-space-6">
      <h1 className="sr-only">{t("form.title")}</h1>
      
      {/* 1. Selected Category Preview (Double-Bezel Card) */}
      <div className="bg-surface-variant/40 border border-border p-space-2 sm:p-space-3 rounded-lg">
        <div className="bg-surface border border-border rounded-md p-space-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-space-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-md bg-text-primary text-surface shrink-0 border border-border">
              <IconWrapper icon={IconComp} size="standard" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-tertiary leading-none mb-1">
                {t("confirmation.categoryLabel")}
              </span>
              <span className="text-sm font-semibold text-text-primary leading-tight">
                {t(categoryConfig.labelKey)}
              </span>
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            className="!min-h-[48px] !h-[48px] !px-space-4 text-xs rounded-md border border-border-strong hover:bg-surface-variant transition-colors"
          >
            {t("common.change")}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between gap-space-6">
        <div className="flex-1 flex flex-col gap-space-6 pb-0">
          
          {/* 2. Description Textarea with Helper and Counter */}
          <div className="flex flex-col gap-space-2">
            <div className="flex flex-col gap-space-1">
              <label htmlFor="description" className="font-uiLabel text-sm text-text-primary font-medium">
                {t("form.descriptionLabel")}
              </label>
              <ParagraphText variant="caption" className="!text-text-tertiary leading-relaxed">
                {t("form.descriptionHelper")}
              </ParagraphText>
            </div>
            
            <TextArea
              ref={textareaRef}
              id="description"
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder={t("form.descriptionPlaceholder")}
              className={cn(
                "min-h-[160px] text-base transition-colors",
                descriptionError && "border-error focus:border-error focus:shadow-[0_0_0_2px_var(--bg),0_0_0_4px_var(--error)]"
              )}
              maxLength={500}
              aria-invalid={!!descriptionError}
              aria-describedby={cn(
                "description-helper",
                descriptionError && "description-error"
              )}
            />
            
            <AnimatePresence mode="wait">
              {descriptionError && (
                <motion.span
                  id="description-error"
                  role="alert"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="text-xs text-error font-medium block"
                >
                  {descriptionError}
                </motion.span>
              )}
            </AnimatePresence>
            
            <div className="flex justify-between items-center text-xs" id="description-helper">
              <span className={cn(
                "transition-colors duration-150",
                charsRemaining <= 50 ? "text-error font-medium" : "text-text-tertiary"
              )} aria-live="polite">
                {t("form.charRemaining", { count: charsRemaining })}
              </span>
              <span className="text-text-tertiary font-mono">
                {charCount}/500
              </span>
            </div>
          </div>

          {/* Media Attachments Block: Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-4 sm:gap-space-6">
            
            {/* 3. Photo Upload Card Component (Double-Bezel) */}
            <PhotoUploader
              photo={photo}
              onPhotoChange={setPhoto}
              imageError={imageError}
              setImageError={setImageError}
            />

            {/* 4. Voice Input Card Component (Double-Bezel) */}
            <VoiceInput
              isSupported={isSpeechSupported}
              isListening={isListening}
              duration={speechDuration}
              error={speechError}
              onStartListening={handleStartVoice}
              onStopListening={handleStopVoice}
              onCancelListening={handleCancelVoice}
              onResetSpeechError={handleResetSpeechError}
            />

          </div>
        </div>

        {/* 5. Action Buttons & Navigation */}
        <div className="pt-space-6 sm:pt-space-8 pb-space-2 sm:pb-space-4 mt-auto border-t border-border/50 flex flex-col sm:flex-row gap-space-3">
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-1/3 flex items-center justify-center gap-space-2"
            onClick={handleCancel}
          >
            <IconWrapper icon={ArrowLeft} className="h-4 w-4" />
            <span>{t("common.back")}</span>
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="w-full sm:w-2/3 flex items-center justify-center gap-space-2 group btn-hover-group"
          >
            <span>{t("common.continue")}</span>
            <IconWrapper 
              icon={Check} 
              className="h-4 w-4 transition-transform duration-150 ease-out btn-hover-scale" 
            />
          </Button>
        </div>
      </form>
    </ReducedMotionWrapper>
  );
}

export default function DetailsPage() {
  return (
    <Suspense fallback={<DetailsSkeleton />}>
      <DetailsContent />
    </Suspense>
  );
}
