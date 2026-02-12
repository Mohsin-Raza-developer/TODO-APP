"use client";

import { useEffect } from "react";

interface EmailVerifiedRedirectCardProps {
  redirectPath: string;
}

export function EmailVerifiedRedirectCard({
  redirectPath,
}: EmailVerifiedRedirectCardProps) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.location.href = redirectPath;
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [redirectPath]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 space-y-4 text-center">
      <div className="mx-auto w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
        <svg
          className="w-7 h-7 text-green-600 dark:text-green-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Email verification successful
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Your account is verified. Redirecting you to dashboard...
      </p>

      <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300">
        <svg
          className="w-4 h-4 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
        <span>Please wait...</span>
      </div>
    </div>
  );
}
