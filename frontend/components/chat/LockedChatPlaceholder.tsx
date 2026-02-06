/**
 * Locked Chat Placeholder Component
 * 
 * Displays a locked UI with sign-in prompt for unauthenticated users.
 * Shows lock icon and redirects to login page when user clicks sign-in.
 */

"use client";

import { useRouter } from 'next/navigation';

export function LockedChatPlaceholder() {
    const router = useRouter();

    const handleSignIn = () => {
        router.push('/login?redirect=/chat');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[600px] bg-gray-100 dark:bg-gray-800 rounded-lg p-8 shadow-lg">
            <div className="text-center space-y-6 max-w-md">
                {/* Lock Icon SVG */}
                <svg
                    className="w-20 h-20 mx-auto text-gray-400 dark:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                </svg>

                {/* Heading */}
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                    Sign in to Chat
                </h2>

                {/* Description */}
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    Please sign in to access the AI chatbot and manage your tasks through conversation.
                </p>

                {/* Sign In Button */}
                <button
                    onClick={handleSignIn}
                    className="w-full px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    aria-label="Sign in to access chat"
                >
                    Sign In
                </button>

                {/* Additional Info */}
                <p className="text-sm text-gray-500 dark:text-gray-500">
                    Don't have an account?{' '}
                    <button
                        onClick={() => router.push('/signup?redirect=/chat')}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium underline"
                    >
                        Sign up here
                    </button>
                </p>
            </div>
        </div>
    );
}
