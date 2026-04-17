"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import SectionHeader from "./SectionHeader";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function TestimonialCards() {
  const { t, langCode } = useLanguage();

  const getSubtitle = () => {
    if (langCode === 'en') return "Testimonials";
    if (langCode === 'zh-CN') return "评价";
    return "Testimoni";
  };

  const getTitle = () => {
    if (langCode === 'en') return "Stories from Parents";
    if (langCode === 'zh-CN') return "家长的真实故事";
    return "Cerita dari Orang Tua";
  };

  const getDescription = () => {
    if (langCode === 'en') return "Opinions and experiences of parents who have entrusted their child's learning process to MSA Education.";
    if (langCode === 'zh-CN') return "家长将孩子托付给 MSA Education 的真实体验和看法。";
    return "Pendapat dan pengalaman orang tua yang telah mempercayakan pendampingan belajar anaknya kepada MSA Education.";
  };

  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          subtitle={getSubtitle()}
          title={getTitle()}
          description={getDescription()}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {t.testimonials.map((testimonial: any, index: number) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative p-6 sm:p-8 bg-gradient-to-br from-sky-50/50 to-white dark:from-slate-800 dark:to-slate-800 rounded-[var(--radius-card)] border border-sky-100/50 dark:border-slate-700 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300"
            >
              {/* Quote Icon */}
              <div className="absolute top-4 right-4 text-sky-200">
                <Quote className="w-8 h-8" />
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-sunflower-400 fill-sunflower-400"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6 italic">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Author with Photo */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-sky-200 shadow-sm shrink-0">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {testimonial.childLevel}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
