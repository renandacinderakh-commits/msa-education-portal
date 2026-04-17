"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface PhotoUploaderProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
  studentId?: string;
}

export default function PhotoUploader({
  photos,
  onChange,
  maxPhotos = 5,
  studentId,
}: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (photos.length + acceptedFiles.length > maxPhotos) {
        alert(`Maksimal ${maxPhotos} foto per entri.`);
        return;
      }

      setUploading(true);
      const newUrls: string[] = [];

      for (const file of acceptedFiles) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${studentId || "entry"}-${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${fileExt}`;
        const filePath = `learning-photos/${fileName}`;

        const { error } = await supabase.storage
          .from("learning-photos")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (!error) {
          const {
            data: { publicUrl },
          } = supabase.storage.from("learning-photos").getPublicUrl(filePath);
          newUrls.push(publicUrl);
        }
      }

      onChange([...photos, ...newUrls]);
      setUploading(false);
    },
    [photos, onChange, maxPhotos, studentId, supabase]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxFiles: maxPhotos - photos.length,
    disabled: uploading || photos.length >= maxPhotos,
  });

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    onChange(newPhotos);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        📸 Foto Kegiatan ({photos.length}/{maxPhotos})
      </label>

      {/* Photo Grid */}
      <AnimatePresence mode="popLayout">
        {photos.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {photos.map((url, index) => (
              <motion.div
                key={url}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative aspect-square rounded-xl overflow-hidden border-2 border-slate-100 dark:border-slate-700 group"
              >
                <Image
                  src={url}
                  alt={`Photo ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="120px"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Dropzone */}
      {photos.length < maxPhotos && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-sky-400 bg-sky-50 dark:bg-sky-900/20"
              : "border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 hover:bg-slate-50 dark:hover:bg-slate-800/50"
          } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            {uploading ? (
              <>
                <div className="w-8 h-8 border-2 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
                <p className="text-sm text-slate-500">Mengupload...</p>
              </>
            ) : isDragActive ? (
              <>
                <ImageIcon className="w-8 h-8 text-sky-400" />
                <p className="text-sm text-sky-500 font-medium">
                  Lepaskan foto di sini
                </p>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Drag & drop foto, atau{" "}
                  <span className="text-sky-500 font-medium">pilih file</span>
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  JPG, PNG, WebP • Maks {maxPhotos} foto
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
