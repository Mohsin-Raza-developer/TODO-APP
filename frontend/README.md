# Todo Web Application - Frontend

Next.js 16 frontend with Better Auth authentication for the todo application.

## Quick Start

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+ / yarn 1.22+ / pnpm 8+
- PostgreSQL (Neon or local) with database credentials
- FastAPI backend running at `http://localhost:8000`

**Verify Prerequisites**:
```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

### Installation

```bash
# Install dependencies
npm install

# OR
yarn install

# OR
pnpm install
```

### Environment Configuration

Create a `.env.local` file in the `frontend/` directory:

```bash
# Better Auth Secret (generate with: openssl rand -base64 32)
# MUST match backend's BETTER_AUTH_SECRET
BETTER_AUTH_SECRET=your-secret-key-here

# Database URL for Better Auth (PostgreSQL connection string)
DATABASE_URL=postgresql://user:password@host.neon.tech/todoapp?sslmode=require

# FastAPI Backend URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional: Session settings
BETTER_AUTH_SESSION_MAX_AGE=604800  # 7 days in seconds
BETTER_AUTH_SESSION_UPDATE_AGE=86400  # Refresh session every 24 hours

# Optional: Feature flags
NEXT_PUBLIC_DEV_MODE=true
NEXT_PUBLIC_API_DEBUG=false
```

**Critical Configuration Notes**:

1. **BETTER_AUTH_SECRET**: MUST be identical to the backend's `BETTER_AUTH_SECRET` in `backend/.env`. This ensures JWT tokens can be verified by both frontend and backend.

2. **DATABASE_URL**: Can point to the same Neon database as backend or a separate auth database (recommended for production).

3. **NEXT_PUBLIC_* Variables**: Exposed to browser (safe for public URLs only, no secrets!)

### Start Development Server

```bash
# Start Next.js dev server
npm run dev

# OR
yarn dev

# OR
pnpm dev
```

**Expected Output**:
```
 ▲ Next.js 16.1.2
 - Local:        http://localhost:3000
 - Network:      http://192.168.1.100:3000

 ✓ Ready in 2.3s
```

**Open in Browser**: `http://localhost:3000`

### Verify Backend Connection

Ensure the FastAPI backend is running:

```bash
# In a separate terminal, navigate to backend directory
cd ../backend

# Start FastAPI backend
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**Verify Backend**:
```bash
# Test health check
curl http://localhost:8000/

# Expected response:
# {"message": "Todo API is running", "version": "1.0.0"}
```

**Swagger UI**: Open `http://localhost:8000/docs` to test backend endpoints.

## Project Structure

```
frontend/
├── app/                      # Next.js App Router (pages, layouts)
│   ├── layout.tsx            # Root layout with providers
│   ├── page.tsx              # Landing page (/)
│   ├── globals.css           # Global styles and Tailwind config
│   └── api/
│       └── auth/
│           └── [...all]/
│               └── route.ts  # Better Auth API handler (to be added)
│
├── components/               # React components
│   ├── ui/                   # Reusable UI components (Button, Input, etc.)
│   ├── auth/                 # Auth-related components (LoginForm, SignupForm)
│   ├── tasks/                # Task components (TaskList, TaskItem, TaskForm)
│   └── layout/               # Layout components (Header, Footer)
│
├── lib/                      # Utility libraries
│   ├── auth.ts               # Better Auth client configuration
│   ├── api-client.ts         # API client for backend communication
│   ├── error-handler.ts      # Centralized error handling
│   └── utils.ts              # Utility functions
│
├── contexts/                 # React Context providers
│   ├── ThemeContext.tsx      # Dark/light mode state
│   └── ToastContext.tsx      # Toast notification state
│
├── hooks/                    # Custom React hooks
│   ├── useAuth.ts            # Authentication hook
│   ├── useTasks.ts           # Task CRUD operations hook
│   └── useToast.ts           # Toast notification hook
│
├── types/                    # TypeScript type definitions
│   ├── user.ts               # User and auth types
│   ├── task.ts               # Task types
│   └── api.ts                # API request/response types
│
├── .env.local                # Environment variables (gitignored)
├── next.config.js            # Next.js configuration
├── eslint.config.mjs         # ESLint configuration (flat config)
├── .prettierrc               # Prettier configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies and scripts
```

