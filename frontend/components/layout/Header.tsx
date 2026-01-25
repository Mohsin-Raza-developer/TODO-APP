/**
 * Header Component
 *
 * Main navigation header for the application
 *
 * Features:
 * - Logo and app title
 * - Theme toggle button
 * - Sign out button (when authenticated)
 * - Responsive design
 *
 * Usage:
 * ```tsx
 * <Header />
 * ```
 */

"use client";

import { authClient } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { success } = useToast();
  const { data: session, isPending } = authClient.useSession();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSignOut = async () => {
    await authClient.signOut();
    success("Signed out successfully");
    router.push("/login");
    setShowDropdown(false);
  };

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            {/* Light Mode Logo */}
            <Image
              src="/logo-light.png"
              alt="Check Mate Logo"
              width={80}
              height={80}
              className="block dark:hidden w-20 h-20 object-contain"
            />
            {/* Dark Mode Logo */}
            <Image
              src="/logo-dark.png"
              alt="Check Mate Logo"
              width={80}
              height={80}
              className="hidden dark:block w-20 h-20 object-contain"
            />
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 -ml-3">
              Check Mate
            </h1>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${pathname === "/"
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
            >
              Home
            </Link>
            {session && (
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors ${pathname === "/dashboard"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                  }`}
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            <ThemeToggle />

            {!isPending && !session && (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {!isPending && session && (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
                    {session.user.name || session.user.email}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${showDropdown ? "rotate-180" : ""
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {session.user.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {session.user.email}
                      </p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setShowDropdown(false)}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
