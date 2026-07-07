"use client";

import React from "react";
import { Mic, Check, ShieldAlert, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../lib/i18n";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { Button } from "../primitives/Button";
import { IconWrapper } from "../primitives/IconWrapper";
import { Heading } from "../typography/Heading";
import { ParagraphText } from "../typography/ParagraphText";
import { cn } from "../../lib/utils";

export interface VoiceInputProps {
  isSupported: boolean;
  isListening: boolean;
  duration: number;
  error: string | null;
  onStartListening: () => void;
  onStopListening: (e: React.MouseEvent) => void;
  onCancelListening: (e: React.MouseEvent) => void;
  onResetSpeechError: (e?: React.MouseEvent | React.KeyboardEvent) => void;
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const VoiceInput: React.FC<VoiceInputProps> = ({
  isSupported,
  isListening,
  duration,
  error,
  onStartListening,
  onStopListening,
  onCancelListening,
  onResetSpeechError,
}) => {
  const { t } = useLanguage();
  const isReduced = useReducedMotion();

  return (
    <div className="bg-surface-variant/40 border border-border p-space-2 sm:p-space-3 rounded-lg min-h-[194px] sm:min-h-[218px] flex flex-col justify-between">
      <AnimatePresence mode="wait">
        {!isSupported ? (
          /* State A: Unsupported Browser */
          <motion.div
            key="unsupported"
            initial={isReduced ? { opacity: 0 } : { opacity: 0, transform: "scale(0.98)" }}
            animate={{ opacity: 1, transform: "scale(1)" }}
            exit={isReduced ? { opacity: 0 } : { opacity: 0, transform: "scale(0.98)" }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="bg-surface/50 border border-border/80 rounded-md p-space-4 sm:p-space-6 flex flex-col items-center justify-center text-center select-none min-h-[176px] sm:min-h-[194px] relative opacity-60 flex-1"
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
        ) : error ? (
          /* State B: Error Occurred */
          <motion.div
            key="error"
            initial={isReduced ? { opacity: 0 } : { opacity: 0, transform: "scale(0.98)" }}
            animate={{ opacity: 1, transform: "scale(1)" }}
            exit={isReduced ? { opacity: 0 } : { opacity: 0, transform: "scale(0.98)" }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            role="button"
            tabIndex={0}
            onClick={onResetSpeechError}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onResetSpeechError(e);
              }
            }}
            aria-label={`${t("form.voiceErrorTitle")}. ${t(`form.voiceError${error.charAt(0).toUpperCase() + error.slice(1)}` || "form.voiceError")}. ${t("form.voiceTryAgain")}`}
            className={cn(
              "bg-surface border border-error/50 rounded-md p-space-4 sm:p-space-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 select-none min-h-[176px] sm:min-h-[194px] relative group outline-none flex-1",
              "interactive-card focus-visible:border-error custom-focus",
              "focus-visible:shadow-[0_0_0_2px_var(--bg),0_0_0_4px_var(--error)]",
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
              {t(`form.voiceError${error === "permission-denied" ? "PermissionDenied" : error === "no-speech" ? "NoSpeech" : error === "network" ? "Network" : error === "aborted" ? "Aborted" : "Generic"}`)}
            </ParagraphText>
            <span className="text-[11px] font-mono uppercase tracking-[0.15em] text-text-tertiary group-hover:text-text-primary transition-colors">
              {t("form.voiceTryAgain")}
            </span>
          </motion.div>
        ) : isListening ? (
          /* State C: Listening Active */
          <motion.div
            key="listening"
            initial={isReduced ? { opacity: 0 } : { opacity: 0, transform: "scale(0.98)" }}
            animate={{ opacity: 1, transform: "scale(1)" }}
            exit={isReduced ? { opacity: 0 } : { opacity: 0, transform: "scale(0.98)" }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            role="region"
            aria-label="Voice recording session active"
            className="bg-surface border border-border rounded-md p-space-4 sm:p-space-6 flex flex-col items-center justify-center text-center min-h-[176px] sm:min-h-[194px] relative outline-none flex-1"
          >
            {/* Recording Timer Centered in Flow */}
            <div className="font-mono text-xs font-semibold text-text-secondary bg-surface-variant/80 border border-border px-space-2 py-0.5 rounded-full flex items-center gap-1.5 mb-space-2" aria-label="Recording duration">
              <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span>
              {formatDuration(duration)}
            </div>

            {/* Pulsing visual halo (respecting prefers-reduced-motion) */}
            <div className="relative mb-space-2">
              <motion.div
                animate={isReduced ? {} : {
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

            {/* Visual Waveform */}
            {!isReduced && (
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
                onClick={onStopListening}
                className="w-full !min-h-[48px] !h-[48px] !px-space-4 text-xs rounded-md flex items-center justify-center gap-space-1 font-semibold"
                aria-label={t("form.voiceStop")}
              >
                <IconWrapper icon={Check} className="h-3.5 w-3.5" />
                <span>{t("form.voiceStop")}</span>
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={onCancelListening}
                className="w-full !min-h-[48px] !h-[48px] !px-space-4 text-xs rounded-md border border-border-strong hover:bg-surface-variant flex items-center justify-center gap-space-1 font-semibold"
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
            initial={isReduced ? { opacity: 0 } : { opacity: 0, transform: "scale(0.98)" }}
            animate={{ opacity: 1, transform: "scale(1)" }}
            exit={isReduced ? { opacity: 0 } : { opacity: 0, transform: "scale(0.98)" }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            role="button"
            tabIndex={0}
            onClick={onStartListening}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onStartListening();
              }
            }}
            aria-label={t("form.voiceLabel")}
            className={cn(
              "bg-surface border border-border rounded-md p-space-4 sm:p-space-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 select-none min-h-[176px] sm:min-h-[194px] relative group outline-none flex-1",
              "interactive-card focus-visible:border-text-primary custom-focus",
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
  );
};
