# 🚀 Todo REST API - Testing Guide

## 🔑 Authentication Credentials

**User ID:** `test_user_123`

**JWT Token** (valid for 24 hours):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0X3VzZXJfMTIzIiwiZXhwIjoxNzY4NTY0MzIzLCJpYXQiOjE3Njg0Nzc5MjN9.WD53H4kEH693BfFTU1TXXw0eeL60JUvXKa-1NYQIxZc
```

**Authorization Header:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0X3VzZXJfMTIzIiwiZXhwIjoxNzY4NTY0MzIzLCJpYXQiOjE3Njg0Nzc5MjN9.WD53H4kEH693BfFTU1TXXw0eeL60JUvXKa-1NYQIxZc
```

---

## 📍 API Endpoints

### Base URL: `http://localhost:8000`

### Health Check
```bash
curl http://localhost:8000/
```

---

## 🧪 Test Commands (cURL)

Set the token as an environment variable:
```bash
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0X3VzZXJfMTIzIiwiZXhwIjoxNzY4NTY0MzIzLCJpYXQiOjE3Njg0Nzc5MjN9.WD53H4kEH693BfFTU1TXXw0eeL60JUvXKa-1NYQIxZc"
```

### 1️⃣ Create Task
```bash
curl -X POST http://localhost:8000/api/test_user_123/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy groceries","description":"Milk, eggs, bread"}'
```

### 2️⃣ List All Tasks
```bash
curl http://localhost:8000/api/test_user_123/tasks \
  -H "Authorization: Bearer $TOKEN"
```

### 3️⃣ List Pending Tasks Only
```bash
curl "http://localhost:8000/api/test_user_123/tasks?status=pending" \
  -H "Authorization: Bearer $TOKEN"
```

### 4️⃣ List Completed Tasks Only
```bash
curl "http://localhost:8000/api/test_user_123/tasks?status=completed" \
  -H "Authorization: Bearer $TOKEN"
```

### 5️⃣ Get Single Task
```bash
curl http://localhost:8000/api/test_user_123/tasks/85 \
  -H "Authorization: Bearer $TOKEN"
```

### 6️⃣ Update Task
```bash
curl -X PUT http://localhost:8000/api/test_user_123/tasks/85 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated title","description":"Updated description"}'
```

### 7️⃣ Toggle Completion Status
```bash
curl -X PATCH http://localhost:8000/api/test_user_123/tasks/85/complete \
  -H "Authorization: Bearer $TOKEN"
```

### 8️⃣ Delete Task
```bash
curl -X DELETE http://localhost:8000/api/test_user_123/tasks/85 \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🎨 Swagger UI (Interactive Docs)

**Best way to test:** Open in your browser:

**http://localhost:8000/docs**

Steps:
1. Click "Authorize" button (🔓 icon)
2. Enter: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0X3VzZXJfMTIzIiwiZXhwIjoxNzY4NTY0MzIzLCJpYXQiOjE3Njg0Nzc5MjN9.WD53H4kEH693BfFTU1TXXw0eeL60JUvXKa-1NYQIxZc`
3. Click "Authorize"
4. Test any endpoint by clicking "Try it out"

---

## 🔐 Generate New Token (When Expired)

```python
from jose import jwt
from datetime import datetime, timedelta

SECRET = "65lt50IQDVae5K7bbtuRrlkod9h9uSuq"

payload = {
    "userId": "test_user_123",  
    "exp": datetime.utcnow() + timedelta(hours=24),
    "iat": datetime.utcnow(),
}

token = jwt.encode(payload, SECRET, algorithm="HS256")
print(f"Token: {token}")
```

---

## 📊 Expected Responses

### Success - Create Task (201 Created)
```json
{
  "id": 85,
  "user_id": "test_user_123",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2026-01-15T11:53:16.783721",
  "updated_at": "2026-01-15T11:53:16.783721"
}
```

### Success - List Tasks (200 OK)
```json
[
  {
    "id": 85,
    "user_id": "test_user_123",
    "title": "Buy groceries",
    "completed": false,
    ...
  }
]
```

### Error - No Token (401 Unauthorized)
```json
{
  "error": "unauthorized",
  "message": "Not authenticated"
}
```

### Error - Wrong User (403 Forbidden)
```json
{
  "error": "forbidden",
  "message": "User ID mismatch"
}
```

### Error - Not Found (404 Not Found)
```json
{
  "error": "not_found",
  "message": "Task not found"
}
```

---

## 🎯 Integration with Frontend

When your Next.js frontend uses Better Auth:

1. **User logs in** → Better Auth generates JWT token
2. **Frontend stores token** → localStorage/cookies
3. **Frontend makes API calls** → Includes `Authorization: Bearer {token}` header
4. **Backend verifies token** → Extracts `userId` from JWT
5. **Backend returns data** → Only user's own tasks

The `userId` will come from Better Auth automatically - you don't need to manually create users!

