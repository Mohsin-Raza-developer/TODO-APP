# Research: ChatKit React Integration

**Date**: 2026-02-05  
**Feature**: 007-chatbot-frontend  
**Purpose**: Document research findings for ChatKit React integration with Better Auth

## Decision: Use @openai/chatkit-react

**Rationale**:
- Official OpenAI library with React hooks (`useChatKit`)
- Built-in TypeScript support
- Streaming response support (matches backend capability)
- Customizable UI via themes and CSS
- Well-documented API with active community

**Alternatives Considered**:
1. **Custom WebSocket implementation**: Rejected - reinventing the wheel, complex state management
2. **Stream Chat React**: Rejected - different protocol, requires separate backend integration
3. **Build from scratch with fetch**: Rejected - loses streaming, error handling, state management benefits

---

## Authentication Integration Pattern

**Decision**: Use custom `fetch` callback in ChatKit config

**Implementation**:
```typescript
const { control } = useChatKit({
  api: {
    url: '/api/chatkit',
    fetch: async (url, options) => {
      const token = session?.session.token;  // Better Auth JWT
      
      return fetch(url, {
        ...options,
        headers: {
          ...(options?.headers || {}),
          'Authorization': `Bearer ${token}`,
        },
      });
    },
  },
});
```

**Rationale**:
- ChatKit provides `fetch` override specifically for auth injection
- Preserves all ChatKit features (streaming, retry logic, error handling)
- JWT token automatically included in every request
- No modification to ChatKit internals required

**Source**: Context7 documentation - `/openai/chatkit-js` examples

---

## API Proxy Strategy

**Decision**: Next.js API Route (`/api/chatkit/route.ts`)

**Rationale**:
- Server-side authentication verification before proxying
- Hides chatbot backend URL from client (security)
- Centralized token injection point
- Can add rate limiting / logging easily
- Supports Server-Sent Events (SSE) for streaming

**Alternative Rejected**: Direct client→backend requests
- Exposes backend URL to client
- CORS complexity
- Cannot verify auth server-side
- Harder to add middleware (logging, rate limiting)

---

## Theme Configuration

**Decision**: Dark mode theme matching existing app

```typescript
theme: {
  colorScheme: 'dark' as const,
}
```

**Rationale**:
- Existing app uses dark mode (Tailwind dark: classes)
- Consistent user experience
- ChatKit supports theme customization
- Can be extended later for light mode toggle

---

## Locked UI Approach

**Decision**: Server-side auth check with conditional client component rendering

**Pattern** (from dashboard page):
```typescript
// Server Component (page.tsx)
const session = await auth.api.getSession({ headers: await headers() });
const isAuthenticated = !!session;

return isAuthenticated ? \u003cChatInterface /\u003e : \u003cLockedChatPlaceholder /\u003e;
```

**Rationale**:
- Server-side check prevents flash of chat UI for unauthenticated users
- Better Auth pattern already established in `/dashboard` page
- SEO friendly (server-rendered placeholder)
- TypeScript-safe (session type checking)

---

## Best Practices Applied

### 1. Error Handling
- ChatKit has built-in `onError` callback
- Display user-friendly messages for common errors (network, auth)
- Graceful degradation when backend unavailable

### 2. Performance
- Lazy load ChatKit components (Next.js automatic code splitting)
- SSE streaming for real-time responses
- Client-side caching of conversation history

### 3. Security
- JWT token never exposed to client console
- Server-side auth verification before proxy
- HTTPS in production (existing setup)

### 4. Accessibility
- ChatKit has built-in keyboard navigation
- Focus management for message composer
- ARIA labels (ChatKit default)

---

## Dependencies

### Production
- `@openai/chatkit-react`: ^latest (exact version TBD from npm)

### Development
- None (TypeScript types included in package)

---

## Integration Checklist

- [x] Research ChatKit API and hooks
- [x] Identify authentication pattern
- [x] Design API proxy architecture
- [x] Plan locked UI for unauthenticated users
- [x] Theme configuration strategy
- [ ] Implement (Phase 1)
- [ ] Manual testing (Verification)
- [ ] Documentation (quickstart.md)

---

## References

- ChatKit JS Documentation: https://github.com/openai/chatkit-js
- Context7 Research: `/openai/chatkit-js` library
- Better Auth Patterns: `frontend/app/dashboard/page.tsx`
- Existing Frontend Structure: `frontend/` directory analysis
