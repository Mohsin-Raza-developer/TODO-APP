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
    <header className="sticky top-0 z-50 border-b border-[color:var(--border)] bg-[color:var(--background)]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <Link href="/" className="flex items-center gap-3 group">
            <div>
              <h1 className="text-lg font-medium text-[color:var(--foreground)] tracking-tight">
                Check Mate
              </h1>
              <span className="block h-0.5 w-10 bg-gradient-to-r from-sky-500 via-teal-500 to-amber-400 rounded-full transition-all duration-300 group-hover:w-14" />
            </div>
            <p className="text-xs text-[color:var(--muted-2)] hidden sm:block">
              Focused task flow
            </p>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`relative text-sm font-medium transition-colors ${
                pathname === "/"
                  ? "text-[color:var(--accent)]"
                  : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
              }`}
            >
              Home
              {pathname === "/" && (
                <span className="absolute left-0 -bottom-2 h-0.5 w-full bg-[color:var(--accent)] rounded-full" />
              )}
            </Link>
            {session && (
              <>
                <Link
                  href="/dashboard"
                  className={`relative text-sm font-medium transition-colors ${
                    pathname === "/dashboard"
                      ? "text-[color:var(--accent)]"
                      : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
                  }`}
                >
                  Dashboard
                  {pathname === "/dashboard" && (
                    <span className="absolute left-0 -bottom-2 h-0.5 w-full bg-[color:var(--accent)] rounded-full" />
                  )}
                </Link>
              </>
            )}

            <div className="flex items-center gap-4">
              <span className="text-xs uppercase tracking-[0.25em] text-[color:var(--muted-2)]">
                Company
              </span>
              <Link
                href="/about"
                className={`relative text-sm font-medium transition-colors ${
                  pathname === "/about"
                    ? "text-[color:var(--accent)]"
                    : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
                }`}
              >
                About
                {pathname === "/about" && (
                  <span className="absolute left-0 -bottom-2 h-0.5 w-full bg-[color:var(--accent)] rounded-full" />
                )}
              </Link>
              <Link
                href="/careers"
                className={`relative text-sm font-medium transition-colors ${
                  pathname === "/careers"
                    ? "text-[color:var(--accent)]"
                    : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
                }`}
              >
                Careers
                {pathname === "/careers" && (
                  <span className="absolute left-0 -bottom-2 h-0.5 w-full bg-[color:var(--accent)] rounded-full" />
                )}
              </Link>
              <Link
                href="/privacy"
                className={`relative text-sm font-medium transition-colors ${
                  pathname === "/privacy"
                    ? "text-[color:var(--accent)]"
                    : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
                }`}
              >
                Privacy
                {pathname === "/privacy" && (
                  <span className="absolute left-0 -bottom-2 h-0.5 w-full bg-[color:var(--accent)] rounded-full" />
                )}
              </Link>
            </div>
          </nav>

          {/* Mobile Dashboard Center */}
          {!isPending && session && (
            <div className="md:hidden flex-1 flex justify-center">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium text-[color:var(--foreground)] bg-[color:var(--surface)] border border-[color:var(--border)] rounded-lg hover:bg-[color:var(--surface-2)] transition-colors"
              >
                Dashboard
              </Link>
            </div>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            <ThemeToggle />

            {!isPending && !session && (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-[color:var(--muted)] hover:text-[color:var(--foreground)] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-semibold text-white bg-[color:var(--accent)] rounded-xl hover:translate-y-[-1px] transition-all shadow-soft"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {!isPending && session && (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] hover:bg-[color:var(--surface-2)] transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-[color:var(--muted)] hidden sm:block">
                    {session.user.name || session.user.email}
                  </span>
                  <svg
                    className={`w-4 h-4 text-[color:var(--muted-2)] transition-transform ${
                      showDropdown ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-52 bg-[color:var(--surface)] rounded-xl shadow-soft border border-[color:var(--border)] py-1">
                    <div className="px-4 py-2 border-b border-[color:var(--border)]">
                      <p className="text-sm font-medium text-[color:var(--foreground)]">
                        {session.user.name || "User"}
                      </p>
                      <p className="text-xs text-[color:var(--muted-2)] truncate">
                        {session.user.email}
                      </p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setShowDropdown(false)}
                      className="block px-4 py-2 text-sm text-[color:var(--muted)] hover:bg-[color:var(--surface-2)] transition-colors"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-[color:var(--surface-2)] transition-colors"
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
