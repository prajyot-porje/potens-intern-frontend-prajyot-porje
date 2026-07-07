"use client";

import React, { useState, useRef } from "react";
import { Camera, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../lib/i18n";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { Button } from "../primitives/Button";
import { IconWrapper } from "../primitives/IconWrapper";
import { Heading } from "../typography/Heading";
import { ParagraphText } from "../typography/ParagraphText";
import { compressImage } from "../../lib/utils/image";
import { cn } from "../../lib/utils";

export interface PhotoUploaderProps {
  photo: string | null;
  onPhotoChange: (photo: string | null) => void;
  imageError: string | null;
  setImageError: (error: string | null) => void;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  photo,
  onPhotoChange,
  imageError,
  setImageError,
}) => {
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isReduced = useReducedMotion();

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
      onPhotoChange(compressed);
      setImageError(null);

      if (announcement) {
        announcement.textContent = t("form.photoLabel");
      }
    } catch {
      // Fallback to raw FileReader if canvas compression fails
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const rawBase64 = event.target.result as string;
          // Check raw base64 size (limit to 1.5MB to protect local storage quota)
          if (rawBase64.length > 1.5 * 1024 * 1024 * 1.33) {
            setImageError(t("validation.imageTooLarge"));
            onPhotoChange(null);
          } else {
            onPhotoChange(rawBase64);
            setImageError(null);
          }
        }
      };
      reader.onerror = () => {
        setImageError(t("validation.invalidImage"));
        onPhotoChange(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering open file picker
    onPhotoChange(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div
      className={cn(
        "bg-surface-variant/40 border border-border p-space-2 sm:p-space-3 rounded-lg transition-[background-color,border-color] duration-150 flex flex-col justify-between min-h-[194px] sm:min-h-[218px]",
        isDragging && "border-text-primary bg-surface-variant/70",
        imageError && "border-error bg-error/5"
      )}
    >
      <AnimatePresence mode="wait">
        {photo ? (
          /* Selected / Preview State */
          <motion.div
            key="preview"
            initial={isReduced ? { opacity: 0 } : { opacity: 0, transform: "scale(0.98)" }}
            animate={{ opacity: 1, transform: "scale(1)" }}
            exit={isReduced ? { opacity: 0 } : { opacity: 0, transform: "scale(0.98)" }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="bg-surface border border-border rounded-md overflow-hidden relative min-h-[176px] sm:min-h-[194px] h-full flex-1 group flex flex-col"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo}
              alt="Complaint attachment preview"
              className="w-full h-full min-h-[176px] flex-1 object-cover transition-transform duration-300 group-hover:scale-102"
            />

            {/* Always visible close button for mobile/accessibility, z-20 to sit above hover overlay */}
            <button
              type="button"
              onClick={removePhoto}
              className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 active:scale-90 transition-all border border-white/10 cursor-pointer"
              aria-label={t("form.removePhoto")}
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>

            {/* Overlay delete control for desktop (hover/focus) */}
            <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150 flex items-center justify-center z-10 pointer-events-none">
              <Button
                type="button"
                variant="error"
                onClick={removePhoto}
                className="!min-h-[48px] !h-[48px] !px-space-4 text-xs font-semibold rounded-md flex items-center gap-space-2 border border-error bg-error text-white hover:bg-error/90 active:scale-95 transition-transform btn-hover-group pointer-events-auto"
                aria-label={t("form.removePhoto")}
              >
                <IconWrapper icon={Trash2} className="h-4 w-4 transition-transform duration-150 btn-hover-scale" />
                <span>{t("form.removePhoto")}</span>
              </Button>
            </div>
          </motion.div>
        ) : (
          /* Empty / Dropzone State */
          <motion.div
            key="dropzone"
            initial={isReduced ? { opacity: 0 } : { opacity: 0, transform: "scale(0.98)" }}
            animate={{ opacity: 1, transform: "scale(1)" }}
            exit={isReduced ? { opacity: 0 } : { opacity: 0, transform: "scale(0.98)" }}
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
              "bg-surface border border-dashed border-border-strong rounded-md p-space-4 sm:p-space-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 select-none min-h-[176px] sm:min-h-[194px] relative group outline-none flex-1",
              "interactive-card focus-visible:border-text-primary custom-focus",
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
  );
};
