"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import SectionHeader from "./SectionHeader";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function FAQAccordion() {
  const { t, langCode } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const getSubtitle = () => {
    if (langCode === 'en') return "FAQ";
    if (langCode === 'zh-CN') return "常见问题";
    return "FAQ";
  };

  const getTitle = () => {
    if (langCode === 'en') return "Frequently Asked Questions";
    if (langCode === 'zh-CN') return "常见问题解答";
    return "Pertanyaan yang Sering Ditanyakan";
  };

  const getDescription = () => {
    if (langCode === 'en') return "Find answers to common questions about MSA Education services.";
    if (langCode === 'zh-CN') return "查找关于 MSA Education 服务的常见问题答案。";
    return "Temukan jawaban untuk pertanyaan umum seputar layanan MSA Education.";
  };

  return (
    <section className="py-16 sm:py-24 gradient-section-alt">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          subtitle={getSubtitle()}
          title={getTitle()}
          description={getDescription()}
        />

        <div className="space-y-3">
          {t.faqItems.map((item: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="bg-white rounded-[var(--radius-card)] border border-slate-100 shadow-sm overflow-hidden"
            >
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-sky-50/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-inset"
                aria-expanded={openIndex === index}
              >
                <span className="text-sm sm:text-base font-semibold text-slate-700 pr-4">
                  {item.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 text-sm text-slate-500 leading-relaxed border-t border-slate-50 pt-4">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
