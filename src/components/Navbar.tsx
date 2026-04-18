"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, MessageCircle, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getWhatsAppLink } from "@/lib/utils";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg shadow-[var(--shadow-navbar)]"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/logo.svg"
              alt={t.contactInfo.brandName}
              width={160}
              height={42}
              className="h-9 sm:h-10 w-auto dark:brightness-0 dark:invert"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {t.navLinks.map((link: any) =>
              link.isExternal ? (
                <a
                  key={link.label}
                  href={getWhatsAppLink(`${t.contactInfo.whatsappTemplate}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-[var(--radius-button)] transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-[var(--radius-button)] transition-colors"
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            <LanguageSwitcher />
            <Link
              href="/portal/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-[var(--radius-button)] transition-colors"
            >
              <GraduationCap className="w-4 h-4" />
              Portal
            </Link>
            <a
              href={getWhatsAppLink(`${t.contactInfo.whatsappTemplate}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 rounded-[var(--radius-button)] shadow-[var(--shadow-button)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <MessageCircle className="w-4 h-4" />
              {t.ui.consultNow}
            </a>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <LanguageSwitcher />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-[var(--radius-button)] transition-colors"
              aria-label={isOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-100 dark:border-slate-700 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {t.navLinks.map((link: any) =>
                link.isExternal ? (
                  <a
                    key={link.label}
                    href={getWhatsAppLink(`${t.contactInfo.whatsappTemplate}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-base font-medium text-green-600 hover:bg-green-50 rounded-[var(--radius-button)] transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 text-base font-medium text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-[var(--radius-button)] transition-colors"
                  >
                    {link.label}
                  </Link>
                )
              )}
              <div className="pt-3 border-t border-slate-100">
                <Link
                  href="/portal/login"
                  onClick={() => setIsOpen(false)}
                  className="mb-2 flex w-full items-center justify-center gap-2 rounded-[var(--radius-button)] border border-sky-200 bg-sky-50 px-5 py-3 text-base font-semibold text-sky-700 transition-colors hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-900/20 dark:text-sky-300"
                >
                  <GraduationCap className="h-5 w-5" />
                  Portal
                </Link>
                <a
                  href={getWhatsAppLink(`${t.contactInfo.whatsappTemplate}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-5 py-3 text-base font-semibold text-white bg-gradient-to-r from-sky-500 to-teal-500 rounded-[var(--radius-button)] shadow-[var(--shadow-button)]"
                >
                  <MessageCircle className="w-5 h-5" />
                  {t.ui.consultNow}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
