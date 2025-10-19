import { createServer } from "./server";
import { redirect } from "next/navigation";

/**
 * Require authentication for a page
 * Redirects to /login if user is not authenticated
 */
export async function requireAuth() {
  const supabase = await createServer();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return user;
}

/**
 * Get the current user (nullable)
 */
export async function getUser() {
  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return !!user;
}
