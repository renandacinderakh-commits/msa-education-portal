"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import SectionHeader from "./SectionHeader";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function GalleryGrid() {
  const { t, langCode } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<typeof t.galleryItems[0] | null>(null);

  const getSubtitle = () => {
    if (langCode === 'en') return "Learning Gallery";
    if (langCode === 'zh-CN') return "学习图库";
    return "Galeri Belajar";
  };

  const getTitle = () => {
    if (langCode === 'en') return "Meaningful Learning Moments";
    if (langCode === 'zh-CN') return "有意义的学习时光";
    return "Momen Belajar yang Bermakna";
  };

  const getDescription = () => {
    if (langCode === 'en') return "A glimpse of warm and fun learning moments with MSA Education.";
    if (langCode === 'zh-CN') return "与 MSA Education 一起度过温暖而有趣的时光。";
    return "Sekilas momen belajar yang hangat dan menyenangkan bersama MSA Education.";
  };

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          subtitle={getSubtitle()}
          title={getTitle()}
          description={getDescription()}
        />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {t.galleryItems.map((item: any, index: number) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              onClick={() => setSelectedImage(item)}
              className="group relative aspect-[4/3] bg-slate-100 dark:bg-slate-800 rounded-[var(--radius-card)] overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              aria-label={`View photo: ${item.alt}`}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                className="object-contain group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                <p className="text-sm font-medium">{item.caption}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl w-full aspect-[4/3] rounded-2xl overflow-hidden bg-black/40"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedImage.src}
                alt={selectedImage.alt}
                fill
                className="object-contain"
                sizes="90vw"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors z-10"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 sm:p-6 opacity-100">
                <p className="text-white font-medium">{selectedImage.caption}</p>
                <p className="text-white/70 text-sm mt-1">{selectedImage.alt}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
