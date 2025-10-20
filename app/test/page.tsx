import { createServer } from "@/lib/supabase/server";
import { Project } from "@/lib/types";
import { PostgrestError } from "@supabase/supabase-js";

export default async function TestPage() {
  const supabase = await createServer();

  // Test 1: Check connection
  const { data: connectionTest, error: connectionError } = await supabase
    .from("projects")
    .select("count");

  // Test 2: Get all projects
  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("*")
    .returns<Project[]>();

  // Test 3: Check environment variables
  const envCheck = {
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    urlStart: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20),
  };

  // Test 4: Check storage bucket availability
  const bucketName = "project-images";

  // Check if bucket exists
  const { data: buckets, error: bucketsError } =
    await supabase.storage.listBuckets();

  // Test bucket permissions by trying to list files (this will work even if listBuckets fails)
  const { data: files, error: filesError } = await supabase.storage
    .from(bucketName)
    .list("", { limit: 100 }); // Show up to 100 files

  // Check if our specific bucket exists - use alternative method if listBuckets fails
  const bucketExists =
    buckets?.some((bucket) => bucket.name === bucketName) || false;

  // Alternative check: if we can list files, the bucket exists
  const bucketExistsAlternative = !filesError;

  // Test upload permissions with a small test file
  const testFileName = `test-${Date.now()}.txt`;
  const testFile = new File(["test content"], testFileName, {
    type: "text/plain",
  });

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(`test/${testFileName}`, testFile, {
      cacheControl: "3600",
      upsert: false,
    });

  // Clean up test file if upload was successful
  if (uploadData && !uploadError) {
    await supabase.storage.from(bucketName).remove([`test/${testFileName}`]);
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Supabase Connection & Storage Test
      </h1>

      <div className="space-y-6">
        {/* Environment Check */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <pre className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded overflow-auto">
            {JSON.stringify(envCheck, null, 2)}
          </pre>
        </div>

        {/* Connection Test */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Database Connection Test
          </h2>
          {connectionError ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-4">
              <p className="text-red-800 dark:text-red-200 font-semibold">
                Connection Error:
              </p>
              <pre className="text-sm mt-2 text-red-600 dark:text-red-300">
                {JSON.stringify(connectionError, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-4">
              <p className="text-green-800 dark:text-green-200">
                ✓ Database connection successful
              </p>
              <pre className="text-sm mt-2">
                {JSON.stringify(connectionTest, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Storage Bucket Tests */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Storage Bucket Tests</h2>

          {/* Bucket Existence Check */}
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Bucket Existence</h3>
            {bucketsError ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3">
                <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
                  ⚠ Could not list buckets (API limitation):
                </p>
                <pre className="text-sm mt-1 text-yellow-600 dark:text-yellow-300">
                  {JSON.stringify(bucketsError, null, 2)}
                </pre>
                <p className="text-sm mt-2">
                  Using alternative method to check bucket existence...
                </p>
              </div>
            ) : bucketExists ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3">
                <p className="text-green-800 dark:text-green-200">
                  ✓ Bucket "{bucketName}" exists (confirmed via listBuckets)
                </p>
              </div>
            ) : bucketExistsAlternative ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3">
                <p className="text-green-800 dark:text-green-200">
                  ✓ Bucket "{bucketName}" exists (confirmed via file listing)
                </p>
                <p className="text-sm mt-1 text-green-600 dark:text-green-300">
                  Note: listBuckets API may not be available, but bucket is
                  accessible
                </p>
              </div>
            ) : (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
                <p className="text-red-800 dark:text-red-200">
                  ❌ Bucket "{bucketName}" not found or not accessible
                </p>
                <p className="text-sm mt-1">Available buckets:</p>
                <pre className="text-sm mt-1">
                  {JSON.stringify(
                    buckets?.map((b) => b.name),
                    null,
                    2
                  )}
                </pre>
              </div>
            )}
          </div>

          {/* Bucket List Permissions */}
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">List Files Permission</h3>
            {filesError ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
                <p className="text-red-800 dark:text-red-200 font-semibold">
                  Error listing files:
                </p>
                <pre className="text-sm mt-1 text-red-600 dark:text-red-300">
                  {JSON.stringify(filesError, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3">
                <p className="text-green-800 dark:text-green-200">
                  ✓ Can list files in bucket
                </p>
                <p className="text-sm mt-1">Found {files?.length || 0} files</p>
                {files && files.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Files in bucket:</p>
                    <ul className="text-sm mt-1 space-y-1">
                      {files.map((file, index) => (
                        <li key={index} className="font-mono text-xs">
                          • {file.name} (
                          {file.metadata?.size
                            ? `${Math.round(file.metadata.size / 1024)}KB`
                            : "unknown size"}
                          )
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Upload Permission Test */}
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Upload Permission</h3>
            {uploadError ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
                <p className="text-red-800 dark:text-red-200 font-semibold">
                  Upload test failed:
                </p>
                <pre className="text-sm mt-1 text-red-600 dark:text-red-300">
                  {JSON.stringify(uploadError, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3">
                <p className="text-green-800 dark:text-green-200">
                  ✓ Can upload files to bucket
                </p>
                <p className="text-sm mt-1">
                  Test file uploaded and cleaned up successfully
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Projects Data */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Projects Data ({projects?.length || 0})
          </h2>
          {projectsError ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-4">
              <p className="text-red-800 dark:text-red-200 font-semibold">
                Error fetching projects:
              </p>
              <pre className="text-sm mt-2 text-red-600 dark:text-red-300 overflow-auto">
                {JSON.stringify(projectsError, null, 2)}
              </pre>
            </div>
          ) : (
            <pre className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(projects, null, 2)}
            </pre>
          )}
        </div>
      </div>

      <div className="mt-6">
        <a
          href="/admin"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Admin
        </a>
      </div>
    </div>
  );
}
