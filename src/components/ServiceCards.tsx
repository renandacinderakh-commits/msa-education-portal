"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { BookOpen, Home, HeartHandshake, ArrowRight, Check } from "lucide-react";
import { getWhatsAppLink } from "@/lib/utils";
import SectionHeader from "./SectionHeader";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  Home,
  HeartHandshake,
};

const cardAccents = [
  {
    gradient: "from-sky-500 to-sky-600",
    bg: "bg-sky-50",
    text: "text-sky-600",
    border: "border-sky-200",
    lightBg: "bg-sky-100",
  },
  {
    gradient: "from-teal-500 to-mint-600",
    bg: "bg-mint-50",
    text: "text-teal-600",
    border: "border-teal-200",
    lightBg: "bg-teal-100",
  },
  {
    gradient: "from-peach-400 to-coral-500",
    bg: "bg-peach-50",
    text: "text-peach-600",
    border: "border-peach-200",
    lightBg: "bg-peach-100",
  },
];

export default function ServiceCards() {
  const { t, langCode } = useLanguage();

  const subtitle = langCode === 'en' ? "Our Programs" : langCode === 'zh-CN' ? "我们的项目" : "Program Kami";
  const title = langCode === 'en' ? "Choose the Right Learning Program" : langCode === 'zh-CN' ? "选择合适的学习计划" : "Pilih Program Belajar yang Tepat";
  const desc = langCode === 'en' ? "Every program is designed with a personalized approach, tailored to the needs and comfort of the child." : langCode === 'zh-CN' ? "每个项目都采用个性化的方法，根据孩子的需求和舒适度量身定制。" : "Setiap program dirancang dengan pendekatan yang personal, disesuaikan dengan kebutuhan dan kenyamanan anak.";

  const wtAskPrefix = langCode === 'en' ? 'I want to ask about the program' : langCode === 'zh-CN' ? '我想询问关于项目' : 'saya ingin bertanya tentang program';

  return (
    <section className="py-16 sm:py-24 gradient-section-alt">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          subtitle={subtitle}
          title={title}
          description={desc}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {t.services.map((service: any, index: number) => {
            const IconComponent = iconMap[service.icon] || BookOpen;
            const accent = cardAccents[index];

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="group relative bg-white dark:bg-slate-800 rounded-[var(--radius-card)] overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 border border-slate-100 dark:border-slate-700 flex flex-col"
              >
                {/* Top Color Bar */}
                <div className={`h-1.5 bg-gradient-to-r ${accent.gradient}`} />

                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <div className={`absolute top-4 left-4 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center ${accent.text}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    {service.title}
                  </h3>
                  <p className={`text-xs font-medium ${accent.text} mb-3`}>
                    {service.forWhom}
                  </p>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4">
                    {service.shortDescription}
                  </p>

                  {/* Benefits */}
                  <ul className="space-y-2 mb-6 flex-1">
                    {service.benefits.slice(0, 4).map((benefit: string) => (
                      <li
                        key={benefit}
                        className="flex items-start gap-2 text-sm text-slate-600"
                      >
                        <Check className={`w-4 h-4 shrink-0 mt-0.5 ${accent.text}`} />
                        <span className="leading-relaxed">{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <a
                    href={getWhatsAppLink(
                      `${t.contactInfo.whatsappTemplate} ${wtAskPrefix} ${service.title}.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center justify-center gap-2 w-full px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r ${accent.gradient} rounded-[var(--radius-button)] shadow-[var(--shadow-button)] hover:shadow-[var(--shadow-card)] transition-all duration-300 transform hover:-translate-y-0.5`}
                  >
                    {service.cta}
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
