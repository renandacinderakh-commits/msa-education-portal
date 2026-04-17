"use client";

import { motion } from "framer-motion";
import { Heart, BookOpen, Users, Sparkles, Shield, Sun } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function AboutPageContent() {
  const { t, langCode } = useLanguage();

  const loc = {
    badge: langCode === 'en' ? 'About Us' : langCode === 'zh-CN' ? '关于我们' : 'Tentang Kami',
    
    valuesSubtitle: langCode === 'en' ? 'Our Values' : langCode === 'zh-CN' ? '我们的价值观' : 'Nilai Kami',
    valuesTitle: langCode === 'en' ? 'What We Stand For' : langCode === 'zh-CN' ? '我们的坚持' : 'Yang Menjadi Pegangan Kami',
    valuesDesc: langCode === 'en' ? 'These values are the foundation of every interaction and support we provide.' : langCode === 'zh-CN' ? '这些价值观是我们每次互动和辅导的基石。' : 'Nilai-nilai ini menjadi fondasi dari setiap interaksi dan pendampingan yang kami berikan.',

    values: langCode === 'en' ? [
      { icon: Heart, title: "Patient", desc: "Every child learns at their own pace. We patiently walk with them every step.", color: "bg-coral-100 text-coral-500" },
      { icon: Users, title: "Personal", desc: "Full attention for every child, not a one-size-fits-all method.", color: "bg-sky-100 text-sky-500" },
      { icon: Sun, title: "Warm", desc: "A learning atmosphere that feels comfortable, like studying with family.", color: "bg-sunflower-100 text-amber-500" },
      { icon: Shield, title: "Safe", desc: "A safe and supportive learning environment without excessive pressure.", color: "bg-teal-100 text-teal-500" },
      { icon: Sparkles, title: "Fun", desc: "Learning doesn't have to be boring. We make every session full of joy.", color: "bg-peach-100 text-peach-500" },
      { icon: BookOpen, title: "Growing", desc: "Focus on the child's holistic growth, not just academic grades.", color: "bg-mint-100 text-mint-600" },
    ] : langCode === 'zh-CN' ? [
      { icon: Heart, title: "耐心", desc: "每个孩子都有自己的学习节奏。我们耐心地陪伴每一步。", color: "bg-coral-100 text-coral-500" },
      { icon: Users, title: "个性化", desc: "对每个孩子给予充分的关注，而非一刀切的方法。", color: "bg-sky-100 text-sky-500" },
      { icon: Sun, title: "温暖", desc: "如家人般舒适的学习氛围。", color: "bg-sunflower-100 text-amber-500" },
      { icon: Shield, title: "安全", desc: "安全且支持性的学习环境，没有过度压力。", color: "bg-teal-100 text-teal-500" },
      { icon: Sparkles, title: "愉快", desc: "学习不一定要枯燥。我们让每次课堂充满快乐。", color: "bg-peach-100 text-peach-500" },
      { icon: BookOpen, title: "成长", desc: "关注孩子的全面成长，而非仅仅是学业成绩。", color: "bg-mint-100 text-mint-600" },
    ] : [
      { icon: Heart, title: "Sabar", desc: "Setiap anak belajar dengan kecepatannya sendiri. Kami sabar menemani setiap langkah.", color: "bg-coral-100 text-coral-500" },
      { icon: Users, title: "Personal", desc: "Perhatian penuh untuk setiap anak, bukan satu metode untuk semua.", color: "bg-sky-100 text-sky-500" },
      { icon: Sun, title: "Hangat", desc: "Suasana belajar yang nyaman seperti belajar bersama keluarga.", color: "bg-sunflower-100 text-amber-500" },
      { icon: Shield, title: "Aman", desc: "Lingkungan belajar yang aman dan mendukung tanpa tekanan berlebihan.", color: "bg-teal-100 text-teal-500" },
      { icon: Sparkles, title: "Menyenangkan", desc: "Belajar tidak harus membosankan. Kami membuat setiap sesi penuh kegembiraan.", color: "bg-peach-100 text-peach-500" },
      { icon: BookOpen, title: "Bertumbuh", desc: "Fokus pada pertumbuhan holistik anak, bukan sekadar nilai akademik.", color: "bg-mint-100 text-mint-600" },
    ],

    programHighlightLabel: langCode === 'en' ? 'Program Highlights' : langCode === 'zh-CN' ? '项目亮点' : 'Keunggulan Program',
    activityLabel: langCode === 'en' ? 'Sample Learning Activities' : langCode === 'zh-CN' ? '学习活动示例' : 'Contoh Aktivitas Belajar',
  };

  return (
    <>
      {/* Hero */}
      <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 gradient-hero overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-sky-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-peach-200/20 rounded-full blur-3xl" />

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
              {t.aboutContent.title}
            </h1>
            <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto">
              {t.aboutContent.intro}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="space-y-16">
            {/* Education Philosophy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {t.aboutContent.philosophy.title}
                </h2>
              </div>
              <p className="text-slate-600 leading-relaxed text-base ml-[52px]">
                {t.aboutContent.philosophy.content}
              </p>
            </motion.div>

            {/* Personalized Learning */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-peach-100 text-peach-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {t.aboutContent.personalizedLearning.title}
                </h2>
              </div>
              <p className="text-slate-600 leading-relaxed text-base ml-[52px]">
                {t.aboutContent.personalizedLearning.content}
              </p>
            </motion.div>

            {/* Inclusive Approach */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center">
                  <Heart className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {t.aboutContent.inclusive.title}
                </h2>
              </div>
              <p className="text-slate-600 leading-relaxed text-base ml-[52px]">
                {t.aboutContent.inclusive.content}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-16 sm:py-24 gradient-section-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            subtitle={loc.valuesSubtitle}
            title={loc.valuesTitle}
            description={loc.valuesDesc}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loc.values.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-6 bg-white rounded-[var(--radius-card)] border border-slate-100 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all group"
                >
                  <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
