import Link from "next/link";
import DeleteButton from "@/app/admin/DeleteButton";
import {
  getAllProjects,
  deleteProject,
  toggleHidden,
} from "@/app/actions/projects";
import { Project } from "@/lib/types";

export default async function AdminPage() {
  const projects: Project[] = await getAllProjects();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Manage Projects
        </h1>
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <svg
            className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
            No projects
          </h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Get started by creating your first project.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-4 sm:p-6">
                {/* Project header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {project.title}
                      </h3>
                      {project.is_hidden && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          Hidden
                        </span>
                      )}
                    </div>
                    {project.summary && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-2">
                        {project.summary}
                      </p>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="font-mono">Slug: {project.slug}</span>
                      {project.tags && project.tags.length > 0 && (
                        <span className="hidden sm:inline">•</span>
                      )}
                      {project.tags && project.tags.length > 0 && (
                        <span>Tags: {project.tags.join(", ")}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <div className="flex gap-2">
                    <form
                      action={toggleHidden.bind(
                        null,
                        project.id,
                        project.is_hidden
                      )}
                      className="flex-1 sm:flex-none"
                    >
                      <button
                        type="submit"
                        className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 text-sm font-medium border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        {project.is_hidden ? "Show" : "Hide"}
                      </button>
                    </form>
                    <Link
                      href={`/admin/projects/${project.id}/edit`}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-2 text-sm font-medium border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Edit
                    </Link>
                  </div>
                  <form
                    action={deleteProject.bind(null, project.id)}
                    className="flex-1 sm:flex-none"
                  >
                    <DeleteButton label="Delete" />
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
