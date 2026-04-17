"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import SectionHeader from "./SectionHeader";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function VideoSection() {
  const [activeVideo, setActiveVideo] = useState<number | null>(null);
  const { t, langCode } = useLanguage();

  const getSubtitle = () => {
    if (langCode === 'en') return "Video";
    if (langCode === 'zh-CN') return "视频";
    return "Video";
  };

  const getTitle = () => {
    if (langCode === 'en') return "Get to Know Us Better";
    if (langCode === 'zh-CN') return "更深入地了解我们";
    return "Kenali Kami Lebih Dekat";
  };

  const getDescription = () => {
    if (langCode === 'en') return "See how we support children's learning with warmth and care.";
    if (langCode === 'zh-CN') return "看看我们如何以温暖和关怀来陪伴孩子们的学习。";
    return "Lihat bagaimana kami mendampingi anak-anak belajar dengan penuh kehangatan dan perhatian.";
  };

  return (
    <section className="py-16 sm:py-24 gradient-sky">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          subtitle={getSubtitle()}
          title={getTitle()}
          description={getDescription()}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {t.videoEmbeds.map((video: any, index: number) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="rounded-[var(--radius-card)] overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 bg-white"
            >
              <div className="relative aspect-video">
                {activeVideo === video.id ? (
                  video.embedUrl.endsWith('.mp4') ? (
                    <video
                      src={video.embedUrl}
                      controls
                      autoPlay
                      className="w-full h-full object-cover"
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <iframe
                      src={`${video.embedUrl}?autoplay=1&rel=0`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  )
                ) : (
                  <button
                    onClick={() => setActiveVideo(video.id)}
                    className="w-full h-full relative group cursor-pointer bg-gradient-to-br from-sky-100 to-teal-50 flex items-center justify-center"
                    aria-label={`Play: ${video.title}`}
                  >
                    {/* Play Button */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-[var(--shadow-float)] group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-7 h-7 sm:w-8 sm:h-8 text-sky-600 ml-1" />
                    </div>
                  </button>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-slate-800">
                  {video.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
