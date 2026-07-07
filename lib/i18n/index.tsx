"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import en from "../../content/en.json";
import mr from "../../content/mr.json";

export type Locale = "en" | "mr";

type TranslationKeys = typeof en;

interface LanguageContextType {
  locale: Locale;
  setLanguage: (lang: Locale) => void;
  t: (path: string, variables?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "nagrik_locale";

const dictionaries: Record<Locale, TranslationKeys> = { en, mr };

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  // Initialize from storage or environment on mount
  useEffect(() => {
    Promise.resolve().then(() => {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (saved === "en" || saved === "mr") {
        setLocaleState(saved);
      } else {
        // Detect browser language
        const systemLang = navigator.language.toLowerCase();
        const detected: Locale = systemLang.startsWith("mr") ? "mr" : "en";
        setLocaleState(detected);
      }
      setMounted(true);
    });
  }, []);

  const setLanguage = (lang: Locale) => {
    setLocaleState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    // Update HTML lang attribute for accessibility
    document.documentElement.lang = lang;
  };

  // Translation helper resolving nested keys (e.g. "category.title")
  const t = (path: string, variables?: Record<string, string | number>): string => {
    const parts = path.split(".");
    let current: unknown = dictionaries[locale];

    for (const part of parts) {
      if (current && typeof current === "object" && (current as Record<string, unknown>)[part] !== undefined) {
        current = (current as Record<string, unknown>)[part];
      } else {
        // Fallback to English if translation missing in Marathi
        let fallback: unknown = dictionaries["en"];
        for (const fallbackPart of parts) {
          if (fallback && typeof fallback === "object" && (fallback as Record<string, unknown>)[fallbackPart] !== undefined) {
            fallback = (fallback as Record<string, unknown>)[fallbackPart];
          } else {
            return path; // Return the path if key not found anywhere
          }
        }
        current = fallback;
        break;
      }
    }

    if (typeof current !== "string") {
      return path;
    }

    let result = current;
    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        result = result.replace(new RegExp(`{${key}}`, "g"), String(value));
      });
    }

    return result;
  };

  // Prevent flash of un-translated/mismatched hydration states by waiting until mounted
  const contextValue: LanguageContextType = {
    locale: mounted ? locale : "en",
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
