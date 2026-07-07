"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Camera, Mic, Check, HelpCircle, Road, Trash2, Droplet, Lightbulb, ShieldAlert, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { DisplayText, Heading, ParagraphText } from "@/components/typography";
import { Button, Card, Section, TextArea, IconWrapper } from "@/components/primitives";
import { CATEGORIES } from "@/lib/utils/constants";
import { generateReferenceId } from "@/lib/utils/reference-id";
import { saveSubmission, Submission } from "@/lib/storage";
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
  const [isListening, setIsListening] = useState(false);
  const [listeningTimer, setListeningTimer] = useState<NodeJS.Timeout | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirection guard: Redirect to Category if category parameter is missing or invalid
  useEffect(() => {
    const urlCategory = searchParams.get("category");
    if (!urlCategory || !CATEGORIES[urlCategory]) {
      router.replace("/category");
    }
  }, [searchParams, router]);

  // Clean up voice timer on unmount
  useEffect(() => {
    return () => {
      if (listeningTimer) {
        clearTimeout(listeningTimer);
      }
    };
  }, [listeningTimer]);

  // Handle dynamic description changes and clear errors inline
  const handleDescriptionChange = (val: string) => {
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
      usedVoiceInput: false, // Voice input is deferred
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

  // Mock Voice Input transcription
  const handleVoiceToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isListening) {
      if (listeningTimer) clearTimeout(listeningTimer);
      setIsListening(false);
      return;
    }

    setIsListening(true);
    const timer = setTimeout(() => {
      const mockText = t("form.voiceMockText");
      setDescription((prev) => {
        const space = prev ? " " : "";
        const merged = prev + space + mockText;
        return merged.slice(0, 500);
      });
      setIsListening(false);
    }, 2500);
    setListeningTimer(timer);
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
            
            {descriptionError && (
              <span
                id="description-error"
                role="alert"
                className="text-xs text-error font-medium transition-all"
              >
                {descriptionError}
              </span>
            )}
            
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
                "bg-surface-variant/40 border border-border p-space-2 rounded-lg transition-colors duration-150 flex flex-col justify-between",
                isDragging && "border-text-primary bg-surface-variant/70",
                imageError && "border-error bg-error/5"
              )}
            >
              {photo ? (
                /* Selected / Preview State */
                <div className="bg-surface border border-border rounded-md overflow-hidden relative min-h-[176px] h-full group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo}
                    alt="Complaint attachment preview"
                    className="w-full h-[176px] object-cover transition-transform duration-300 group-hover:scale-102"
                  />
                  
                  {/* Overlay delete control */}
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150 flex items-center justify-center">
                    <Button
                      type="button"
                      variant="error"
                      onClick={removePhoto}
                      className="!min-h-[40px] !h-[40px] !px-space-4 text-xs font-semibold rounded-md flex items-center gap-space-2 border border-error bg-error text-white hover:bg-error/90 active:scale-95 transition-transform"
                      aria-label={t("form.removePhoto")}
                    >
                      <IconWrapper icon={Trash2} size="micro" />
                      <span>{t("form.removePhoto")}</span>
                    </Button>
                  </div>
                </div>
              ) : (
                /* Empty / Dropzone State */
                <div
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
                    "bg-surface border border-dashed border-border-strong rounded-md p-space-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 select-none min-h-[176px] relative group outline-none",
                    "hover:bg-surface-variant focus-visible:bg-surface-variant focus-visible:border-text-primary",
                    "focus-visible:shadow-[0_0_0_2px_var(--bg),0_0_0_4px_var(--text-primary)]",
                    "active:scale-[0.98]",
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
                </div>
              )}
              {imageError && (
                <span
                  id="image-error"
                  role="alert"
                  className="text-xs text-error font-medium mt-space-2 text-center"
                >
                  {imageError}
                </span>
              )}
            </div>

            {/* 4. Voice Input Card Component (Double-Bezel) */}
            <div className="bg-surface-variant/40 border border-border p-space-2 rounded-lg">
              {isListening ? (
                /* Listening active state */
                <div
                  role="button"
                  tabIndex={0}
                  onClick={handleVoiceToggle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleVoiceToggle(e as any);
                    }
                  }}
                  aria-label="Stop Voice Input"
                  className={cn(
                    "bg-surface border border-text-primary rounded-md p-space-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 select-none min-h-[176px] relative outline-none",
                    "focus-visible:shadow-[0_0_0_2px_var(--bg),0_0_0_4px_var(--text-primary)]",
                    "active:scale-[0.98]"
                  )}
                >
                  {/* Slow pulsing neutral halo visual */}
                  <div className="relative mb-space-3">
                    <span className="absolute -inset-2 rounded-full bg-text-primary/10 animate-pulse duration-[1500ms]"></span>
                    <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-text-primary text-surface border border-text-primary">
                      <IconWrapper icon={Mic} size="standard" />
                    </div>
                  </div>
                  
                  <Heading level={3} className="!text-sm font-semibold mb-space-1 text-text-primary" aria-live="polite">
                    {t("form.voiceListening")}
                  </Heading>
                  
                  {/* Horizontal wave representation */}
                  <div className="flex items-center gap-1 h-3 mt-space-1">
                    <span className="w-1 h-2 bg-text-primary/40 rounded-full"></span>
                    <span className="w-1 h-3.5 bg-text-primary/60 rounded-full"></span>
                    <span className="w-1 h-1.5 bg-text-primary rounded-full"></span>
                    <span className="w-1 h-3 bg-text-primary/75 rounded-full"></span>
                    <span className="w-1 h-2 bg-text-primary/50 rounded-full"></span>
                  </div>
                </div>
              ) : (
                /* Idle/Inactive State */
                <div
                  role="button"
                  tabIndex={0}
                  onClick={handleVoiceToggle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleVoiceToggle(e as any);
                    }
                  }}
                  aria-label={t("form.voiceLabel")}
                  className={cn(
                    "bg-surface border border-border rounded-md p-space-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 select-none min-h-[176px] relative group outline-none",
                    "hover:bg-surface-variant focus-visible:bg-surface-variant focus-visible:border-text-primary",
                    "focus-visible:shadow-[0_0_0_2px_var(--bg),0_0_0_4px_var(--text-primary)]",
                    "active:scale-[0.98]"
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
                </div>
              )}
            </div>

          </div>
        </div>

        {/* 5. Action Buttons & Navigation */}
        <div className="pt-space-6 pb-space-2 mt-auto border-t border-border/50 flex flex-col sm:flex-row gap-space-3">
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-1/3 flex items-center justify-center gap-space-2 transition-transform"
            onClick={handleCancel}
          >
            <IconWrapper icon={ArrowLeft} className="h-4 w-4" />
            <span>{t("common.back")}</span>
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="w-full sm:w-2/3 flex items-center justify-center gap-space-2 group transition-all"
          >
            <span>{t("common.continue")}</span>
            <IconWrapper 
              icon={Check} 
              className="h-4 w-4 transition-transform duration-150 group-hover:scale-110 motion-safe:active:scale-90" 
            />
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
