"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Quote, Heart, BookOpen, Users, Smile } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function FounderSection() {
  const { t, langCode } = useLanguage();
  const founderInfo = t.founderInfo;

  const aboutFounder = langCode === 'en' ? 'About Our Founder' : langCode === 'zh-CN' ? '关于创始人' : 'Tentang Pendiri';
  const sectionTitle = langCode === 'en' ? 'The Story Behind MSA Education' : langCode === 'zh-CN' ? 'MSA Education 背后的故事' : 'Cerita di Balik MSA Education';
  const valuesLabel = langCode === 'en' ? 'Values we hold:' : langCode === 'zh-CN' ? '我们坚持的价值观:' : 'Nilai-nilai yang kami pegang:';

  return (
    <section className="py-16 sm:py-24 gradient-warm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Photo Side */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative flex justify-center"
          >
            <div className="relative w-72 sm:w-80 aspect-[3/4] rounded-3xl overflow-hidden shadow-[var(--shadow-float)]">
              <Image
                src={founderInfo.photo}
                alt={`${founderInfo.name} - ${founderInfo.role}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 288px, 320px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            {/* Floating Name Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 rounded-2xl shadow-[var(--shadow-card)] px-6 py-3 text-center min-w-max"
            >
              <p className="text-base font-bold text-slate-800 dark:text-white whitespace-nowrap px-2">{founderInfo.name}</p>
              <p className="text-xs text-sky-500 font-medium whitespace-nowrap">{founderInfo.role}</p>
            </motion.div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="inline-block text-xs sm:text-sm font-semibold uppercase tracking-widest text-sky-500 mb-3">
              {aboutFounder}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-6">
              {sectionTitle}
            </h2>

            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              {founderInfo.bio}
            </p>

            {/* Philosophy Quote */}
            <div className="relative p-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-white/80 dark:border-slate-700 mb-6 mt-8">
              <Quote className="absolute top-3 right-3 w-6 h-6 text-sky-200" />
              <p className="text-slate-600 dark:text-slate-300 italic leading-relaxed text-sm">
                &ldquo;{founderInfo.philosophy}&rdquo;
              </p>
              <p className="text-xs text-sky-500 font-medium mt-2">— {founderInfo.name}</p>
            </div>

            {/* Values */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">{valuesLabel}</p>
              {founderInfo.values.map((value: string, index: number) => {
                const icons = [Heart, BookOpen, Users, Smile, BookOpen];
                const IconComponent = icons[index % icons.length];
                return (
                  <div key={value} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900/40 text-sky-500 flex items-center justify-center shrink-0">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{value}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
