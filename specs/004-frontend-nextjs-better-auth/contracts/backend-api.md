# Backend API Contract Reference

**Feature**: `004-frontend-nextjs-better-auth`
**Date**: 2026-01-16
**Phase**: 1 (Design Artifacts)

## Overview

This document references the existing FastAPI backend API contracts that the Next.js frontend will consume. The backend API remains unchanged in Phase II; only the frontend authentication layer (Better Auth) is new.

---

## Primary API Documentation

**Location**: [`backend/API_TESTING_GUIDE.md`](../../../backend/API_TESTING_GUIDE.md)

**Purpose**: Complete API endpoint reference with cURL examples, request/response formats, error codes, and Swagger UI instructions.

---

## Base URL

| Environment | Base URL |
|-------------|----------|
| Development | `http://localhost:8000` |
| Production | `https://api.yourdomain.com` (configured via env) |

---

## Authentication

### JWT Token Format

All API requests (except health check) require a JWT token in the `Authorization` header:

```http
Authorization: Bearer {jwt_token}
```

### Token Structure

```json
{
  "userId": "user_uuid_from_better_auth",
  "exp": 1768564323,  // Expiry timestamp
  "iat": 1768477923   // Issued at timestamp
}
```

### Token Lifecycle

1. **Generation**: Better Auth generates JWT after successful login (frontend)
2. **Storage**: Stored in HTTP-only cookie by Better Auth
3. **Extraction**: Frontend API client extracts token from Better Auth session
4. **Transmission**: Included in `Authorization: Bearer {token}` header
5. **Verification**: Backend verifies signature with `BETTER_AUTH_SECRET`
6. **Extraction**: Backend extracts `userId` from token payload
7. **Enforcement**: Backend filters all queries by `userId` (data isolation)

### Secret Configuration

**Critical**: Frontend and backend MUST share the same secret:

```bash
# .env (both frontend and backend)
BETTER_AUTH_SECRET=65lt50IQDVae5K7bbtuRrlkod9h9uSuq
```

---

## Task Endpoints

All task endpoints are user-scoped: `/api/{user_id}/tasks`

### 1. List Tasks

**Endpoint**: `GET /api/{user_id}/tasks`

**Query Parameters**:
- `status` (optional): `all` | `pending` | `completed` (default: `all`)

**Request Headers**:
```http
Authorization: Bearer {jwt_token}
```

**Success Response** (200 OK):
```json
[
  {
    "id": 85,
    "user_id": "test_user_123",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "date": "2026-01-20",
    "completed": false,
    "created_at": "2026-01-15T11:53:16.783721",
    "updated_at": "2026-01-15T11:53:16.783721"
  }
]
```

