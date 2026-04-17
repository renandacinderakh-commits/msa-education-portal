"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Sparkles, Star } from "lucide-react";
import { getWhatsAppLink } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function HeroSection() {
  const { t, langCode } = useLanguage();
  
  // Since headline translation structure can vary, we will just use the entire string.
  // Instead of splitting styling by hardcoded string, we apply the gradient to the whole or specific logic per lang.
  // We'll just render it gracefully.
  const renderHeadline = () => {
    if (langCode === 'id') {
      return (
        <h1 className="text-[1.75rem] sm:text-4xl lg:text-5xl xl:text-[3.25rem] font-bold text-slate-800 leading-[1.2] sm:leading-tight mb-4 sm:mb-6">
          <span className="text-gradient-brand">Pendampingan yang Tepat</span>
          <br />untuk Tumbuh Kembang Anak
        </h1>
      );
    }
    if (langCode === 'en') {
      return (
        <h1 className="text-[1.75rem] sm:text-4xl lg:text-5xl xl:text-[3.25rem] font-bold text-slate-800 leading-[1.2] sm:leading-tight mb-4 sm:mb-6">
          <span className="text-gradient-brand">The Right Learning Support</span>
          <br />for Your Child's Growth
        </h1>
      );
    }
    return (
      <h1 className="text-[1.75rem] sm:text-4xl lg:text-5xl xl:text-[3.25rem] font-bold text-slate-800 leading-[1.2] sm:leading-tight mb-4 sm:mb-6">
        <span className="text-gradient-brand">为孩子成长提供最合适</span>
        <br />的学习支持
      </h1>
    );
  };

  return (
    <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center gradient-hero overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-20 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-sky-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-peach-200/30 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-mint-200/20 rounded-full blur-3xl hidden sm:block" />
      
      {/* Decorative Stars */}
      <div className="absolute top-32 right-20 text-sunflower-400 opacity-60 animate-pulse-soft hidden md:block">
        <Star className="w-6 h-6 fill-current" />
      </div>
      <div className="absolute bottom-40 left-16 text-peach-400 opacity-50 animate-float hidden md:block">
        <Sparkles className="w-5 h-5" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-20 sm:pb-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            {/* Trust Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/70 backdrop-blur-sm border border-sky-100 rounded-full text-[11px] sm:text-sm text-sky-600 font-medium mb-4 sm:mb-6 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              {t.ui.trustBadge}
            </motion.div>

            {renderHeadline()}

            {/* MSA Acronym */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mb-3 sm:mb-4"
            >
              <p className="text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-sky-500">
                <span className="text-teal-500">M</span>indful · <span className="text-teal-500">S</span>upportive · <span className="text-teal-500">A</span>daptive
              </p>
            </motion.div>

            {/* Brand Slogan */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mb-4 sm:mb-5"
            >
              <p className="text-sm sm:text-base font-medium italic text-slate-600">
                &ldquo;Every Mind Matters, Every Child Shines.&rdquo;
              </p>
              {langCode !== 'en' && (
                <p className="text-xs sm:text-sm not-italic text-slate-500 mt-1">
                  {langCode === 'zh-CN' ? '(每个心灵都珍贵，每个孩子都闪耀。)' : '(Setiap pikiran itu berharga, setiap anak berhak bersinar.)'}
                </p>
              )}
            </motion.div>

            <p className="text-sm sm:text-base lg:text-lg text-slate-500 leading-relaxed mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0">
              {t.heroContent.subheadline}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-start justify-center lg:justify-start">
              <a
                href={getWhatsAppLink(`${t.contactInfo.whatsappTemplate}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 rounded-[var(--radius-button)] shadow-[var(--shadow-button)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <MessageCircle className="w-5 h-5" />
                {t.heroContent.ctaPrimary}
              </a>
              <a
                href="/program"
                className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-sky-600 bg-white hover:bg-sky-50 border border-sky-200 rounded-[var(--radius-button)] shadow-sm hover:shadow transition-all duration-300 active:scale-[0.98]"
              >
                {t.heroContent.ctaSecondary}
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Quick Trust Points */}
            <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-4 sm:gap-x-6 gap-y-2 text-xs sm:text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                {t.ui.personalApproach}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-peach-400" />
                {t.ui.experiencedTeachers}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                {t.ui.coverageAreas}
              </span>
            </div>
          </motion.div>

          {/* Hero Image - NOW VISIBLE ON ALL SCREENS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="relative flex justify-center"
          >
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-none aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden shadow-[var(--shadow-float)]">
              <Image
                src={t.heroContent.heroImage}
                alt="Learning gracefully"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 70vw, 50vw"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/10 to-transparent" />
            </div>
            
            {/* Floating Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="absolute -bottom-3 sm:-bottom-4 left-2 sm:-left-4 bg-white rounded-xl sm:rounded-2xl shadow-[var(--shadow-card)] p-3 sm:p-4 flex items-center gap-2 sm:gap-3"
            >
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-sunflower-300 to-peach-400 flex items-center justify-center">
                <Star className="w-4 h-4 sm:w-6 sm:h-6 text-white fill-white" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-700">{t.ui.trusted}</p>
                <p className="text-[10px] sm:text-xs text-slate-400">{t.ui.parentsInJkt}</p>
              </div>
            </motion.div>

            {/* Floating Badge 2 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="absolute -top-1 sm:-top-2 right-2 sm:-right-2 bg-white rounded-xl sm:rounded-2xl shadow-[var(--shadow-card)] p-2 sm:p-3 flex items-center gap-2"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-teal-400 to-sky-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-slate-700">{t.ui.personal}</p>
                <p className="text-[9px] sm:text-[11px] text-slate-400">{t.ui.andFun}</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
