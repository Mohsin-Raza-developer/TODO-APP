/**
 * Locked Chat Placeholder Component
 * 
 * Displays a locked UI with sign-in prompt for unauthenticated users.
 * Shows lock icon and redirects to login page when user clicks sign-in.
 */

"use client";

import { useRouter } from 'next/navigation';

interface LockedChatPlaceholderProps {
    mode?: 'unauthenticated' | 'unverified';
    onVerifyEmail?: () => void;
}

export function LockedChatPlaceholder({
    mode = 'unauthenticated',
    onVerifyEmail,
}: LockedChatPlaceholderProps) {
    const router = useRouter();

    const handleSignIn = () => {
        router.push('/login?redirect=/chat');
    };

    const handleVerifyEmail = () => {
        if (onVerifyEmail) {
            onVerifyEmail();
            return;
        }
        router.push('/verify-email?redirect=/dashboard');
    };

    const isUnverifiedMode = mode === 'unverified';

    return (
        <div className="flex flex-col items-center justify-center min-h-[560px] bg-[color:var(--surface)] rounded-3xl border border-[color:var(--border)] p-10 shadow-soft">
            <div className="text-center space-y-6 max-w-md">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 via-teal-500 to-amber-400 flex items-center justify-center shadow-soft">
                    <svg
                        className="w-8 h-8 text-white"
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
                </div>

                <h2 className="text-3xl font-semibold text-[color:var(--foreground)]">
                    {isUnverifiedMode ? 'Verify Email to Chat' : 'Sign in to Chat'}
                </h2>

                <p className="text-base text-[color:var(--muted)]">
                    {isUnverifiedMode
                        ? 'Your account is logged in but email verification is required before chat access.'
                        : 'Unlock the AI assistant to summarize tasks, answer questions, and keep your workflow moving.'}
                </p>

                <div className="flex flex-col gap-3">
                    {isUnverifiedMode ? (
                        <button
                            onClick={handleVerifyEmail}
                            className="w-full px-8 py-4 bg-[color:var(--accent)] hover:translate-y-[-1px] text-white font-semibold rounded-xl shadow-soft transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] focus:ring-offset-2 focus:ring-offset-[color:var(--background)]"
                            aria-label="Verify email to access chat"
                        >
                            Verify Email
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handleSignIn}
                                className="w-full px-8 py-4 bg-[color:var(--accent)] hover:translate-y-[-1px] text-white font-semibold rounded-xl shadow-soft transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] focus:ring-offset-2 focus:ring-offset-[color:var(--background)]"
                                aria-label="Sign in to access chat"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => router.push('/signup?redirect=/chat')}
                                className="w-full px-8 py-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] text-[color:var(--foreground)] font-semibold hover:bg-[color:var(--surface)] transition-colors"
                            >
                                Create an account
                            </button>
                        </>
                    )}
                </div>

                <p className="text-xs text-[color:var(--muted-2)]">
                    {isUnverifiedMode
                        ? 'After verification, chat access will unlock automatically.'
                        : 'Already have access? Sign in to continue.'}
                </p>
            </div>
        </div>
    );
}
