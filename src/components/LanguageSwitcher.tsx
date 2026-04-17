"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Language } from "@/lib/i18n/dictionaries";

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const { langCode, setLanguage } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (code: Language) => {
    setLanguage(code);
    setIsOpen(false);
  };

  const flags = [
    { code: 'id' as Language, url: 'https://flagcdn.com/w40/id.png', label: 'Indonesia' },
    { code: 'en' as Language, url: 'https://flagcdn.com/w40/gb.png', label: 'English' },
    { code: 'zh-CN' as Language, url: 'https://flagcdn.com/w40/cn.png', label: 'Mandarin' }
  ];

  const activeFlag = flags.find(f => f.code === langCode) || flags[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center px-3 py-2 bg-slate-50/80 hover:bg-slate-100 rounded-[var(--radius-button)] border border-slate-200 transition-colors shadow-sm gap-2"
        aria-label="Pilih Bahasa"
      >
        <img src={activeFlag.url} alt={activeFlag.label} className="w-6 h-auto rounded-[2px]" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-[150px] bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 overflow-hidden z-[100]"
          >
            {flags.map((item) => (
              <button 
                key={item.code}
                onClick={() => changeLanguage(item.code)} 
                className={`flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 ${langCode === item.code ? 'bg-sky-50/50' : ''}`}
              >
                <img src={item.url} alt={item.label} className="w-6 h-auto rounded-[2px] shadow-sm" />
                <span className={`text-sm ${langCode === item.code ? 'font-bold text-sky-600' : 'text-slate-700 font-medium'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