**Error Responses**: See [Error Responses](#error-responses) section below.

---

### 2. Get Single Task

**Endpoint**: `GET /api/{user_id}/tasks/{task_id}`

**Request Headers**:
```http
Authorization: Bearer {jwt_token}
```

**Success Response** (200 OK):
```json
{
  "id": 85,
  "user_id": "test_user_123",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "date": "2026-01-20",
  "completed": false,
  "created_at": "2026-01-15T11:53:16.783721",
  "updated_at": "2026-01-15T11:53:16.783721"
}
```

**Error Responses**: See [Error Responses](#error-responses) section below.

---

### 3. Create Task

**Endpoint**: `POST /api/{user_id}/tasks`

**Request Headers**:
```http
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "Buy groceries",        // Required, 1-200 characters
  "description": "Milk, eggs, bread", // Optional, up to 1000 characters
  "date": "2026-01-20"              // Optional, YYYY-MM-DD format
}
```

**Success Response** (201 Created):
```json
{
  "id": 85,
  "user_id": "test_user_123",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "date": "2026-01-20",
  "completed": false,
  "created_at": "2026-01-15T11:53:16.783721",
  "updated_at": "2026-01-15T11:53:16.783721"
}
```

**Validation Errors** (422 Unprocessable Entity):
- Empty title → `{"detail": "Title cannot be empty"}`
- Title > 200 chars → `{"detail": "Title exceeds maximum length"}`
- Description > 1000 chars → `{"detail": "Description exceeds maximum length"}`
- Invalid date format → `{"detail": "Date must be in YYYY-MM-DD format"}`

**Error Responses**: See [Error Responses](#error-responses) section below.

---

### 4. Update Task

**Endpoint**: `PUT /api/{user_id}/tasks/{task_id}`

**Request Headers**:
```http
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "Updated title",           // Required, 1-200 characters
  "description": "Updated description", // Optional, nullable
  "date": "2026-01-21"                // Optional, nullable, YYYY-MM-DD
}
```

**Success Response** (200 OK):
```json
{
  "id": 85,
  "user_id": "test_user_123",
  "title": "Updated title",
  "description": "Updated description",
  "date": "2026-01-21",
  "completed": false,
  "created_at": "2026-01-15T11:53:16.783721",
  "updated_at": "2026-01-16T09:12:34.567890"
}
```

**Error Responses**: See [Error Responses](#error-responses) section below.

---

### 5. Toggle Task Completion

**Endpoint**: `PATCH /api/{user_id}/tasks/{task_id}/complete`

**Request Headers**:
```http
Authorization: Bearer {jwt_token}
```

**Request Body**: None

**Success Response** (200 OK):
```json
{
  "id": 85,
  "user_id": "test_user_123",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "date": "2026-01-20",
  "completed": true,  // Toggled from false → true
  "created_at": "2026-01-15T11:53:16.783721",
  "updated_at": "2026-01-16T10:23:45.678901"
}
```

**Error Responses**: See [Error Responses](#error-responses) section below.

---

### 6. Delete Task

**Endpoint**: `DELETE /api/{user_id}/tasks/{task_id}`

**Request Headers**:
```http
Authorization: Bearer {jwt_token}
```

**Request Body**: None

**Success Response** (200 OK):
```json
{
  "message": "Task deleted successfully"
}
```

**Error Responses**: See [Error Responses](#error-responses) section below.

---

## Error Responses

All error responses follow this standard format:

```json
{
  "error": "error_code",
  "message": "User-friendly error message"
}
```

### Common Error Codes

| Status Code | Error Code | Message | Frontend Action |
|-------------|------------|---------|-----------------|
| **401** | `unauthorized` | `"Not authenticated"` | Redirect to login, clear session |
| **403** | `forbidden` | `"User ID mismatch"` | Show error toast, log security event |
| **404** | `not_found` | `"Task not found"` | Show error toast "Resource not found" |
| **422** | `validation_error` | Specific validation message | Display field-level errors |
| **500** | `server_error` | `"Internal server error"` | Show error toast with retry button |
| **503** | `service_unavailable` | `"Service temporarily unavailable"` | Show error toast with retry button |

### Error Handling Strategy

**401 Unauthorized** (Missing/Invalid Token):
```typescript
// Redirect to login page
router.push('/login');
// Clear Better Auth session
await authClient.signOut();
// Show toast: "Session expired. Please sign in again."
```

**403 Forbidden** (User ID Mismatch):
```typescript
// Security violation: user trying to access another user's data
// Show toast: "You do not have permission to access this resource."
// Log security event to monitoring system
console.error('403 Forbidden: User ID mismatch', { userId, taskId });
```

**404 Not Found** (Task Doesn't Exist):
```typescript
// Task was deleted or never existed
// Show toast: "The requested resource was not found."
// Navigate back to task list
router.push('/dashboard');
```

**422 Validation Error** (Invalid Input):
```typescript
// Parse validation errors from response
const errors = parseValidationErrors(response);
// Display field-level errors in form
setFormErrors(errors);
// No toast needed (inline validation feedback)
```

**500/503 Server Errors**:
```typescript
// Show toast: "Server error. Please try again later."
// Display retry button in toast
showToast('error', 'Server error. Please try again later.', {
  action: { label: 'Retry', onClick: () => retryRequest() }
});
```

---

## Request Interceptor Pattern

Frontend API client should include this logic for all requests:

```typescript
// Before request
async function addAuthHeader(config: RequestConfig): Promise<RequestConfig> {
  const session = await authClient.getSession();
  if (!session) {
    throw new Error('No active session');
  }
  config.headers['Authorization'] = `Bearer ${session.accessToken}`;
  return config;
}

// After response
async function handleErrorResponse(response: Response): Promise<never> {
  const errorData = await response.json();

  // Map HTTP status to user-friendly message
  const errorMap = {
    401: { code: 'unauthorized', message: 'Session expired. Please sign in again.' },
    403: { code: 'forbidden', message: 'You do not have permission.' },
    404: { code: 'not_found', message: 'Resource not found.' },
    422: { code: 'validation_error', message: 'Invalid input.' },
    500: { code: 'server_error', message: 'Server error. Please try again later.' },
  };

  const error = errorMap[response.status] || {
    code: 'unknown_error',
    message: 'An unexpected error occurred.'
  };

  throw new APIError(response.status, error.code, error.message);
}
```

---

## Data Isolation Enforcement

The backend enforces strict data isolation at the database level:

```python
# Backend filters all queries by user_id from JWT token
def get_user_tasks(user_id: str, db: Session):
    # user_id extracted from JWT token (not from URL parameter!)
    return db.query(Task).filter(Task.user_id == user_id).all()
```

**Frontend Guarantee**: Users can NEVER access another user's data, even if they manipulate URL parameters or API requests. The backend always uses `user_id` from the verified JWT token, not from the request URL.

---

## Swagger UI (Interactive Testing)

**URL**: `http://localhost:8000/docs`

**Steps to Test**:
1. Open `http://localhost:8000/docs` in browser
2. Click "Authorize" button (🔓 icon)
3. Enter: `Bearer {your_jwt_token}`
4. Click "Authorize"
5. Test any endpoint by clicking "Try it out"

**Note**: Frontend developers can use Swagger UI to test backend integration before implementing frontend API client.

---

## Summary

- **Backend API**: Fully implemented in Phase I (no changes needed)
- **Authentication**: JWT token from Better Auth → Backend verifies with shared secret
- **Endpoints**: 6 task operations (list, get, create, update, toggle, delete)
- **Error Handling**: Standardized error responses with clear codes and messages
- **Data Isolation**: Backend enforces user_id filtering on all queries
- **Testing**: Swagger UI available at `http://localhost:8000/docs`

**See Also**:
- [`backend/API_TESTING_GUIDE.md`](../../../backend/API_TESTING_GUIDE.md) - Full API documentation with cURL examples
- [`specs/004-frontend-nextjs-better-auth/contracts/api-client.ts`](./api-client.ts) - TypeScript types for API client
- [`specs/004-frontend-nextjs-better-auth/data-model.md`](../data-model.md) - Frontend data types and validation rules

---

**Document Version**: 1.0
**Last Updated**: 2026-01-16
**Next**: Create `quickstart.md` for developer onboarding
