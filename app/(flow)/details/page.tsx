"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Camera, Mic, Check, HelpCircle, Road, Trash2, Droplet, Lightbulb, ShieldAlert, ArrowLeft, X } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { DisplayText, Heading, ParagraphText } from "@/components/typography";
import { Button, Card, Section, TextArea, IconWrapper } from "@/components/primitives";
import { CATEGORIES } from "@/lib/utils/constants";
import { generateReferenceId } from "@/lib/utils/reference-id";
import { saveSubmission, Submission } from "@/lib/storage";
import { ReducedMotionWrapper } from "@/components/motion";
import { cn } from "@/lib/utils";
import { useSpeech } from "@/hooks/useSpeech";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { motion, AnimatePresence } from "framer-motion";

const iconMap: Record<string, React.ComponentType<any>> = {
  Road,
  Trash2,
  Droplet,
  Lightbulb,
  ShieldAlert,
  HelpCircle,
};

/**
 * Compresses an image file using Canvas.
 * Resizes to a maximum width of 800px and converts to JPEG at 0.7 quality.
 */
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("File is not an image"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Scale down if width exceeds 800px
          const MAX_WIDTH = 800;
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Failed to get 2D canvas context"));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Get high-compression JPEG data URL
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
          resolve(compressedDataUrl);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => {
        reject(new Error("Failed to load image element"));
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    reader.readAsDataURL(file);
  });
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

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
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Redirection guard: Redirect to Category if category parameter is missing or invalid
  useEffect(() => {
    const urlCategory = searchParams.get("category");
    if (!urlCategory || !CATEGORIES[urlCategory]) {
      router.replace("/category");
    }
  }, [searchParams, router]);

  const isReducedMotion = useReducedMotion();
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

  const handleResetSpeechError = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    const refId = generateReferenceId(categoryKey);
    const submission: Submission = {
      id: refId,
      category: categoryKey,
      description: trimmedDesc,
      photo: photo,
      usedVoiceInput: usedVoiceInput,
      createdAt: new Date().toISOString(),
      status: "submitted",
      language: locale,
    };

    saveSubmission(submission);

    // Clear drafts from localStorage
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("nagrik_draft_category");
      window.localStorage.removeItem("nagrik_draft_description");
      window.localStorage.removeItem("nagrik_draft_photo");
    }

    // Announce successful submission to screen reader
    const announcement = document.getElementById("sr-announcement");
    if (announcement) {
      announcement.textContent = t("confirmation.successTitle");
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

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setImageError(t("validation.invalidImage"));
      return;
    }

    try {
      // Inform screen reader of active processing
      const announcement = document.getElementById("sr-announcement");
      if (announcement) {
        announcement.textContent = t("common.loading");
      }

      const compressed = await compressImage(file);
      setPhoto(compressed);
      setImageError(null);

      if (announcement) {
        announcement.textContent = t("form.photoLabel");
      }
    } catch (err) {
      console.error("Image compression failed, trying raw base64 fallback:", err);
      // Fallback to raw FileReader
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const rawBase64 = event.target.result as string;
          // Check raw base64 size (limit to 1.5MB to protect local storage quota)
          if (rawBase64.length > 1.5 * 1024 * 1024 * 1.33) {
            setImageError(t("validation.imageTooLarge"));
            setPhoto(null);
          } else {
            setPhoto(rawBase64);
            setImageError(null);
          }
        }
      };
      reader.onerror = () => {
        setImageError(t("validation.invalidImage"));
        setPhoto(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering open file picker
    setPhoto(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };


  return (
    <ReducedMotionWrapper variantType="slideHorizontal" direction="forward" className="flex flex-col flex-1 gap-space-6">
      
      {/* 1. Selected Category Preview (Double-Bezel Card) */}
      <div className="bg-surface-variant/40 border border-border p-space-2 rounded-lg">
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
            className="!min-h-[36px] !h-[36px] !px-space-3 text-xs rounded-md border border-border-strong hover:bg-surface-variant transition-colors"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-4">
            
            {/* 3. Photo Upload Card Component (Double-Bezel) */}
            <div 
              className={cn(
                "bg-surface-variant/40 border border-border p-space-2 rounded-lg transition-[background-color,border-color] duration-150 flex flex-col justify-between min-h-[194px]",
                isDragging && "border-text-primary bg-surface-variant/70",
                imageError && "border-error bg-error/5"
              )}
            >
              <AnimatePresence mode="wait">
                {photo ? (
                  /* Selected / Preview State */
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, transform: "scale(0.98)" }}
                    animate={{ opacity: 1, transform: "scale(1)" }}
                    exit={{ opacity: 0, transform: "scale(0.98)" }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="bg-surface border border-border rounded-md overflow-hidden relative min-h-[176px] h-full flex-1 group flex flex-col"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo}
                      alt="Complaint attachment preview"
                      className="w-full h-full min-h-[176px] flex-1 object-cover transition-transform duration-300 group-hover:scale-102"
                    />
                    
                    {/* Overlay delete control */}
                    <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150 flex items-center justify-center">
                      <Button
                        type="button"
                        variant="error"
                        onClick={removePhoto}
                        className="!min-h-[40px] !h-[40px] !px-space-4 text-xs font-semibold rounded-md flex items-center gap-space-2 border border-error bg-error text-white hover:bg-error/90 active:scale-95 transition-transform btn-hover-group"
                        aria-label={t("form.removePhoto")}
                      >
                        <IconWrapper icon={Trash2} size="micro" className="transition-transform duration-150 btn-hover-scale" />
                        <span>{t("form.removePhoto")}</span>
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  /* Empty / Dropzone State */
                  <motion.div
                    key="dropzone"
                    initial={{ opacity: 0, transform: "scale(0.98)" }}
                    animate={{ opacity: 1, transform: "scale(1)" }}
                    exit={{ opacity: 0, transform: "scale(0.98)" }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    role="button"
                    tabIndex={0}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    aria-label={t("form.photoLabel")}
                    className={cn(
                      "bg-surface border border-dashed border-border-strong rounded-md p-space-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 select-none min-h-[176px] relative group outline-none flex-1",
                      "interactive-card focus-visible:border-text-primary",
                      "focus-visible:shadow-[0_0_0_2px_var(--bg),0_0_0_4px_var(--text-primary)]",
                      "motion-safe:active:scale-[0.98]",
                      imageError && "border-error focus-visible:border-error focus-visible:shadow-[0_0_0_2px_var(--bg),0_0_0_4px_var(--error)]"
                    )}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-surface-variant border border-border text-text-secondary group-hover:text-text-primary transition-colors duration-150 mb-space-2">
                      <IconWrapper icon={Camera} size="standard" />
                    </div>
                    
                    <Heading level={3} className="!text-sm font-semibold mb-space-1 text-text-primary">
                      {t("form.photoLabel")}
                    </Heading>
                    
                    <ParagraphText variant="caption" className="max-w-[24ch] !text-text-secondary">
                      {t("form.dragDropHint")}
                    </ParagraphText>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence mode="wait">
                {imageError && (
                  <motion.span
                    id="image-error"
                    role="alert"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="text-xs text-error font-medium mt-space-2 text-center block"
                  >
                    {imageError}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* 4. Voice Input Card Component (Double-Bezel) */}
            <div className="bg-surface-variant/40 border border-border p-space-2 rounded-lg min-h-[194px] flex flex-col justify-between">
              <AnimatePresence mode="wait">
                {!isSpeechSupported ? (
                  /* State A: Unsupported Browser */
                  <motion.div
                    key="unsupported"
                    initial={{ opacity: 0, transform: "scale(0.98)" }}
                    animate={{ opacity: 1, transform: "scale(1)" }}
                    exit={{ opacity: 0, transform: "scale(0.98)" }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="bg-surface/50 border border-border/80 rounded-md p-space-4 flex flex-col items-center justify-center text-center select-none min-h-[176px] relative opacity-60 flex-1"
                    aria-describedby="voice-unsupported-hint"
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-surface-variant border border-border text-text-tertiary mb-space-2">
                      <IconWrapper icon={Mic} size="standard" />
                    </div>
                    <Heading level={3} className="!text-sm font-semibold mb-space-1 text-text-secondary">
                      {t("form.voiceLabel")}
                    </Heading>
                    <ParagraphText id="voice-unsupported-hint" variant="caption" className="max-w-[24ch] !text-text-tertiary">
                      {t("form.voiceNotSupported")}
                    </ParagraphText>
                  </motion.div>
                ) : speechError ? (
                  /* State B: Error Occurred */
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, transform: "scale(0.98)" }}
                    animate={{ opacity: 1, transform: "scale(1)" }}
                    exit={{ opacity: 0, transform: "scale(0.98)" }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    role="button"
                    tabIndex={0}
                    onClick={handleResetSpeechError}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleResetSpeechError(e as any);
                      }
                    }}
                    aria-label={`${t("form.voiceErrorTitle")}. ${t(`form.voiceError${speechError.charAt(0).toUpperCase() + speechError.slice(1)}` || "form.voiceError")}. ${t("form.voiceTryAgain")}`}
                    className={cn(
                      "bg-surface border border-error/50 rounded-md p-space-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 select-none min-h-[176px] relative group outline-none flex-1",
                      "interactive-card focus-visible:border-error focus-visible:shadow-[0_0_0_2px_var(--bg),0_0_0_4px_var(--error)]",
                      "motion-safe:active:scale-[0.98]"
                    )}
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-error/10 border border-error/20 text-error mb-space-2">
                      <IconWrapper icon={ShieldAlert} size="standard" />
                    </div>
                    <Heading level={3} className="!text-sm font-semibold mb-space-1 text-error">
                      {t("form.voiceErrorTitle")}
                    </Heading>
                    <ParagraphText variant="caption" className="max-w-[28ch] !text-text-secondary mb-space-2">
                      {t(`form.voiceError${speechError === "permission-denied" ? "PermissionDenied" : speechError === "no-speech" ? "NoSpeech" : speechError === "network" ? "Network" : speechError === "aborted" ? "Aborted" : "Generic"}`)}
                    </ParagraphText>
                    <span className="text-[11px] font-mono uppercase tracking-[0.15em] text-text-tertiary group-hover:text-text-primary transition-colors">
                      {t("form.voiceTryAgain")}
                    </span>
                  </motion.div>
                ) : isListening ? (
                  /* State C: Listening Active */
                  <motion.div
                    key="listening"
                    initial={{ opacity: 0, transform: "scale(0.98)" }}
                    animate={{ opacity: 1, transform: "scale(1)" }}
                    exit={{ opacity: 0, transform: "scale(0.98)" }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    role="region"
                    aria-label="Voice recording session active"
                    className="bg-surface border border-border rounded-md p-space-4 flex flex-col items-center justify-center text-center min-h-[176px] relative outline-none flex-1"
                  >
                    {/* Recording Timer Centered in Flow */}
                    <div className="font-mono text-xs font-semibold text-text-secondary bg-surface-variant/80 border border-border px-space-2 py-0.5 rounded-full flex items-center gap-1.5 mb-space-2" aria-label="Recording duration">
                      <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span>
                      {formatDuration(speechDuration)}
                    </div>

                    {/* Pulsing visual halo (respects prefers-reduced-motion, hardware accelerated) */}
                    <div className="relative mb-space-2">
                      <motion.div
                        animate={isReducedMotion ? {} : {
                          transform: ["scale(1)", "scale(1.08)", "scale(1)"],
                          opacity: [1, 0.6, 1],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="absolute -inset-2 rounded-full bg-text-primary/10"
                      />
                      <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-text-primary text-surface border border-text-primary">
                        <IconWrapper icon={Mic} size="standard" />
                      </div>
                    </div>

                    <Heading level={3} className="!text-sm font-semibold mb-space-1 text-text-primary" aria-live="polite">
                      {t("form.voiceListening")}
                    </Heading>

                    {/* Visual Waveform (pure decoration, respects reduced motion, scaleY GPU-friendly) */}
                    {!isReducedMotion && (
                      <div className="flex items-center gap-1 h-3 mt-space-1 mb-space-3">
                        <motion.span animate={{ scaleY: [0.3, 0.7, 0.3] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.1 }} className="w-0.5 h-3.5 bg-text-primary/40 rounded-full origin-center" />
                        <motion.span animate={{ scaleY: [0.4, 1.0, 0.4] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }} className="w-0.5 h-3.5 bg-text-primary/60 rounded-full origin-center" />
                        <motion.span animate={{ scaleY: [0.3, 0.8, 0.3] }} transition={{ repeat: Infinity, duration: 0.7, delay: 0 }} className="w-0.5 h-3.5 bg-text-primary rounded-full origin-center" />
                        <motion.span animate={{ scaleY: [0.5, 0.9, 0.5] }} transition={{ repeat: Infinity, duration: 0.4, delay: 0.3 }} className="w-0.5 h-3.5 bg-text-primary/75 rounded-full origin-center" />
                        <motion.span animate={{ scaleY: [0.3, 0.5, 0.3] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.15 }} className="w-0.5 h-3.5 bg-text-primary/50 rounded-full origin-center" />
                      </div>
                    )}

                    {/* Actions Panel */}
                    <div className="flex flex-col gap-space-2 w-full max-w-[280px] mt-space-3">
                      <Button
                        type="button"
                        variant="primary"
                        onClick={handleStopVoice}
                        className="w-full !min-h-[36px] !h-[36px] !px-space-3 text-xs rounded-md flex items-center justify-center gap-space-1 font-semibold"
                        aria-label={t("form.voiceStop")}
                      >
                        <IconWrapper icon={Check} className="h-3.5 w-3.5" />
                        <span>{t("form.voiceStop")}</span>
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleCancelVoice}
                        className="w-full !min-h-[36px] !h-[36px] !px-space-3 text-xs rounded-md border border-border-strong hover:bg-surface-variant flex items-center justify-center gap-space-1 font-semibold"
                        aria-label={t("form.voiceCancel")}
                      >
                        <IconWrapper icon={X} className="h-3.5 w-3.5" />
                        <span>{t("form.voiceCancel")}</span>
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  /* State D: Supported & Idle */
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, transform: "scale(0.98)" }}
                    animate={{ opacity: 1, transform: "scale(1)" }}
                    exit={{ opacity: 0, transform: "scale(0.98)" }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    role="button"
                    tabIndex={0}
                    onClick={handleStartVoice}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleStartVoice();
                      }
                    }}
                    aria-label={t("form.voiceLabel")}
                    className={cn(
                      "bg-surface border border-border rounded-md p-space-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 select-none min-h-[176px] relative group outline-none flex-1",
                      "interactive-card focus-visible:border-text-primary",
                      "focus-visible:shadow-[0_0_0_2px_var(--bg),0_0_0_4px_var(--text-primary)]",
                      "motion-safe:active:scale-[0.98]"
                    )}
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-surface-variant border border-border text-text-secondary group-hover:text-text-primary transition-colors duration-150 mb-space-2">
                      <IconWrapper icon={Mic} size="standard" />
                    </div>
                    
                    <Heading level={3} className="!text-sm font-semibold mb-space-1 text-text-primary">
                      {t("form.voiceLabel")}
                    </Heading>
                    
                    <ParagraphText variant="caption" className="max-w-[24ch] !text-text-secondary">
                      {t("form.voiceTapToSpeak")}
                    </ParagraphText>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>

        {/* 5. Action Buttons & Navigation */}
        <div className="pt-space-6 pb-space-2 mt-auto border-t border-border/50 flex flex-col sm:flex-row gap-space-3">
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
