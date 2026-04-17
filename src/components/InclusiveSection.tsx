"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  Puzzle,
  Flower2,
  MessageCircleHeart,
  Shield,
  Sprout,
  Heart,
} from "lucide-react";
import { getWhatsAppLink } from "@/lib/utils";
import SectionHeader from "./SectionHeader";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Puzzle,
  Flower2,
  MessageCircleHeart,
  Shield,
  Sprout,
};

export default function InclusiveSection() {
  const { t, langCode } = useLanguage();

  const getSubtitle = () => {
    if (langCode === 'en') return "Inclusive Support";
    if (langCode === 'zh-CN') return "包容性支持";
    return "Pendampingan Inklusif";
  };

  const badgeInklusif = langCode === 'en' ? 'Inclusive' : langCode === 'zh-CN' ? '包容性' : 'Inklusif';
  const badgeSubtitle = langCode === 'en' ? 'For All Children' : langCode === 'zh-CN' ? '为所有儿童' : 'Untuk Semua Anak';
  const askBtn = langCode === 'en' ? 'Consult Special Needs Support' : langCode === 'zh-CN' ? '咨询特殊需求支持' : 'Konsultasi Pendampingan ABK';
  const wtText = langCode === 'en' ? 'I want to consult about learning assistance for special needs children.' : langCode === 'zh-CN' ? '我想咨询关于特殊需求儿童的随行辅导。' : 'saya ingin berkonsultasi tentang pendampingan belajar untuk anak berkebutuhan khusus.';

  return (
    <section className="py-16 sm:py-24 gradient-warm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          subtitle={getSubtitle()}
          title={t.inclusiveSection.title}
          description={t.inclusiveSection.subtitle}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-[var(--shadow-float)]">
              <Image
                src="/images/service-abk-support.jpg"
                alt="Inclusive learning support"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-peach-500/10 to-transparent" />
            </div>
            {/* Floating Element */}
            <div className="absolute -bottom-4 -right-4 bg-white dark:bg-slate-800 rounded-2xl shadow-[var(--shadow-card)] p-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-peach-300 to-coral-400 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-100">{badgeInklusif}</p>
                <p className="text-xs text-slate-400">{badgeSubtitle}</p>
              </div>
            </div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
              {t.inclusiveSection.description}
            </p>

            <div className="space-y-4">
              {t.inclusiveSection.highlights.map((item: any, index: number) => {
                const IconComponent = iconMap[item.icon] || Sprout;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/80 dark:border-slate-700 hover:bg-white/80 dark:hover:bg-slate-700/80 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-peach-100 dark:bg-peach-900/40 text-peach-500 flex items-center justify-center shrink-0">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-100 mb-1">
                        {item.title}
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-300 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <a
              href={getWhatsAppLink(
                `${t.contactInfo.whatsappTemplate} ${wtText}`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-peach-400 to-coral-500 hover:from-peach-500 hover:to-coral-600 rounded-[var(--radius-button)] shadow-[var(--shadow-button)] transition-all"
            >
              <MessageCircleHeart className="w-4 h-4" />
              {askBtn}
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
