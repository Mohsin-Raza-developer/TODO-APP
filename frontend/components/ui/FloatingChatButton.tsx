/**
 * Floating Chat Button Component
 * 
 * WhatsApp-style floating action button for accessing chat.
 * Features:
 * - Fixed position at bottom-right corner
 * - Premium Gradient Background
 * - AI Sparkles Icon
 * - Smooth hover animations
 * - Opens chat modal overlay on click
 * - Shows for all users (locked UI shown for guests)
 * - Hides when chat is open
 */

"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { FloatingChatModal } from '@/components/chat/FloatingChatModal';

export function FloatingChatButton() {
    const { session, isLoading } = useAuth();
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Avoid flicker while auth is resolving
    if (isLoading) {
        return null;
    }

    return (
        <>
            {/* Floating Chat Button - Hidden when chat is open */}
            <button
                onClick={() => setIsChatOpen(true)}
                className={`fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16
                    rounded-full text-white transition-all duration-300 hover:scale-110 group
                    bg-gradient-to-br from-sky-500 via-teal-500 to-amber-400
                    shadow-soft ring-glow
                    ${isChatOpen ? "opacity-0 pointer-events-none scale-0" : "opacity-100 scale-100"}`}
                aria-label="Open Chat"
            >
                <span className="absolute inset-0 rounded-full border border-white/20" />

                {/* Notification ping */}
                <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400/70" />
                    <span className="absolute inline-flex h-6 w-6 -top-1 -left-1 rounded-full bg-emerald-400/20 blur-md animate-pulse" />
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-400 border-2 border-white shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                </span>

                {/* Chat Spark Icon */}
                <svg
                    className="relative w-7 h-7 sm:w-8 sm:h-8 drop-shadow-sm"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h7a4 4 0 010 8H10l-3 3v-3H7a4 4 0 010-8z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16.5 4.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16.5 12.5l.45 1.1 1.1.45-1.1.45-.45 1.1-.45-1.1-1.1-.45 1.1-.45.45-1.1z"
                    />
                </svg>

                {/* Tooltip on hover */}
                <span className="absolute bottom-full right-0 mb-3 px-4 py-2 bg-[color:var(--surface)] text-[color:var(--foreground)] text-sm font-medium rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-soft border border-[color:var(--border)] transform translate-y-2 group-hover:translate-y-0 duration-200">
                    Ask AI Assistant
                </span>
            </button>

            {/* Chat Modal */}
            <FloatingChatModal
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
            />
        </>
    );
}
