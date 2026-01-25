/**
 * Signup Page
 *
 * Public registration page for new users
 *
 * Features:
 * - SignupForm component with email/password/name
 * - Password strength requirement (min 8 characters)
 * - Password confirmation validation
 * - Link to login page for existing users
 * - Responsive layout with dark mode support
 * - Redirect to dashboard on successful registration (handled by useAuth)
 *
 * Route: /signup
 * Access: Public (unauthenticated users only)
 */

import Link from "next/link";
import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/SignupForm";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Sign Up - Check Mate",
  description: "Create a new account",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Get Started
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Create your account to start managing todos
            </p>
          </div>

          {/* Signup Form Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <SignupForm />

            {/* Divider */}
            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Already have an account?
                </span>
              </div>
            </div>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Sign in instead
              </Link>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            By creating an account, you agree to our Terms of Service and Privacy
            Policy
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
