"use client";

import { motion } from "framer-motion";
import {
  MessageSquare,
  ClipboardList,
  BookHeart,
  BarChart3,
} from "lucide-react";
import SectionHeader from "./SectionHeader";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  MessageSquare,
  ClipboardList,
  BookHeart,
  BarChart3,
};

const stepColors = [
  { bg: "bg-sky-100", text: "text-sky-600", ring: "ring-sky-200" },
  { bg: "bg-teal-100", text: "text-teal-600", ring: "ring-teal-200" },
  { bg: "bg-peach-100", text: "text-peach-600", ring: "ring-peach-200" },
  { bg: "bg-sunflower-100", text: "text-amber-600", ring: "ring-sunflower-200" },
];

export default function HowItWorks() {
  const { t, langCode } = useLanguage();

  const getSubtitle = () => {
    if (langCode === 'en') return "How It Works";
    if (langCode === 'zh-CN') return "流程说明";
    return "Cara Kerja";
  };

  const getTitle = () => {
    if (langCode === 'en') return "Start Learning in 4 Easy Steps";
    if (langCode === 'zh-CN') return "只需 4 步即可开始学习";
    return "Mulai Belajar dalam 4 Langkah Mudah";
  };

  const getDescription = () => {
    if (langCode === 'en') return "A simple and transparent process, from initial consultation to ongoing learning support.";
    if (langCode === 'zh-CN') return "从初步咨询到持续的学习辅导，我们提供简单透明的服务流程。";
    return "Proses yang sederhana dan transparan, dari konsultasi awal hingga pendampingan belajar yang berkelanjutan.";
  };

  return (
    <section className="py-16 sm:py-24 gradient-section-alt">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          subtitle={getSubtitle()}
          title={getTitle()}
          description={getDescription()}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {t.howItWorks.map((step: any, index: number) => {
            const IconComponent = iconMap[step.icon] || MessageSquare;
            const colors = stepColors[index];

            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative text-center"
              >
                {/* Connector Line (desktop) */}
                {index < t.howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-slate-200 to-slate-100" />
                )}

                {/* Step Number + Icon */}
                <div className="relative inline-flex flex-col items-center mb-6">
                  <div
                    className={`w-20 h-20 rounded-3xl ${colors.bg} ${colors.text} ring-4 ${colors.ring} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                  >
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <span
                    className={`absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white ${colors.text} text-xs font-bold flex items-center justify-center shadow-sm border ${colors.ring.replace("ring-", "border-")}`}
                  >
                    {step.step}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
