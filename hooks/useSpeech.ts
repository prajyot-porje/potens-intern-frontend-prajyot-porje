"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ---------------------------------------------------------------------------
// Type Declarations for Web Speech API (avoiding explicit any)
// ---------------------------------------------------------------------------

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  readonly isFinal?: boolean;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface ISpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): ISpeechRecognition;
}

function mergeTwo(s1: string, s2: string): string {
  const w1 = s1.trim().split(/\s+/).filter(Boolean);
  const w2 = s2.trim().split(/\s+/).filter(Boolean);
  if (w1.length === 0) return s2.trim();
  if (w2.length === 0) return s1.trim();

  const maxOverlap = Math.min(w1.length, w2.length);
  for (let len = maxOverlap; len > 0; len--) {
    let match = true;
    for (let i = 0; i < len; i++) {
      if (w1[w1.length - len + i].toLowerCase() !== w2[i].toLowerCase()) {
        match = false;
        break;
      }
    }
    if (match) {
      return [...w1.slice(0, w1.length - len), ...w2].join(" ");
    }
  }
  return s1.trim() + " " + s2.trim();
}

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

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isIntentionalStopRef = useRef(false);
  const accumulatedFinalRef = useRef("");

  // Check Web Speech API support safely on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const win = window as unknown as {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
        mozSpeechRecognition?: SpeechRecognitionConstructor;
        msSpeechRecognition?: SpeechRecognitionConstructor;
      };
      const SpeechRecognition =
        win.SpeechRecognition ||
        win.webkitSpeechRecognition ||
        win.mozSpeechRecognition ||
        win.msSpeechRecognition;
        
      Promise.resolve().then(() => {
        setIsSupported(!!SpeechRecognition);
      });
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
        } catch {
          // Suppress errors during unmount cleanup
        }
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

    const win = window as unknown as {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
      mozSpeechRecognition?: SpeechRecognitionConstructor;
      msSpeechRecognition?: SpeechRecognitionConstructor;
    };

    const SpeechRecognition =
      win.SpeechRecognition ||
      win.webkitSpeechRecognition ||
      win.mozSpeechRecognition ||
      win.msSpeechRecognition;

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
        } catch {
          // Suppress error during recreation cleanup
        }
        recognitionRef.current = null;
      }

      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = lang;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        Promise.resolve().then(() => {
          setIsListening(true);
        });
        isIntentionalStopRef.current = false;

        // Increment duration timer every second
        if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = setInterval(() => {
          Promise.resolve().then(() => {
            setDuration((prev) => prev + 1);
          });
        }, 1000);
      };

      rec.onresult = (event: SpeechRecognitionEvent) => {
        const finalSegments: string[] = [];
        let interimTranscript = "";

        // Collect all final results and interim results separately
        for (let i = 0; i < event.results.length; ++i) {
          const result = event.results[i];
          if (result.isFinal) {
            finalSegments.push(result[0].transcript);
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        // Merge final segments with overlap deduplication
        let finalTranscript = "";
        for (const seg of finalSegments) {
          const trimmed = seg.trim();
          if (!trimmed) continue;
          if (!finalTranscript) {
            finalTranscript = trimmed;
          } else {
            finalTranscript = mergeTwo(finalTranscript, trimmed);
          }
        }

        accumulatedFinalRef.current = finalTranscript;

        // Compute clean interim transcript that doesn't duplicate final words
        let cleanInterim = interimTranscript.trim();
        if (cleanInterim) {
          const total = mergeTwo(finalTranscript, cleanInterim);
          if (total.toLowerCase().startsWith(finalTranscript.toLowerCase())) {
            cleanInterim = total.slice(finalTranscript.length).trim();
          }
        }

        if (onResult) {
          onResult({
            final: finalTranscript,
            interim: cleanInterim,
          });
        }
      };

      rec.onerror = (event: SpeechRecognitionErrorEvent) => {
        // If intentionally stopped or aborted, suppress this error entirely.
        if (isIntentionalStopRef.current || event.error === "aborted") {
          return;
        }

        let errorType = "generic";

        if (event.error === "not-allowed" || event.error === "permission-denied") {
          errorType = "permission-denied";
        } else if (event.error === "no-speech") {
          errorType = "no-speech";
        } else if (event.error === "network") {
          errorType = "network";
        }

        Promise.resolve().then(() => {
          setError(errorType);
        });
        if (onError) onError(errorType);

        isIntentionalStopRef.current = true;
        try {
          rec.abort();
        } catch {
          // Suppress error during abort
        }
      };

      rec.onend = () => {
        Promise.resolve().then(() => {
          setIsListening(false);
        });
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
    } catch {
      Promise.resolve().then(() => {
        setError("generic");
      });
      if (onError) onError("generic");
    }
  }, [lang, onResult, onEnd, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      isIntentionalStopRef.current = true;
      try {
        recognitionRef.current.stop();
      } catch {
        // Suppress stop error
      }
      // Null the ref so the next startListening gets a fresh instance
      recognitionRef.current = null;
      Promise.resolve().then(() => {
        setIsListening(false);
      });
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
      } catch {
        // Suppress abort error
      }
      // Null the ref so the next startListening gets a fresh instance
      recognitionRef.current = null;
      Promise.resolve().then(() => {
        setIsListening(false);
      });
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
    setError: (err: string | null) => {
      Promise.resolve().then(() => setError(err));
    },
  };
}

export default useSpeech;
