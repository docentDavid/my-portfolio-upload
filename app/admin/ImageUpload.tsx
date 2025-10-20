"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { RECOMMENDED_WIDTH, RECOMMENDED_HEIGHT } from "@/lib/image-upload";

type ImageUploadProps = {
  currentImageUrl?: string | null;
  onImageChange: (file: File | null) => void;
};

export default function ImageUpload({
  currentImageUrl,
  onImageChange,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(
    currentImageUrl || null
  );
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    setError(null);

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only JPEG, PNG, and WebP images are allowed.");
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File size must be less than 5MB.");
      return;
    }

    // Read file and check dimensions
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement("img");
      img.onload = () => {
        setDimensions({ width: img.width, height: img.height });

        // Check if dimensions are reasonable
        if (img.width < 600 || img.height < 300) {
          setError(
            "Image dimensions are too small. Minimum 600x300 pixels recommended."
          );
          return;
        }

        setPreview(event.target?.result as string);
        onImageChange(file);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setDimensions(null);
    setError(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
        Cover Image
      </label>

      {preview ? (
        <div className="space-y-3">
          <div className="relative w-full h-64 rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-700">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>

          {dimensions && (
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              Dimensions: {dimensions.width} × {dimensions.height} pixels
              {(dimensions.width < RECOMMENDED_WIDTH ||
                dimensions.height < RECOMMENDED_HEIGHT) && (
                <span className="text-amber-600 dark:text-amber-400 ml-2">
                  (Recommended: {RECOMMENDED_WIDTH} × {RECOMMENDED_HEIGHT})
                </span>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              Change Image
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-2 text-sm border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-64 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
        >
          <svg
            className="w-12 h-12 text-zinc-400 dark:text-zinc-500 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
            Click to upload cover image
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            JPEG, PNG or WebP (max 5MB)
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
            Recommended: {RECOMMENDED_WIDTH} × {RECOMMENDED_HEIGHT} pixels
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        Images will be uploaded to Supabase Storage. Landscape orientation
        (1.9:1 ratio) works best for previews.
      </p>
    </div>
  );
}
