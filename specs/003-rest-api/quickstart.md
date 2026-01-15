# Quick Start Guide: Todo REST API

**Feature**: 003-rest-api
**Date**: 2026-01-14
**Purpose**: Get started with the Todo REST API for local development and testing

## Prerequisites

1. **Python 3.13+** installed
2. **UV** package manager installed
3. **Neon PostgreSQL** database provisioned (from Phase II)
4. **Better Auth** JWT secret configured

## Installation

### 1. Install Dependencies

```bash
cd backend
uv pip install -r requirements.txt
```

**Required Packages**:
- `fastapi` - Web framework
- `uvicorn[standard]` - ASGI server
- `sqlmodel` - ORM (SQLAlchemy + Pydantic)
- `pyjwt` - JWT token verification
- `python-dotenv` - Environment variable management
- `pytest` - Testing framework
- `httpx` - HTTP client for tests

### 2. Configure Environment Variables

Create `backend/.env` file:

```bash
# Database (from Phase II - Neon PostgreSQL)
DATABASE_URL=postgresql://neondb_owner:password@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require

# Authentication (shared with frontend Better Auth)
BETTER_AUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32

# Frontend origin for CORS
FRONTEND_URL=http://localhost:3000
```

**Important**:
- Use the **pooled** connection endpoint (with `-pooler` suffix) for DATABASE_URL
- BETTER_AUTH_SECRET must be the **same** in both frontend and backend
- Generate secret: `openssl rand -base64 32`

### 3. Verify Database Schema

Ensure Phase II database schema is applied:

```bash
cd backend
alembic current
```

Expected output: `db201faec95e (head)`

If not at head:
```bash
alembic upgrade head
```

## Running the API

### Development Server

```bash
cd backend
uvicorn main:app --reload --port 8000
```

**Server starts at**: `http://localhost:8000`

**Features**:
- Auto-reload on code changes (`--reload`)
- Runs on port 8000
- Interactive API docs at `/docs`
- Alternative docs at `/redoc`

### Production Server

```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

**Configuration**:
- Binds to all interfaces (`--host 0.0.0.0`)
- Multiple workers for concurrency (`--workers 4`)
- No auto-reload (production mode)

## API Documentation

### Swagger UI (Recommended)

Visit: `http://localhost:8000/docs`

**Features**:
- Interactive API testing
- Request/response examples
- Authentication testing (Bearer token)
- Try out all endpoints directly in browser

### ReDoc

Visit: `http://localhost:8000/redoc`

**Features**:
- Clean, readable documentation
- Code samples in multiple languages
- Downloadable OpenAPI spec

### OpenAPI JSON

Download spec: `http://localhost:8000/openapi.json`

**Use with**:
- Postman (import OpenAPI spec)
- Insomnia (import OpenAPI spec)
- Code generators (openapi-generator, swagger-codegen)

## Authentication

### Getting a JWT Token

**Note**: JWT tokens are issued by Better Auth on the frontend. For testing purposes, you can generate a test token:

```python
# test_token.py
import jwt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

# Generate test token for user "test_user_123"
payload = {
    "user_id": "test_user_123",
    "exp": datetime.utcnow() + timedelta(hours=24)
}

token = jwt.encode(
    payload,
    os.getenv("BETTER_AUTH_SECRET"),
    algorithm="HS256"
)

print(f"Test Token: {token}")
```

Run:
```bash
python test_token.py
```

### Using the Token

All API requests must include the token in the Authorization header:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     http://localhost:8000/api/test_user_123/tasks
```

## Example API Calls

### 1. Create a Task

```bash
curl -X POST http://localhost:8000/api/test_user_123/tasks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy groceries",
    "description": "Milk, eggs, bread"
  }'
```

**Expected Response** (201 Created):
```json
{
  "id": 1,
  "user_id": "test_user_123",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2026-01-14T10:30:00Z",
  "updated_at": "2026-01-14T10:30:00Z"
}
```

### 2. List All Tasks

```bash
curl -X GET http://localhost:8000/api/test_user_123/tasks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Filter by Status**:
```bash
# Only pending tasks
curl -X GET "http://localhost:8000/api/test_user_123/tasks?status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Only completed tasks
curl -X GET "http://localhost:8000/api/test_user_123/tasks?status=completed" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Get a Single Task

```bash
curl -X GET http://localhost:8000/api/test_user_123/tasks/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Update a Task

```bash
curl -X PUT http://localhost:8000/api/test_user_123/tasks/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy groceries and fruits",
    "description": "Milk, eggs, bread, apples, bananas"
  }'
```

**Update Title Only**:
```bash
curl -X PUT http://localhost:8000/api/test_user_123/tasks/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"title": "New title"}'
```

### 5. Toggle Task Completion

```bash
curl -X PATCH http://localhost:8000/api/test_user_123/tasks/1/complete \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response** (200 OK):
```json
{
  "id": 1,
  "user_id": "test_user_123",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": true,
  "created_at": "2026-01-14T10:30:00Z",
  "updated_at": "2026-01-14T12:45:00Z"
}
```

### 6. Delete a Task

```bash
curl -X DELETE http://localhost:8000/api/test_user_123/tasks/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response** (204 No Content):
- No response body
- HTTP status code 204

## Testing with HTTPie

HTTPie provides a more user-friendly command-line interface:

