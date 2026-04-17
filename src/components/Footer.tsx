"use client";

import Link from "next/link";
import Image from "next/image";
import {
  MessageCircle,
  Mail,
  MapPin,
  Heart,
  Phone,
  ExternalLink,
} from "lucide-react";
import { getWhatsAppLink } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { t, langCode } = useLanguage();

  const loc = {
    desc: langCode === 'en' 
      ? 'Warm, personal, and meaningful learning support for toddlers to elementary school children in Jakarta.'
      : langCode === 'zh-CN'
      ? '在雅加达为幼儿到小学生提供温暖、个性化且有意义的学习陪伴。'
      : 'Pendampingan belajar yang hangat, personal, dan bermakna untuk anak usia Toddler hingga SD di Jakarta.',
    navigation: langCode === 'en' ? 'Navigation' : langCode === 'zh-CN' ? '导航菜单' : 'Navigasi',
    serviceAreas: langCode === 'en' ? 'Service Areas' : langCode === 'zh-CN' ? '服务区域' : 'Area Layanan',
    contactUs: langCode === 'en' ? 'Contact Us' : langCode === 'zh-CN' ? '联系我们' : 'Hubungi Kami',
    freeConsult: langCode === 'en' ? 'Free Consultation' : langCode === 'zh-CN' ? '免费咨询' : 'Konsultasi Gratis',
    rights: langCode === 'en' ? 'All rights reserved.' : langCode === 'zh-CN' ? '版权所有。' : 'Semua hak dilindungi.',
    madeWith: langCode === 'en' ? 'Made with' : langCode === 'zh-CN' ? '汇聚' : 'Dibuat dengan',
    forIndo: langCode === 'en' ? 'for children education' : langCode === 'zh-CN' ? '致力于儿童教育' : 'untuk pendidikan anak Indonesia',
    wtAsk: langCode === 'en' ? 'Hello' : langCode === 'zh-CN' ? '你好' : 'Halo',
    wtAsk2: langCode === 'en' ? ', I want to have a consultation.' : langCode === 'zh-CN' ? '，我想免费咨询。' : ', saya ingin konsultasi.',
  };

  return (
    <footer className="relative bg-gradient-to-b from-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Decorative Top Wave */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-teal-400 to-peach-400" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Image
              src="/logo.svg"
              alt={t.contactInfo.brandName}
              width={160}
              height={42}
              className="h-10 w-auto brightness-0 invert mb-4"
            />
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              {loc.desc}
            </p>
            <div className="flex items-center gap-3">
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-green-600 hover:bg-green-500 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Navigasi */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {loc.navigation}
            </h3>
            <ul className="space-y-3">
              {t.navLinks
                .filter((l: any) => !l.isExternal)
                .map((link: any) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-slate-300 hover:text-sky-300 text-sm transition-colors inline-flex items-center gap-1.5"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          {/* Area Layanan */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {loc.serviceAreas}
            </h3>
            <ul className="space-y-3">
              {t.serviceAreas.map((area: any) => (
                <li
                  key={area.name}
                  className="text-slate-300 text-sm flex items-start gap-2"
                >
                  <MapPin className="w-4 h-4 text-peach-400 shrink-0 mt-0.5" />
                  {area.name}
                </li>
              ))}
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {loc.contactUs}
            </h3>
            {/* CTA */}
            <a
              href={getWhatsAppLink(`${loc.wtAsk} ${t.contactInfo.brandName}${loc.wtAsk2}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 rounded-[var(--radius-button)] transition-all shadow-[var(--shadow-button)]"
            >
              <ExternalLink className="w-4 h-4" />
              {loc.freeConsult}
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 text-xs text-center sm:text-left">
            © {currentYear} {t.contactInfo.brandName}. {loc.rights}
          </p>
          <p className="text-slate-500 text-xs flex items-center gap-1">
            {loc.madeWith} <Heart className="w-3 h-3 text-coral-400 fill-coral-400" /> {loc.forIndo}
          </p>
        </div>
      </div>
    </footer>
  );
}
