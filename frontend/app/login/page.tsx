/**
 * Login Page
 *
 * Public authentication page for existing users
 *
 * Features:
 * - LoginForm component with email/password
 * - Remember me checkbox (7 days session)
 * - Link to signup page for new users
 * - Responsive layout with dark mode support
 * - Redirect to dashboard on successful login (handled by useAuth)
 *
 * Route: /login
 * Access: Public (unauthenticated users only, should redirect if already logged in)
 */

import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Check Mate",
  description: "Login to your account",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Welcome Back
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Sign in to access your todos
            </p>
          </div>

          {/* Login Form Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <LoginForm />

            {/* Divider */}
            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  New to Todo App?
                </span>
              </div>
            </div>

            {/* Signup Link */}
            <div className="mt-6 text-center">
              <Link
                href="/signup"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Create an account
              </Link>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
