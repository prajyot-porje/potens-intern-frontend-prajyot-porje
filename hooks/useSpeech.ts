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
      if (!recognitionRef.current) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = lang;

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

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const result = event.results[i];
            if (result.isFinal) {
              finalTranscript += result[0].transcript;
            } else {
              interimTranscript += result[0].transcript;
            }
          }

          if (finalTranscript) {
            accumulatedFinalRef.current += (accumulatedFinalRef.current ? " " : "") + finalTranscript;
          }

          if (onResult) {
            onResult({
              final: accumulatedFinalRef.current,
              interim: interimTranscript,
            });
          }
        };

        rec.onerror = (event: any) => {
          // If the error is 'aborted' or we intentionally stopped/aborted the session,
          // do not treat it as a failure and suppress console.error.
          if (isIntentionalStopRef.current || event.error === "aborted") {
            return;
          }

          // Do not log 'no-speech' as a console.error since it is an expected silence timeout.
          if (event.error !== "no-speech") {
            console.error("Speech recognition error:", event.error);
          }
          
          let errorType = "generic";
          
          // Map browser SpeechRecognition error types to friendly, localized strings
          if (event.error === "not-allowed" || event.error === "permission-denied") {
            errorType = "permission-denied";
          } else if (event.error === "no-speech") {
            errorType = "no-speech";
          } else if (event.error === "network") {
            errorType = "network";
          }

          setError(errorType);
          if (onError) onError(errorType);
          
          // Reset states immediately on error
          isIntentionalStopRef.current = true;
          try {
            rec.abort();
          } catch (e) {}
        };

        rec.onend = () => {
          setIsListening(false);
          if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
            durationIntervalRef.current = null;
          }

          // If the browser ends the session automatically (e.g. silence detection / inactivity)
          if (!isIntentionalStopRef.current) {
            if (onEnd) {
              onEnd(accumulatedFinalRef.current);
            }
          }
        };

        recognitionRef.current = rec;
      } else {
        recognitionRef.current.lang = lang;
      }

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
      } catch (e) {
        console.error("Error aborting SpeechRecognition:", e);
      }
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
