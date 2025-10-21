import Link from "next/link";
import { requireAuth } from "@/lib/supabase/auth";
import { logout } from "@/app/actions/auth";
import MobileNav from "./MobileNav";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // This will redirect to /login if not authenticated
  const user = await requireAuth();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <nav className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Title and Desktop navigation */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mr-8">
                My Portfolio
              </h1>

              {/* Desktop navigation */}
              <div className="hidden md:flex space-x-8">
                <Link
                  href="/"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100"
                >
                  ← Public View
                </Link>
                <Link
                  href="/admin"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  All Projects
                </Link>
                <Link
                  href="/admin/projects/new"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  + New Project
                </Link>
              </div>
            </div>

            {/* Right side - User info and Mobile menu */}
            <div className="flex items-center space-x-4">
              {/* User info and logout - desktop */}
              <div className="hidden md:flex items-center space-x-4">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {user.email}
                </span>
                <form action={logout}>
                  <button
                    type="submit"
                    className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    Logout
                  </button>
                </form>
              </div>

              {/* Mobile menu button */}
              <MobileNav />
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
