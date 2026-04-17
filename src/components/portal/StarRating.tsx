"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  labelEn?: string;
  icon?: string;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
}

const STAR_DESCRIPTIONS: Record<number, { id: string; en: string }> = {
  1: { id: "Perlu Latihan Lagi", en: "Needs More Practice" },
  2: { id: "Berkembang", en: "Developing" },
  3: { id: "Sesuai Harapan", en: "Meeting Expectations" },
  4: { id: "Melebihi Harapan", en: "Exceeding Expectations" },
  5: { id: "Luar Biasa", en: "Outstanding" },
};

export default function StarRating({
  value,
  onChange,
  label,
  labelEn,
  icon,
  size = "md",
  readonly = false,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const displayValue = hovered || value;

  return (
    <div className="space-y-1">
      {(label || labelEn) && (
        <div className="flex items-center gap-2 mb-1">
          {icon && <span className="text-lg">{icon}</span>}
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {label}
            </p>
            {labelEn && (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                {labelEn}
              </p>
            )}
          </div>
        </div>
      )}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            type="button"
            disabled={readonly}
            whileHover={readonly ? {} : { scale: 1.2 }}
            whileTap={readonly ? {} : { scale: 0.9 }}
            onClick={() => !readonly && onChange(star === value ? 0 : star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            className={`${readonly ? "cursor-default" : "cursor-pointer"} transition-colors`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                star <= displayValue
                  ? "fill-amber-400 text-amber-400"
                  : "text-slate-200 dark:text-slate-700"
              } transition-colors`}
            />
          </motion.button>
        ))}
        {displayValue > 0 && (
          <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
            {STAR_DESCRIPTIONS[displayValue]?.id} / {STAR_DESCRIPTIONS[displayValue]?.en}
          </span>
        )}
      </div>
    </div>
  );
}