```bash
# Install HTTPie
pip install httpie

# Create task
http POST localhost:8000/api/test_user_123/tasks \
  "Authorization:Bearer YOUR_TOKEN_HERE" \
  title="Buy groceries" \
  description="Milk, eggs, bread"

# List tasks
http GET localhost:8000/api/test_user_123/tasks \
  "Authorization:Bearer YOUR_TOKEN_HERE"

# Update task
http PUT localhost:8000/api/test_user_123/tasks/1 \
  "Authorization:Bearer YOUR_TOKEN_HERE" \
  title="New title"

# Toggle completion
http PATCH localhost:8000/api/test_user_123/tasks/1/complete \
  "Authorization:Bearer YOUR_TOKEN_HERE"

# Delete task
http DELETE localhost:8000/api/test_user_123/tasks/1 \
  "Authorization:Bearer YOUR_TOKEN_HERE"
```

## Running Tests

### All Tests

```bash
cd backend
pytest tests/ -v
```

**Expected Output**:
```
tests/test_auth.py::test_create_task_without_token PASSED
tests/test_auth.py::test_create_task_with_invalid_token PASSED
tests/test_auth.py::test_create_task_with_expired_token PASSED
tests/test_tasks.py::test_create_task_success PASSED
tests/test_tasks.py::test_list_tasks_empty PASSED
tests/test_tasks.py::test_get_task_not_found PASSED
...
======================== 24 passed in 2.5s ========================
```

### Test Coverage

```bash
pytest tests/ --cov=. --cov-report=html
```

**Coverage Report**: `htmlcov/index.html`

### Single Test File

```bash
pytest tests/test_tasks.py -v
```

### Single Test Function

```bash
pytest tests/test_tasks.py::test_create_task_success -v
```

## Common Issues

### Issue: 401 Unauthorized

**Problem**: Missing or invalid JWT token

**Solutions**:
1. Ensure token is included in Authorization header
2. Verify BETTER_AUTH_SECRET matches between frontend and backend
3. Check token hasn't expired (`exp` claim)
4. Regenerate test token

### Issue: 403 Forbidden

**Problem**: User ID mismatch (URL user_id doesn't match token user_id)

**Solution**: Ensure the `user_id` in the URL path matches the `user_id` claim in the JWT token

**Example**:
```bash
# Token has user_id: "test_user_123"
# URL must use: /api/test_user_123/tasks
# NOT: /api/other_user/tasks (returns 403)
```

### Issue: 404 Not Found

**Problem**: Task doesn't exist OR belongs to another user

**Note**: The API returns 404 for both cases to prevent ID enumeration

**Solutions**:
1. Verify task ID exists
2. Ensure you're using the correct user_id
3. Check that the task belongs to the authenticated user

### Issue: 400 Bad Request (Validation Error)

**Problem**: Invalid request data

**Common Cases**:
- Empty title: `{"error": "validation_error", "message": "Title is required"}`
- Title too long: `{"message": "Title exceeds maximum length of 200 characters"}`
- No fields in update: `{"message": "At least one field must be provided for update"}`

**Solution**: Check request body matches schema requirements

### Issue: Database Connection Error

**Problem**: Cannot connect to Neon PostgreSQL

**Solutions**:
1. Verify DATABASE_URL is correct
2. Ensure using **pooled** endpoint (with `-pooler` suffix)
3. Check network connectivity
4. Verify database credentials

### Issue: CORS Error (from Frontend)

**Problem**: Frontend requests blocked by CORS policy

**Solutions**:
1. Add frontend URL to `origins` list in `main.py`
2. Ensure `FRONTEND_URL` environment variable is set
3. Restart API server after CORS configuration changes

## Performance Tips

### Connection Pooling

The API uses SQLModel's default connection pooling. For production, consider tuning:

```python
# database.py
engine = create_engine(
    DATABASE_URL,
    pool_size=20,           # Max connections in pool
    max_overflow=10,        # Extra connections if pool full
    pool_pre_ping=True,     # Verify connections before use
    pool_recycle=3600       # Recycle connections after 1 hour
)
```

### Monitoring

Enable API metrics:
```bash
uvicorn main:app --log-level info
```

Watch request logs:
```
INFO:     127.0.0.1:54321 - "GET /api/test_user_123/tasks HTTP/1.1" 200 OK
INFO:     127.0.0.1:54322 - "POST /api/test_user_123/tasks HTTP/1.1" 201 Created
```

### Load Testing

```bash
# Install Apache Bench
apt-get install apache2-utils

# Test create endpoint (100 requests, 10 concurrent)
ab -n 100 -c 10 -H "Authorization: Bearer YOUR_TOKEN_HERE" \
   -p task.json -T application/json \
   http://localhost:8000/api/test_user_123/tasks
```

**Expected Performance** (from spec):
- Create task: <500ms (95th percentile)
- List tasks: <1s (up to 10,000 tasks)
- Concurrent load: 100 requests/user without degradation

## Next Steps

1. **Frontend Integration**: Connect Next.js frontend to this API
2. **Better Auth Setup**: Configure actual JWT token issuance
3. **Deployment**: Deploy to production server (Vercel, Render, etc.)
4. **Monitoring**: Set up logging and error tracking (Sentry, LogRocket)
5. **Phase III**: Add AI chatbot with MCP tools

## Additional Resources

- **OpenAPI Spec**: `specs/003-rest-api/contracts/openapi.yaml`
- **Data Model**: `specs/003-rest-api/data-model.md`
- **Research**: `specs/003-rest-api/research.md`
- **Plan**: `specs/003-rest-api/plan.md`
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **SQLModel Docs**: https://sqlmodel.tiangolo.com/
- **Better Auth Docs**: https://www.better-auth.com/
