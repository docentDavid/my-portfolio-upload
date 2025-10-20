"use server";

import { createServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Project } from "@/lib/types";

// Helper to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Helper to upload image
async function uploadImage(file: File, slug: string): Promise<string | null> {
  const supabase = await createServer();

  // Generate unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${slug}-${Date.now()}.${fileExt}`;
  const filePath = `projects/${fileName}`;

  const { data, error } = await supabase.storage
    .from("project-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Upload error:", error);
    return null;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("project-images").getPublicUrl(data.path);

  return publicUrl;
}

// Helper to delete image
async function deleteImage(url: string): Promise<void> {
  const supabase = await createServer();

  const urlParts = url.split("/storage/v1/object/public/project-images/");
  if (urlParts.length < 2) return;

  const filePath = urlParts[1];
  await supabase.storage.from("project-images").remove([filePath]);
}

// CREATE with image
export async function createProject(formData: FormData) {
  const supabase = await createServer();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  const title = formData.get("title") as string;
  const summary = formData.get("summary") as string;
  const content = formData.get("content") as string;
  const tagsInput = formData.get("tags") as string;
  const is_hidden = formData.get("is_hidden") === "on";
  const imageFile = formData.get("image") as File | null;

  // Convert comma-separated tags to array
  const tags = tagsInput
    ? tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  const slug = generateSlug(title);

  // Upload image if provided
  let cover_url = null;
  if (imageFile && imageFile.size > 0) {
    cover_url = await uploadImage(imageFile, slug);
  }

  const { error } = await supabase
    .from("projects")
    .insert({
      title,
      slug,
      summary: summary || null,
      content: content || null,
      tags: tags.length > 0 ? tags : null,
      cover_url: cover_url || null,
      is_hidden,
    })
    .select()
    .single();

  if (error) {
    console.error("Create error:", error);
    throw new Error(`Failed to create project: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

// UPDATE with image
export async function updateProject(id: string, formData: FormData) {
  const supabase = await createServer();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  const title = formData.get("title") as string;
  const summary = formData.get("summary") as string;
  const content = formData.get("content") as string;
  const tagsInput = formData.get("tags") as string;
  const is_hidden = formData.get("is_hidden") === "on";
  const imageFile = formData.get("image") as File | null;
  const currentImageUrl = formData.get("currentImageUrl") as string | null;
  const removeImage = formData.get("removeImage") === "true";

  const tags = tagsInput
    ? tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  const slug = generateSlug(title);

  // Handle image updates
  let cover_url = currentImageUrl;

  // Remove old image if requested
  if (removeImage && currentImageUrl) {
    await deleteImage(currentImageUrl);
    cover_url = null;
  }

  // Upload new image if provided
  if (imageFile && imageFile.size > 0) {
    // Delete old image if exists
    if (currentImageUrl) {
      await deleteImage(currentImageUrl);
    }
    cover_url = await uploadImage(imageFile, slug);
  }

  const { error } = await supabase
    .from("projects")
    .update({
      title,
      slug,
      summary: summary || null,
      content: content || null,
      tags: tags.length > 0 ? tags : null,
      cover_url: cover_url || null,
      is_hidden,
    })
    .eq("id", id);

  if (error) {
    console.error("Update error:", error);
    throw new Error(`Failed to update project: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/project/${slug}`);
  redirect("/admin");
}

// DELETE
export async function deleteProject(id: string) {
  const supabase = await createServer();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  // Get project to delete associated image
  const { data: project } = await supabase
    .from("projects")
    .select("cover_url")
    .eq("id", id)
    .single();

  // Delete image if exists
  if (project?.cover_url) {
    await deleteImage(project.cover_url);
  }

  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    console.error("Delete error:", error);
    throw new Error(`Failed to delete project: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/admin");
}

// TOGGLE HIDDEN
export async function toggleHidden(id: string, currentState: boolean) {
  const supabase = await createServer();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("projects")
    .update({ is_hidden: !currentState })
    .eq("id", id);

  if (error) {
    console.error("Toggle hidden error:", error);
    throw new Error(`Failed to toggle visibility: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/admin");
}

// GET ALL (for admin)
export async function getAllProjects(): Promise<Project[]> {
  const supabase = await createServer();

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch error:", error);
    throw new Error(`Failed to fetch projects: ${error.message}`);
  }

  return data || [];
}

// GET ONE
export async function getProject(id: string): Promise<Project | null> {
  const supabase = await createServer();

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Fetch error:", error);
    return null;
  }

  return data;
}
