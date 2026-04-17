"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, MessageCircle } from "lucide-react";
import { getWhatsAppLink } from "@/lib/utils";
import SectionHeader from "./SectionHeader";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function AreaCoverageSection() {
  const { t, langCode } = useLanguage();

  const getSubtitle = () => {
    if (langCode === 'en') return "Service Area";
    if (langCode === 'zh-CN') return "服务区域";
    return "Area Layanan";
  };

  const getTitle = () => {
    if (langCode === 'en') return "Serving Families in Jakarta";
    if (langCode === 'zh-CN') return "为雅加达地区的家庭服务";
    return "Melayani Keluarga di Jakarta";
  };

  const getDescription = () => {
    if (langCode === 'en') return "MSA Education is here to support children's learning in various Jakarta regions.";
    if (langCode === 'zh-CN') return "MSA Education 在雅加达多个地区为儿童提供随行学习辅导支持。";
    return "MSA Education hadir untuk mendampingi anak-anak belajar di beberapa wilayah Jakarta.";
  };

  const getAskBtn = () => {
    if (langCode === 'en') return "Ask About Service Areas";
    if (langCode === 'zh-CN') return "询问服务区域";
    return "Tanya Area Layanan";
  };

  const askPrefix = langCode === 'en' ? 'is my area included in your services? I live in ' : langCode === 'zh-CN' ? '我的地区包含在服务范围内吗？我住在 ' : 'apakah area saya termasuk dalam layanan? Saya tinggal di ';

  return (
    <section className="py-16 sm:py-24 gradient-section-alt">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          subtitle={getSubtitle()}
          title={getTitle()}
          description={getDescription()}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {t.serviceAreas.map((area: any, index: number) => (
            <motion.div
              key={area.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group p-6 bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] border border-slate-100 transition-all duration-300 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <MapPin className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                {area.name}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {area.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Home Visit Map Illustration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-[var(--radius-card)] overflow-hidden shadow-[var(--shadow-card)] border border-slate-100 bg-gradient-to-br from-sky-50/50 to-white"
        >
          <div className="relative w-full h-72 sm:h-96 md:h-[28rem] lg:h-[32rem]">
            <Image
              src="/images/home-visit-map.png"
              alt={langCode === 'en' ? 'We come to your home - home visit tutoring across Jakarta' : langCode === 'zh-CN' ? '我们上门服务 - 覆盖雅加达各区的上门辅导' : 'Kami datang ke rumah Anda - les privat home visit di Jakarta'}
              fill
              className="object-contain p-2 sm:p-4"
              sizes="(max-width: 768px) 100vw, 80vw"
            />
          </div>
        </motion.div>

        <div className="text-center mt-8">
          <a
            href={getWhatsAppLink(
              `${t.contactInfo.whatsappTemplate} ${askPrefix}`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 rounded-[var(--radius-button)] shadow-[var(--shadow-button)] transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            {getAskBtn()}
          </a>
        </div>
      </div>
    </section>
  );
}
