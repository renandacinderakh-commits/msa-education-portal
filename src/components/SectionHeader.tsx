"use client";

import { motion } from "framer-motion";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  align?: "center" | "left";
  light?: boolean;
}

export default function SectionHeader({
  title,
  subtitle,
  description,
  align = "center",
  light = false,
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
      className={`mb-12 sm:mb-16 ${align === "center" ? "text-center" : "text-left"} max-w-3xl ${align === "center" ? "mx-auto" : ""}`}
    >
      {subtitle && (
        <span
          className={`inline-block text-xs sm:text-sm font-semibold uppercase tracking-widest mb-3 ${
            light ? "text-sky-300" : "text-sky-500"
          }`}
        >
          {subtitle}
        </span>
      )}
      <h2
        className={`text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight ${
          light ? "text-white" : "text-slate-800 dark:text-white"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-4 text-base sm:text-lg leading-relaxed ${
            light ? "text-slate-300" : "text-slate-500 dark:text-slate-300"
          }`}
        >
          {description}
        </p>
      )}
      {/* Decorative Line */}
      <div
        className={`mt-6 flex items-center gap-2 ${
          align === "center" ? "justify-center" : ""
        }`}
      >
        <span className="w-8 h-1 rounded-full bg-sky-400" />
        <span className="w-3 h-1 rounded-full bg-teal-400" />
        <span className="w-2 h-1 rounded-full bg-peach-400" />
      </div>
    </motion.div>
  );
}
