/**
 * Floating Chat Button Component
 * 
 * WhatsApp-style floating action button for accessing chat.
 * Features:
 * - Fixed position at bottom-right corner
 * - Circular button with chat icon
 * - Smooth hover animations
 * - Opens chat modal overlay on click
 * - Shows for all users (locked UI shown for guests)
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
            <button
                onClick={() => setIsChatOpen(true)}
                className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
                aria-label="Open Chat"
            >
                {/* Chat Icon SVG */}
                <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                </svg>

                {/* Tooltip on hover */}
                <span className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Open AI Chat
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
