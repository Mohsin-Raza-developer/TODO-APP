/**
 * Floating Chat Modal Component
 * 
 * WhatsApp-style chat overlay that appears when floating button is clicked.
 * Features:
 * - Fixed position overlay on current page
 * - Slide-up animation
 * - Close button
 * - ChatKit integration with auth
 * - Thread persistence
 */

"use client";

import { ChatKit, useChatKit } from '@openai/chatkit-react';
import { useAuth } from '@/hooks/useAuth';
import { CHATKIT_CONFIG } from '@/lib/chatkit-config';
import { LockedChatPlaceholder } from '@/components/chat/LockedChatPlaceholder';
import { useEffect, useState, useMemo, useRef } from 'react';

interface FloatingChatModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function FloatingChatModal({ isOpen, onClose }: FloatingChatModalProps) {
    const { session } = useAuth();
    const [initialThreadId, setInitialThreadId] = useState<string | undefined>(undefined);
    const [uiError, setUiError] = useState<string | null>(null);

    // Load last thread ID from localStorage on component mount ONCE
    useEffect(() => {
        if (!session?.user?.id) return;

        const threadStorageKey = `chatThreadId_${session.user.id}`;
        const savedThreadId = localStorage.getItem(threadStorageKey);

        if (savedThreadId) {
            setInitialThreadId(savedThreadId);
        }
    }, [session?.user?.id]);

    // Use refs for all dynamic values to avoid re-creating config
    const threadIdRef = useRef<string | null>(null);
    const tokenRef = useRef(session?.session?.token);
    const userIdRef = useRef(session?.user?.id);

    // Initialize threadIdRef with saved value
    useEffect(() => {
        if (initialThreadId) {
            threadIdRef.current = initialThreadId;
        }
    }, [initialThreadId]);

    // Update refs when session changes
    useEffect(() => {
        tokenRef.current = session?.session?.token;
        userIdRef.current = session?.user?.id;
    }, [session?.session?.token, session?.user?.id]);

    // Memoize ChatKit config - STABLE (only recreate on initial mount)
    const chatkitConfig = useMemo(() => {
        return {
        ...CHATKIT_CONFIG,
        // Note: Do not pass threadId into ChatKit options (not supported in current web component)
        api: {
            ...CHATKIT_CONFIG.api,
            fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
                const token = tokenRef.current;

                if (!token) {
                    throw new Error('Authentication required');
                }

                // Interceptor: Inject threadId if missing
                let modifiedInit = { ...init };
                if (init?.body && typeof init.body === 'string') {
                    try {
                        const body = JSON.parse(init.body);

                        // If sending a message and threadId is missing but we know it
                        const isMessageOrRun =
                            body.type === 'threads.add_user_message' ||
                            body.type === 'threads.addUserMessage' ||
                            body.type === 'threads.run';
                        const hasThreadId =
                            body.threadId ||
                            body.thread_id ||
                            body.params?.threadId ||
                            body.params?.thread_id;

                        if (isMessageOrRun && !hasThreadId && threadIdRef.current) {
                            if (!body.params) body.params = {};
                            // Populate both shapes to be safe; backend should ignore extras.
                            body.threadId = threadIdRef.current;
                            body.thread_id = threadIdRef.current;
                            body.params.threadId = body.params.threadId ?? threadIdRef.current;
                            body.params.thread_id = body.params.thread_id ?? threadIdRef.current;
                            modifiedInit.body = JSON.stringify(body);
                        }
                    } catch (e) {
                        // ignore parse error
                    }
                }

                const response = await fetch(input, {
                    ...modifiedInit,
                    headers: {
                        ...(modifiedInit?.headers || {}),
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });
                if (!response.ok) {
                    try {
                        const data = await response.clone().json();
                        const msg = String(data?.message || data?.error || '').toLowerCase();
                        const isQuota =
                            msg.includes('quota') ||
                            msg.includes('rate limit') ||
                            response.status === 429;
                        if (isQuota) {
                            setUiError('AI quota exceeded. Please try again in a minute.');
                        }
                    } catch {
                        // ignore parse errors
                    }
                }
                return response;
            },
        },
        onError: ({ error }: { error: Error }) => {
            const rawMessage = error?.message || '';
            const lower = rawMessage.toLowerCase();
            const isQuota =
                lower.includes('quota') ||
                lower.includes('rate limit') ||
                lower.includes('too many requests') ||
                lower.includes('429');
            // Only show a banner for quota/rate-limit errors; ignore others.
            if (isQuota) {
                setUiError('AI quota exceeded. Please try again in a minute.');
            }
        },
        onThreadChange: ({ threadId }: { threadId: string | null }) => {

            // ✅ ONLY update ref and localStorage (DO NOT update state)
            if (threadId) {
                threadIdRef.current = threadId;

                // Persist to localStorage
                if (userIdRef.current) {
                    const threadStorageKey = `chatThreadId_${userIdRef.current}`;
                    localStorage.setItem(threadStorageKey, threadId);
                }
            }
        },
    };
    }, [initialThreadId]); // ✅ Only depend on initialThreadId (set once on mount)

    const { control } = useChatKit(chatkitConfig);

    useEffect(() => {
        if (isOpen) {
            setUiError(null);
        }
    }, [isOpen]);

    return (
        <div className={`fixed inset-0 z-40 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none invisible'}`}>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* Chat Modal */}
            <div className={`fixed bottom-0 right-0 md:bottom-6 md:right-6 w-full md:w-[360px] h-[85vh] md:h-[520px] bg-white dark:bg-gray-900 rounded-t-2xl md:rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-[calc(100%+24px)]'}`}>
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white rounded-t-2xl md:rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold">AI Assistant</h3>
                            <p className="text-xs text-white/80">Task Management Bot</p>
                        </div>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                        aria-label="Close chat"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Error Banner */}
                {uiError && (
                    <div className="px-4 py-2 text-sm bg-red-50 text-red-700 border-b border-red-200">
                        {uiError}
                    </div>
                )}

                {/* Chat Content */}
                <div className="flex-1 overflow-hidden">
                    {session?.user?.id ? (
                        <ChatKit
                            control={control}
                            className="w-full h-full"
                        />
                    ) : (
                        <LockedChatPlaceholder />
                    )}
                </div>

                {/* Footer (optional) */}
                {initialThreadId && (
                    <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 text-center border-t border-gray-200 dark:border-gray-700">
                        Todo Agent can make mistakes.
                    </div>
                )}
            </div>
        </div>
    );
}