## Development Workflow

### Feature Development Process

```bash
# 1. Ensure on feature branch
git checkout 004-frontend-nextjs-better-auth

# 2. Pull latest changes
git pull origin 004-frontend-nextjs-better-auth

# 3. Implement the feature (code, test, document)

# 4. Test locally
npm run dev

# 5. Run type checks
npm run type-check

# 6. Run linter
npm run lint

# 7. Test production build
npm run build

# 8. Commit changes
git add .
git commit -m "feat: implement feature

🤖 Generated with Claude Code"
```

### Testing

**Manual Testing**:
```bash
# Start dev server
npm run dev

# Open browser to test flows:
# 1. http://localhost:3000 (landing page)
# 2. http://localhost:3000/signup (create account)
# 3. http://localhost:3000/login (sign in)
# 4. http://localhost:3000/dashboard (view tasks)
# 5. Test CRUD operations (create, update, delete, toggle tasks)
# 6. Toggle dark/light mode
```

**Type Checking**:
```bash
npm run type-check
```

**Linting**:
```bash
# Run ESLint
npm run lint

# Auto-fix issues
npm run lint:fix
```

**Build Test**:
```bash
# Test production build
npm run build
```

## Troubleshooting

### Backend Connection Refused

**Error**: `ECONNREFUSED 127.0.0.1:8000`

**Solution**:
```bash
# Verify backend is running
curl http://localhost:8000/

# If not running, start backend:
cd backend
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### JWT Verification Failure

**Error**: `401 Unauthorized` on all API requests

**Cause**: `BETTER_AUTH_SECRET` mismatch between frontend and backend

**Solution**:
```bash
# Verify secrets match:
# Frontend: frontend/.env.local
# Backend: backend/.env

# Both should have identical:
BETTER_AUTH_SECRET=your-secret-key-here
```

### Session Not Persisting

**Error**: User gets logged out on page refresh

**Cause**: HTTP-only cookie not being sent/received

**Solution**:
1. Ensure using `localhost` (not `127.0.0.1`)
2. Check browser DevTools > Application > Cookies for `better-auth-session` cookie
3. Clear browser cookies and try again

### Dark Mode Not Working

**Solution**: Ensure theme toggle adds/removes `.dark` class on `<html>` element. The app uses class-based dark mode (Tailwind v4) configured in `app/globals.css`.

## Available Scripts

```bash
npm run dev         # Start development server
npm run build       # Build production bundle
npm run start       # Start production server
npm run lint        # Run ESLint
npm run lint:fix    # Auto-fix ESLint issues
npm run type-check  # Run TypeScript compiler
```

## Tech Stack

- **Framework**: Next.js 16.1.2 with App Router
- **UI Library**: React 19.2.3
- **Styling**: Tailwind CSS 4.1.18
- **Authentication**: Better Auth 1.3.4
- **Language**: TypeScript 5.9.3
- **Linting**: ESLint (flat config)
- **Code Formatting**: Prettier

## Documentation

- **Feature Spec**: `../specs/004-frontend-nextjs-better-auth/spec.md`
- **Implementation Plan**: `../specs/004-frontend-nextjs-better-auth/plan.md`
- **Quickstart Guide**: `../specs/004-frontend-nextjs-better-auth/quickstart.md`
- **Backend API**: `../backend/API_TESTING_GUIDE.md`
- **Project Constitution**: `../.specify/memory/constitution.md`

## External Resources

- **Next.js 16 Docs**: https://nextjs.org/docs
- **Better Auth Docs**: https://better-auth.com/docs
- **Tailwind CSS Docs**: https://tailwindcss.com/docs
- **React 19 Docs**: https://react.dev/

## Support

If you encounter problems not covered in this guide:

1. Check Prompt History Records in `history/prompts/004-frontend-nextjs-better-auth/`
2. Check Architecture Decision Records in `history/adr/`
3. Update this guide if you solve a new issue

---

**Version**: 1.0
**Last Updated**: 2026-01-16
**Maintainer**: Development Team
