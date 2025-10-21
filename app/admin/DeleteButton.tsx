"use client";

type DeleteButtonProps = {
  label?: string;
};

export default function DeleteButton({ label = "Delete" }: DeleteButtonProps) {
  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    const confirmed = confirm("Are you sure you want to delete this project?");
    if (!confirmed) {
      e.preventDefault();
    }
  }

  return (
    <button
      type="submit"
      onClick={handleClick}
      className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 text-sm font-medium border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
    >
      {label}
    </button>
  );
}
