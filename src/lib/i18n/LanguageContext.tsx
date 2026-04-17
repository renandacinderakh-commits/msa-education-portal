"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { dictionaries, Language, TranslationType } from "./dictionaries";

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  langCode: Language;
  t: TranslationType;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>("id");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedLang = localStorage.getItem("msa_lang") as Language | null;
    if (savedLang && (savedLang === "id" || savedLang === "en" || savedLang === "zh-CN")) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("msa_lang", lang);
    document.documentElement.lang = lang === "zh-CN" ? "zh" : lang;
  };

  if (!isMounted) {
    // Avoid hydration mismatch by rendering default without mounting check if needed,
    // but standard pattern is to render kids in default state and swap client-side.
    // We'll render children with default language ("id") on server and let it swap to cached lang.
    // To avoid flicker we just render it.
  }

  // Get the dictionary for current language. Fallback to ID if key missing.
  const t = dictionaries[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, langCode: language, t }}>
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
