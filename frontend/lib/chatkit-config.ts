/**
 * ChatKit Configuration
 * 
 * Central configuration for OpenAI ChatKit React integration
 * with Better Auth authentication
 */

export const CHATKIT_CONFIG = {
    api: {
        url: '/api/chatkit',  // Proxy to chatbot backend
        domainKey: 'local-dev', // Req. for OpenAI domain verification
    },
    theme: 'dark',  // Use string instead of object for theme
    locale: 'en',
} as const;

export type ChatKitConfig = typeof CHATKIT_CONFIG;
