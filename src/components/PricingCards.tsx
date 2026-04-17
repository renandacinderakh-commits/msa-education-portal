"use client";

import { motion } from "framer-motion";
import { Check, Star, MessageCircle, ArrowRight } from "lucide-react";
import { getWhatsAppLink } from "@/lib/utils";
import SectionHeader from "./SectionHeader";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const colorMap: Record<string, { gradient: string; bg: string; badge: string; border: string }> = {
  peach: {
    gradient: "from-peach-400 to-coral-500",
    bg: "bg-peach-50",
    badge: "bg-peach-100 text-peach-600",
    border: "border-peach-200",
  },
  sky: {
    gradient: "from-sky-500 to-sky-600",
    bg: "bg-sky-50",
    badge: "bg-sky-100 text-sky-600",
    border: "border-sky-300",
  },
  mint: {
    gradient: "from-teal-500 to-mint-600",
    bg: "bg-mint-50",
    badge: "bg-teal-100 text-teal-600",
    border: "border-teal-200",
  },
  yellow: {
    gradient: "from-sunflower-400 to-amber-500",
    bg: "bg-sunflower-50",
    badge: "bg-sunflower-100 text-amber-600",
    border: "border-sunflower-200",
  },
};

export default function PricingCards() {
  const { t, langCode } = useLanguage();

  const subtitle = langCode === 'en' ? "Packages & Pricing" : langCode === 'zh-CN' ? "套餐与价格" : "Paket & Harga";
  const title = langCode === 'en' ? "Choose the Best Learning Package" : langCode === 'zh-CN' ? "选择最佳学习套餐" : "Pilih Paket Belajar Terbaik";
  const desc = langCode === 'en' ? "Flexible packages customizable to your child's learning needs." : langCode === 'zh-CN' ? "灵活的套餐，可根据您孩子的学习需求量身定制。" : "Paket yang fleksibel dan dapat disesuaikan dengan kebutuhan belajar anak Anda.";

  const wtAskPrefix = langCode === 'en' ? 'I am interested in' : langCode === 'zh-CN' ? '我对...感兴趣' : 'saya tertarik dengan';
  const wtAskSuffix = langCode === 'en' ? 'Can I get more info?' : langCode === 'zh-CN' ? '能提供更多信息吗？' : 'Bisa info lebih lanjut?';

  return (
    <section id="pricing" className="py-16 sm:py-24 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          subtitle={subtitle}
          title={title}
          description={desc}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {t.pricingPackages.map((pkg: any, index: number) => {
            const colors = colorMap[pkg.color] || colorMap.sky;

            return (
               <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`flex flex-col bg-white dark:bg-slate-800 rounded-[var(--radius-card)] overflow-hidden border ${
                  pkg.highlighted
                    ? `${colors.border} shadow-[var(--shadow-card-hover)] ring-2 ring-sky-200 dark:ring-sky-700`
                    : "border-slate-100 dark:border-slate-700 shadow-[var(--shadow-card)]"
                } hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 relative`}
              >
                {/* Popular Badge */}
                {pkg.highlighted && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-sky-500 to-teal-500 text-white text-xs font-semibold rounded-full shadow-sm">
                      <Star className="w-3 h-3 fill-current" />
                      {t.ui.popular}
                    </span>
                  </div>
                )}

                {/* Header */}
                <div className={`p-6 ${colors.bg}`}>
                  <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${colors.badge} mb-3`}>
                    {pkg.target}
                  </span>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1 pr-8">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    {pkg.frequency} &middot; {pkg.duration}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-slate-800 dark:text-white">
                      {pkg.price}
                    </span>
                    {pkg.period && (
                      <span className="text-sm text-slate-400">{pkg.period}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-tight">
                    {t.ui.bisaCustomized}
                  </p>
                </div>

                {/* Features */}
                <div className="p-6 flex-1">
                  <p className="text-xs text-slate-400 mb-3 font-medium uppercase tracking-wide">
                    {t.ui.included}
                  </p>
                  <ul className="space-y-2.5">
                    {pkg.features.map((feature: string) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"
                      >
                        <Check className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="p-6 pt-0 mt-auto">
                  <a
                    href={getWhatsAppLink(
                      `${t.contactInfo.whatsappTemplate} ${wtAskPrefix} ${pkg.name}. ${wtAskSuffix}`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center justify-center gap-2 w-full px-5 py-3 text-sm font-semibold rounded-[var(--radius-button)] transition-all duration-300 transform hover:-translate-y-0.5 ${
                      pkg.highlighted
                        ? `text-white bg-gradient-to-r ${colors.gradient} shadow-[var(--shadow-button)]`
                        : `text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600`
                    }`}
                  >
                    {!pkg.price || pkg.price.includes("Admin") ? (
                      <>
                        <MessageCircle className="w-4 h-4" />
                        {pkg.cta}
                      </>
                    ) : (
                      <>
                        {pkg.cta}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Pricing Note */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 text-center"
        >
          <p className="text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto">
            {t.pricingNote}
          </p>
          <a
            href={getWhatsAppLink(
              `${t.contactInfo.whatsappTemplate}`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 rounded-[var(--radius-button)] shadow-[var(--shadow-button)] transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            {t.ui.consultNow}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
