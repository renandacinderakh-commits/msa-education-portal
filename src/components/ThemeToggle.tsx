"use client";

import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-center w-9 h-9 rounded-[var(--radius-button)] border border-slate-200 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors shadow-sm"
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      title={theme === "light" ? "Dark Mode" : "Light Mode"}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -30, opacity: 0, scale: 0.8 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {theme === "light" ? (
          <Moon className="w-4 h-4 text-slate-600" />
        ) : (
          <Sun className="w-4 h-4 text-yellow-400" />
        )}
      </motion.div>
    </button>
  );
}
