# Quickstart: Chatbot Frontend

**Feature**: AI Task Assistant Chat Interface  
**Route**: `/chat`  
**Authentication**: Required (Better Auth)

## Prerequisites

1. **Frontend Setup**:
   ```bash
   cd frontend
   npm install  # Includes @openai/chatkit-react
   ```

2. **Backend Running**:
   - Chatbot backend must be running on `http://localhost:8001`
   - MCP server must be running on `http://localhost:8000`
   - Database migrations applied (`alembic upgrade head`)

3. **User Account**:
   - Create account at `http://localhost:3001/signup`
   - Or login at `http://localhost:3001/login`

---

## Running the Application

### 1. Start Frontend (if not already running)

```bash
cd frontend
npm run dev
```

Frontend will be available at `http://localhost:3001`

### 2. Navigate to Chat

- **URL**: `http://localhost:3001/chat`
- **Nav Menu**: Click "Chat" link in header (after login)

---

## User Flows

### Flow 1: First-Time Unauthenticated User

1. Open `http://localhost:3001/chat`
2. **See**: Locked UI with lock icon
3. **Message**: "Sign in to Chat"
4. Click "Sign In" button
5. **Redirected to**: `/login?redirect=/chat`
6. Enter credentials and login
7. **Redirected back to**: `/chat` with full chat interface

### Flow 2: Authenticated User - Chat Interaction

1. Ensure you're logged in
2. Navigate to `/chat`
3. **See**: ChatKit interface with message composer
4. **Try these commands**:
   ```
   show my tasks
   add task: Buy groceries
   complete task 1
   what tasks do I have?
   ```
5. **Expected**: AI responds with streaming text, performs task operations

### Flow 3: Conversation History

1. Have a conversation (multiple messages)
2. Close browser tab
3. Reopen `/chat` (while still logged in)
4. **Expected**: Previous messages still visible
5. Continue conversation - AI remembers context

---

## Expected Behavior

### ✅ Authenticated Users

- See full ChatKit UI
- Message composer works
- AI responds with streaming text
- Task operations execute (add, complete, list, update, delete)
- Conversation history persists across sessions
- Can create new threads

### 🔒 Unauthenticated Users

- See locked placeholder UI
- Lock icon displayed
- "Sign In" button redirects to login
- Cannot access chat functionality
- Redirected back to chat after login

---

## Troubleshooting

### Issue: "Unauthorized" Error

**Symptoms**: Error message after sending message

**Solutions**:
1. Verify you're logged in (check header shows your name)
2. Try logging out and back in (refresh session token)
3. Check browser console for auth errors

### Issue: "Backend Unavailable"

**Symptoms**: No response from AI, connection error

**Solutions**:
1. Verify chatbot backend is running:
   ```bash
   cd chatbot-backend
   # Should see "Uvicorn running on http://localhost:8001"
   ```
2. Check backend logs for errors
3. Verify DATABASE_URL is set in `chatbot-backend/.env`

### Issue: "Task Operations Don't Work"

**Symptoms**: AI responds but tasks aren't created/updated

**Solutions**:
1. Verify MCP server is running on port 8000
2. Check MCP server has access to database
3. Verify TODO API is running on port 9000

### Issue: Chat UI Not Loading

**Symptoms**: Blank page at `/chat`

**Solutions**:
1. Check browser console for errors
2. Verify `@openai/chatkit-react` is installed:
   ```bash
   npm list @openai/chatkit-react
   ```
3. Clear browser cache and hard refresh (Ctrl+Shift+R)

### Issue: "Session Expired" Mid-Conversation

**Symptoms**: Suddenly logged out while chatting

**Solutions**:
1. Login again - unsent message should be preserved
2. Better Auth session expires after inactivity
3. Enable "Remember Me" during login for longer sessions

---

## Features Demonstrated

### User Story 1 (P1): Authenticated Chat
- ✅ Chat interface accessible to logged-in users
- ✅ Streaming AI responses
- ✅ Task management via conversation
- ✅ Context preservation across messages

### User Story 2 (P2): Access Control
- ✅ Locked UI for unauthenticated users
- ✅ Sign-in prompt and redirection
- ✅ Automatic unlock after authentication

### User Story 3 (P3): History Persistence
- ✅ Conversation history loads on return
- ✅ Thread continuity maintained
- ✅ Create new threads

---

## Project Structure Reference

```
frontend/
├── app/
│   └── chat/
│       └── page.tsx              # Main chat page
│
├── components/
│   └── chat/
│       ├── ChatInterface.tsx          # ChatKit wrapper
│       └── LockedChatPlaceholder.tsx  # Locked UI
│
└── lib/
    └── chatkit-config.ts         # ChatKit configuration
```

---

## Next Steps

1. **Explore Chat Features**:
   - Try different task operations
   - Test conversation context
   - Create multiple threads

2. **Test Mobile**:
   - Open on mobile device
   - Verify responsive design
   - Test touch interactions

3. **Provide Feedback**:
   - Report any bugs
   - Suggest UI improvements
   - Request new features

---

## Support

**Documentation**: `specs/007-chatbot-frontend/`
- `spec.md` - Feature requirements
- `plan.md` - Technical implementation
- `research.md` - Integration decisions

**Related Components**:
- Chatbot Backend: `chatbot-backend/`
- Authentication: Better Auth (`frontend/lib/auth*.ts`)
- Dashboard: `frontend/app/dashboard/` (similar auth pattern)
