"use client";

import { useState, useTransition } from "react";
import ImageUpload from "@/app/admin/ImageUpload";
import { createProjectWithImage } from "@/app/actions/projects";

export default function NewProjectPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    setError(null);

    // Add image file to formData if selected
    if (selectedImage) {
      formData.set("image", selectedImage);
    }

    startTransition(async () => {
      try {
        await createProjectWithImage(formData);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    });
  };

  return (
    <div className="px-4 sm:px-0">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
        Create New Project
      </h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <form
        action={handleSubmit}
        className="bg-white dark:bg-zinc-900 shadow-sm rounded-lg p-6 space-y-6"
      >
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Title *
          </label>
          <input
            type="text"
            name="title"
            id="title"
            required
            disabled={isPending}
            className="mt-1 block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
          />
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            The slug will be auto-generated from the title
          </p>
        </div>

        <div>
          <label
            htmlFor="summary"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Summary
          </label>
          <textarea
            name="summary"
            id="summary"
            rows={3}
            disabled={isPending}
            className="mt-1 block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Content
          </label>
          <textarea
            name="content"
            id="content"
            rows={10}
            disabled={isPending}
            className="mt-1 block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label
            htmlFor="tags"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Tags
          </label>
          <input
            type="text"
            name="tags"
            id="tags"
            placeholder="React, Next.js, TypeScript"
            disabled={isPending}
            className="mt-1 block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
          />
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Comma-separated list
          </p>
        </div>

        <ImageUpload onImageChange={setSelectedImage} />

        <div className="flex items-center">
          <input
            type="checkbox"
            name="is_hidden"
            id="is_hidden"
            disabled={isPending}
            className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
          />
          <label
            htmlFor="is_hidden"
            className="ml-2 block text-sm text-zinc-700 dark:text-zinc-300"
          >
            Hide from public view
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Creating..." : "Create Project"}
          </button>
          <a
            href="/admin"
            className="inline-flex justify-center rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
