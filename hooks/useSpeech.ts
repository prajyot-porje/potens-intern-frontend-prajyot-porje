"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface UseSpeechOptions {
  lang?: string;
  onResult?: (result: { final: string; interim: string }) => void;
  onEnd?: (finalTranscript: string) => void;
  onError?: (error: string) => void;
}

export function useSpeech(options: UseSpeechOptions = {}) {
  const { lang = "en-IN", onResult, onEnd, onError } = options;

  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isIntentionalStopRef = useRef(false);
  const accumulatedFinalRef = useRef("");

  // Check Web Speech API support safely on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition ||
        (window as any).mozSpeechRecognition ||
        (window as any).msSpeechRecognition;
      setIsSupported(!!SpeechRecognition);
    }
  }, []);

  // Update recognition language dynamically if it changes mid-session or before starting
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = lang;
    }
  }, [lang]);

  // Clean up references and timers on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  const startListening = useCallback(() => {
    setError(null);
    setDuration(0);
    accumulatedFinalRef.current = "";

    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition ||
      (window as any).mozSpeechRecognition ||
      (window as any).msSpeechRecognition;

    if (!SpeechRecognition) {
      setError("not-supported");
      if (onError) onError("not-supported");
      return;
    }

    try {
      // Always destroy and recreate the recognition instance.
      //
      // Android Chrome re-fires stale partial results from the previous session
      // when the same instance is restarted — causing words to appear multiple
      // times (e.g. "check check check the testing"). Creating a fresh instance
      // for every recording session is the only reliable fix across all mobile
      // browsers.
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onstart = null;
          recognitionRef.current.onresult = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.abort();
        } catch (_) {}
        recognitionRef.current = null;
      }

      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = lang;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        setIsListening(true);
        isIntentionalStopRef.current = false;

        // Increment duration timer every second
        if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = setInterval(() => {
          setDuration((prev) => prev + 1);
        }, 1000);
      };

      rec.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        // Rebuild the entire transcript from scratch.
        // This is the only bulletproof way to handle mobile Chrome/Android where
        // event.resultIndex is buggy and often resets to 0, which causes
        // duplicate appends in cumulative transcription models.
        for (let i = 0; i < event.results.length; ++i) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += (finalTranscript ? " " : "") + result[0].transcript.trim();
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        accumulatedFinalRef.current = finalTranscript;

        if (onResult) {
          onResult({
            final: finalTranscript,
            interim: interimTranscript,
          });
        }
      };

      rec.onerror = (event: any) => {
        // If intentionally stopped or aborted, suppress this error entirely.
        if (isIntentionalStopRef.current || event.error === "aborted") {
          return;
        }

        // 'no-speech' is an expected silence timeout — not a user-facing error.
        if (event.error !== "no-speech") {
          console.error("Speech recognition error:", event.error);
        }

        let errorType = "generic";

        if (event.error === "not-allowed" || event.error === "permission-denied") {
          errorType = "permission-denied";
        } else if (event.error === "no-speech") {
          errorType = "no-speech";
        } else if (event.error === "network") {
          errorType = "network";
        }

        setError(errorType);
        if (onError) onError(errorType);

        isIntentionalStopRef.current = true;
        try {
          rec.abort();
        } catch (_) {}
      };

      rec.onend = () => {
        setIsListening(false);
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
          durationIntervalRef.current = null;
        }

        // Browser ended session automatically (silence detection / inactivity)
        if (!isIntentionalStopRef.current) {
          if (onEnd) {
            onEnd(accumulatedFinalRef.current);
          }
        }
      };

      recognitionRef.current = rec;
      recognitionRef.current.start();
    } catch (e) {
      console.error("Failed to initialize or start SpeechRecognition:", e);
      setError("generic");
      if (onError) onError("generic");
    }
  }, [lang, onResult, onEnd, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      isIntentionalStopRef.current = true;
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error("Error stopping SpeechRecognition:", e);
      }
      // Null the ref so the next startListening gets a fresh instance
      recognitionRef.current = null;
      setIsListening(false);
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      if (onEnd) {
        onEnd(accumulatedFinalRef.current);
      }
    }
  }, [isListening, onEnd]);

  const cancelListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      isIntentionalStopRef.current = true;
      try {
        recognitionRef.current.abort();
      } catch (_) {}
      // Null the ref so the next startListening gets a fresh instance
      recognitionRef.current = null;
      setIsListening(false);
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      accumulatedFinalRef.current = "";
    }
  }, [isListening]);

  return {
    isSupported,
    isListening,
    duration,
    error,
    startListening,
    stopListening,
    cancelListening,
    setError,
  };
}

export default useSpeech;
