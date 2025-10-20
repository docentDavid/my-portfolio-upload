import { createServer } from "./supabase/server";

// Allowed image types
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Recommended dimensions
export const RECOMMENDED_WIDTH = 1200;
export const RECOMMENDED_HEIGHT = 630; // 1.9:1 ratio (good for social media)

export type UploadResult = {
  url: string | null;
  error: string | null;
};

/**
 * Validate image file
 */
export function validateImage(file: File): string | null {
  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Invalid file type. Only JPEG, PNG, and WebP images are allowed.";
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB.`;
  }

  return null;
}

/**
 * Upload image to Supabase Storage
 */
export async function uploadProjectImage(
  file: File,
  projectSlug: string
): Promise<UploadResult> {
  // Validate file
  const validationError = validateImage(file);
  if (validationError) {
    return { url: null, error: validationError };
  }

  try {
    const supabase = await createServer();

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${projectSlug}-${Date.now()}.${fileExt}`;
    const filePath = `projects/${fileName}`;

    // Upload file
    const { data, error } = await supabase.storage
      .from("project-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return { url: null, error: "Failed to upload image." };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("project-images").getPublicUrl(data.path);

    return { url: publicUrl, error: null };
  } catch (error) {
    console.error("Upload error:", error);
    return { url: null, error: "An unexpected error occurred." };
  }
}

/**
 * Delete image from Supabase Storage
 */
export async function deleteProjectImage(url: string): Promise<boolean> {
  try {
    const supabase = await createServer();

    // Extract path from URL
    const urlParts = url.split("/storage/v1/object/public/project-images/");
    if (urlParts.length < 2) {
      console.error("Invalid URL format");
      return false;
    }

    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from("project-images")
      .remove([filePath]);

    if (error) {
      console.error("Delete error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Delete error:", error);
    return false;
  }
}
