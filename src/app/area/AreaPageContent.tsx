"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  MapPin,
  MessageCircle,
  CheckCircle2,
  Navigation,
  Phone,
} from "lucide-react";
import { serviceAreas, contactInfo } from "@/lib/content";
import { getWhatsAppLink } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const areaDetails = [
  {
    name: "Jakarta Utara",
    districts: ["Sunter", "Kelapa Gading", "Tanjung Priok", "Koja", "Pademangan", "Cilincing"],
    color: "from-sky-400 to-sky-600",
    bgLight: "bg-sky-50",
    textColor: "text-sky-600",
    borderColor: "border-sky-200",
  },
  {
    name: "Jakarta Pusat",
    districts: ["Cempaka Putih", "Kemayoran", "Senen", "Menteng", "Gambir", "Sawah Besar"],
    color: "from-teal-400 to-teal-600",
    bgLight: "bg-teal-50",
    textColor: "text-teal-600",
    borderColor: "border-teal-200",
  },
  {
    name: "Jakarta Timur",
    districts: ["Pulomas", "Rawamangun", "Cakung", "Duren Sawit", "Matraman", "Jatinegara"],
    color: "from-peach-400 to-coral-500",
    bgLight: "bg-peach-50",
    textColor: "text-peach-600",
    borderColor: "border-peach-200",
  },
];

