"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  BookOpen,
  Home,
  HeartHandshake,
  Check,
  ArrowRight,
  MessageCircle,
  Lightbulb,
  Users,
  Clock,
  Star,
} from "lucide-react";
import { getWhatsAppLink } from "@/lib/utils";
import SectionHeader from "@/components/SectionHeader";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  Home,
  HeartHandshake,
};

const colorSchemes = [
  { bg: "bg-sky-50", accent: "text-sky-600", gradient: "from-sky-500 to-sky-600", pill: "bg-sky-100 text-sky-600" },
  { bg: "bg-mint-50", accent: "text-teal-600", gradient: "from-teal-500 to-mint-600", pill: "bg-teal-100 text-teal-600" },
  { bg: "bg-peach-50", accent: "text-peach-600", gradient: "from-peach-400 to-coral-500", pill: "bg-peach-100 text-peach-600" },
];

export default function ProgramPageContent() {
  const { t, langCode } = useLanguage();

  const loc = {
    badge: langCode === 'en' ? 'Our Programs' : langCode === 'zh-CN' ? '我们的课程' : 'Program Kami',
    heroTitle1: langCode === 'en' ? 'Learning Programs that are ' : langCode === 'zh-CN' ? '' : 'Program Belajar yang ',
    heroTitle2: langCode === 'en' ? 'Personal & Meaningful' : langCode === 'zh-CN' ? '个性化且有意义的学习课程' : 'Personal & Bermakna',
    heroDesc: langCode === 'en' 
      ? 'Find the learning support program that best suits your child. Every program is designed with a personal, warm, and fun approach.'
      : langCode === 'zh-CN'
      ? '为您的孩子找到最合适的学习辅导课程。每个课程都以个性化、温暖且有趣的方式设计。'
      : 'Temukan program pendampingan belajar yang paling sesuai untuk anak Anda. Setiap program dirancang dengan pendekatan yang personal, hangat, dan menyenangkan.',
    
    programBenefits: langCode === 'en' ? 'Program Benefits' : langCode === 'zh-CN' ? '项目优势' : 'Keunggulan Program',
    sampleActivities: langCode === 'en' ? 'Sample Learning Activities' : langCode === 'zh-CN' ? '学习活动示例' : 'Contoh Aktivitas Belajar',
    
    ageSubtitle: langCode === 'en' ? 'Ages We Serve' : langCode === 'zh-CN' ? '服务年龄段' : 'Usia yang Dilayani',
    ageTitle: langCode === 'en' ? 'Suitable for Various Age Groups' : langCode === 'zh-CN' ? '适合各年龄段' : 'Cocok untuk Berbagai Kelompok Usia',
    ageDesc: langCode === 'en' ? 'Every age group gets a different approach suited to their developmental stage.' : langCode === 'zh-CN' ? '每个年龄段都获得适合其发展阶段的不同教学方法。' : 'Setiap kelompok usia mendapatkan pendekatan yang berbeda sesuai tahap perkembangannya.',
    
    wtPrefix: langCode === 'en' ? `Hello ${t.contactInfo.brandName}, I would like to consult about the ` : langCode === 'zh-CN' ? `您好 ${t.contactInfo.brandName}，我想咨询` : `Halo ${t.contactInfo.brandName}, saya ingin konsultasi tentang program `,
    wtSuffix: langCode === 'en' ? ' program.' : langCode === 'zh-CN' ? '课程。' : '.',
  };

  return (
    <>
      {/* Hero */}
      <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 gradient-hero overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-sky-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-mint-200/20 rounded-full blur-3xl" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-xs sm:text-sm font-semibold uppercase tracking-widest text-sky-500 mb-4">
              {loc.badge}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 leading-tight mb-6">
              {loc.heroTitle1}<span className="text-gradient-brand">{loc.heroTitle2}</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto">
              {loc.heroDesc}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Detailed Services */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          {t.services.map((service: any, index: number) => {
            const IconComponent = iconMap[service.icon] || BookOpen;
            const scheme = colorSchemes[index];
            const isReversed = index % 2 !== 0;

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center ${isReversed ? "lg:direction-rtl" : ""}`}
              >
                {/* Image */}
                <div className={`${isReversed ? "lg:order-2" : ""}`}>
                  <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-[var(--shadow-card-hover)]">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className={`${isReversed ? "lg:order-1" : ""}`}>
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 ${scheme.pill} rounded-full text-xs font-medium mb-4`}>
                    <IconComponent className="w-3.5 h-3.5" />
                    {service.forWhom}
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4">
                    {service.title}
                  </h2>
                  <p className="text-slate-600 leading-relaxed mb-6">
                    {service.fullDescription}
                  </p>

                  {/* Benefits */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <Star className={`w-4 h-4 ${scheme.accent}`} />
                      {loc.programBenefits}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {service.benefits.map((benefit: string) => (
                        <div key={benefit} className="flex items-start gap-2 text-sm text-slate-600">
                          <Check className={`w-4 h-4 shrink-0 mt-0.5 ${scheme.accent}`} />
                          {benefit}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Activities */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <Lightbulb className={`w-4 h-4 ${scheme.accent}`} />
                      {loc.sampleActivities}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {service.activities.map((activity: string) => (
                        <div key={activity} className="flex items-start gap-2 text-sm text-slate-500">
                          <span className={`w-1.5 h-1.5 rounded-full ${scheme.accent.replace("text-", "bg-")} shrink-0 mt-2`} />
                          {activity}
                        </div>
                      ))}
                    </div>
                  </div>

                  <a
                    href={getWhatsAppLink(
                      `${loc.wtPrefix}${service.title}${loc.wtSuffix}`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r ${scheme.gradient} rounded-[var(--radius-button)] shadow-[var(--shadow-button)] hover:shadow-[var(--shadow-card)] transition-all`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    {service.cta}
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Age Groups for Programs */}
      <section className="py-16 sm:py-24 gradient-section-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            subtitle={loc.ageSubtitle}
            title={loc.ageTitle}
            description={loc.ageDesc}
          />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {t.ageGroups.map((group: any, index: number) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="p-5 bg-white rounded-[var(--radius-card)] border border-slate-100 shadow-[var(--shadow-card)] text-center hover:shadow-[var(--shadow-card-hover)] transition-all"
              >
                <p className="text-lg font-bold text-slate-800 mb-1">{group.label}</p>
                <p className="text-xs text-sky-500 font-medium mb-3">{group.ageRange}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{group.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
