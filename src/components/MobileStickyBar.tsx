"use client";

import Link from "next/link";
import { MessageCircle, ArrowRight, GraduationCap } from "lucide-react";
import { getWhatsAppLink } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function MobileStickyBar() {
  const { t } = useLanguage();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-lg border-t border-slate-100 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="px-4 py-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom,0px))]">
        <div className="flex items-center gap-2.5 max-w-lg mx-auto">
          <a
            href={getWhatsAppLink(`${t.contactInfo.whatsappTemplate}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-3 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-[var(--shadow-button)] active:scale-[0.97] transition-transform min-h-[48px]"
          >
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span className="truncate">{t.ui.chatWa}</span>
          </a>
          <Link
            href="/portal/login"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-3 text-sm font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-colors active:scale-[0.97] min-h-[48px]"
          >
            <GraduationCap className="w-4 h-4 shrink-0" />
            <span>Portal</span>
          </Link>
          <a
            href="/program"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-3 text-sm font-semibold text-sky-600 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-colors active:scale-[0.97] min-h-[48px]"
          >
            <span>{t.ui.programs}</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </a>
        </div>
      </div>
    </div>
  );
}