export default function AreaPageContent() {
  const { t, langCode } = useLanguage();

  const loc = {
    badge: langCode === 'en' ? 'Service Areas' : langCode === 'zh-CN' ? '服务区域' : 'Area Layanan',
    h1Part1: langCode === 'en' ? 'We are ' : langCode === 'zh-CN' ? '我们' : 'Kami ',
    h1Part2: langCode === 'en' ? 'Near You' : langCode === 'zh-CN' ? '就在您身边' : 'Hadir di Dekat Anda',
    heroDesc: langCode === 'en' ? 'MSA Education provides home visit learning support in several areas of Jakarta. Our teachers come right to your home.' : langCode === 'zh-CN' ? 'MSA Education 在雅加达多个地区提供家访学习辅导。我们的老师将亲自拜访您的家。' : 'MSA Education melayani pendampingan belajar home visit di beberapa wilayah Jakarta. Guru kami hadir langsung ke rumah Anda.',
    cardDesc: (areaName: string) => langCode === 'en' ? `Private tutoring and learning assistance directly at your home in ${areaName} and its surroundings.` : langCode === 'zh-CN' ? `在 ${areaName} 及其周边地区为您提供直接上门的私人教学和学习陪伴。` : `Les privat dan pendampingan belajar langsung ke rumah Anda di area ${areaName} dan sekitarnya.`,
    servedArea: langCode === 'en' ? 'Areas served:' : langCode === 'zh-CN' ? '服务区域：' : 'Area yang dilayani:',
    points: langCode === 'en' ? ["Teacher comes to your home", "Flexible schedule", "Free consultation"] : langCode === 'zh-CN' ? ["老师送教上门", "灵活的时间安排", "免费咨询"] : ["Guru datang ke rumah", "Jadwal fleksibel", "Konsultasi gratis"],
    contactAsk: (areaName: string) => langCode === 'en' ? `Contact for ${areaName}` : langCode === 'zh-CN' ? `联系 ${areaName}` : `Hubungi untuk ${areaName}`,
    wtArea: (areaName: string) => langCode === 'en' ? `Hello ${t.contactInfo.brandName}, I live in ${areaName} and would like to ask about private tutoring services.` : langCode === 'zh-CN' ? `你好 ${t.contactInfo.brandName}，我住在 ${areaName}，想咨询关于私教服务。` : `Halo ${t.contactInfo.brandName}, saya tinggal di ${areaName} dan ingin bertanya tentang layanan les privat.`,
    
    locTitle: langCode === 'en' ? 'Our Service Locations' : langCode === 'zh-CN' ? '我们的服务地点' : 'Lokasi Layanan Kami',
    locDesc: langCode === 'en' ? 'We continue to expand our service areas. Let us know if your area is not listed.' : langCode === 'zh-CN' ? '我们继续扩大我们的服务范围。如果您的地区未列出，请随时联系我们。' : 'Kami terus memperluas area layanan. Hubungi kami jika area Anda belum tercantum.',
    mapAlt: langCode === 'en' ? 'Location Map' : langCode === 'zh-CN' ? '位置地图' : 'Peta Lokasi',
    
    bottomText: langCode === 'en' ? 'Is your area not listed? Contact us — we might still be able to help.' : langCode === 'zh-CN' ? '如果您的地区未列出？请随时联系我们 —— 我们可能仍然可以向您提供服务。' : 'Area Anda belum tercantum? Hubungi kami — mungkin kami tetap bisa melayani.',
    askArea: langCode === 'en' ? 'Ask About Service Area' : langCode === 'zh-CN' ? '询问服务区域' : 'Tanya Area Layanan',
    wtAskArea: langCode === 'en' ? `Hello ${t.contactInfo.brandName}, I want to ask if my area is within the service coverage.` : langCode === 'zh-CN' ? `你好 ${t.contactInfo.brandName}，我想了解我的地区是否在服务范围内。` : `Halo ${t.contactInfo.brandName}, saya ingin menanyakan apakah area saya masuk dalam cakupan layanan.`,
  };

  return (
    <>
      {/* Hero */}
      <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 gradient-hero overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-mint-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-sky-200/20 rounded-full blur-3xl" />

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
              {loc.h1Part1} <span className="text-gradient-brand">{loc.h1Part2}</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto">
              {loc.heroDesc}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Area Cards */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {areaDetails.map((area, index) => (
              <motion.div
                key={area.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className={`relative overflow-hidden rounded-[var(--radius-card)] border ${area.borderColor} shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all`}
              >
                {/* Color Header */}
                <div className={`h-2 bg-gradient-to-r ${area.color}`} />

                <div className="p-6 sm:p-8">
                  {/* Location Icon */}
                  <div className={`w-14 h-14 rounded-2xl ${area.bgLight} ${area.textColor} flex items-center justify-center mb-5`}>
                    <MapPin className="w-7 h-7" />
                  </div>

                  <h2 className="text-xl font-bold text-slate-800 mb-2">
                    {area.name}
                  </h2>
                  <p className="text-sm text-slate-500 mb-5">
                    {loc.cardDesc(area.name)}
                  </p>

                  {/* Districts */}
                  <div className="mb-6">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">
                      {loc.servedArea}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {area.districts.map((district) => (
                        <span
                          key={district}
                          className={`px-3 py-1.5 text-xs font-medium ${area.bgLight} ${area.textColor} rounded-full`}
                        >
                          {district}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Trust Points */}
                  <div className="space-y-2 mb-6">
                    {loc.points.map((point) => (
                      <div key={point} className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle2 className={`w-4 h-4 ${area.textColor} shrink-0`} />
                        {point}
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <a
                    href={getWhatsAppLink(loc.wtArea(area.name))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center justify-center gap-2 w-full px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r ${area.color} rounded-[var(--radius-button)] shadow-[var(--shadow-button)] transition-all hover:-translate-y-0.5`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    {loc.contactAsk(area.name)}
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 sm:py-24 gradient-section-alt">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4">
              {loc.locTitle}
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              {loc.locDesc}
            </p>
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

          {/* Bottom CTA */}
          <div className="text-center mt-10">
            <p className="text-slate-500 mb-4">
              {loc.bottomText}
            </p>
            <a
              href={getWhatsAppLink(loc.wtAskArea)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-teal-500 rounded-[var(--radius-button)] shadow-[var(--shadow-button)] transition-all"
            >
              <Phone className="w-4 h-4" />
              {loc.askArea}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
