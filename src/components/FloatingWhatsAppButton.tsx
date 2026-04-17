"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { getWhatsAppLink } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function FloatingWhatsAppButton() {
  const [show, setShow] = useState(false);
  const [tooltip, setTooltip] = useState(true);
  const { t, langCode } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 2000);
    const tooltipTimer = setTimeout(() => setTooltip(false), 8000);
    return () => {
      clearTimeout(timer);
      clearTimeout(tooltipTimer);
    };
  }, []);

  const questionText = langCode === 'en' ? 'Have questions?' : langCode === 'zh-CN' ? '有问题吗？' : 'Ada pertanyaan?';
  const chatText = langCode === 'en' ? 'Chat with us' : langCode === 'zh-CN' ? '与我们聊天' : 'Chat kami';
  const wtAskText = langCode === 'en' ? 'I want to ask about your services.' : langCode === 'zh-CN' ? '我想询问您的服务。' : 'saya ingin bertanya tentang layanan Anda.';

  if (!show) return null;

  return (
    <>
      {/* Position above mobile sticky bar on small screens */}
      <div className="fixed z-50 right-4 sm:right-6 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] lg:bottom-6 flex flex-col items-end gap-2">
        {/* Tooltip */}
        <AnimatePresence>
          {tooltip && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-[var(--shadow-float)] px-4 py-3 max-w-[180px] sm:max-w-[200px] border border-slate-100 hidden sm:block"
            >
              <p className="text-xs text-slate-600 leading-relaxed">
                {questionText} <span className="font-semibold text-green-600">{chatText}</span> di WhatsApp! 👋
              </p>
              <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r border-b border-slate-100 transform rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Button */}
        <motion.a
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          href={getWhatsAppLink(
            `${t.contactInfo.whatsappTemplate} ${wtAskText}`
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="relative w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-[var(--shadow-float)] hover:shadow-lg transition-all duration-300 transform hover:scale-110 active:scale-95"
          aria-label="Chat via WhatsApp"
          onClick={() => setTooltip(false)}
        >
          <MessageCircle className="w-7 h-7" />
          {/* Pulse Ring */}
          <span className="absolute w-full h-full rounded-full bg-green-400 animate-ping opacity-20" />
        </motion.a>
      </div>
    </>
  );
}
