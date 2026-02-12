mohsin@DESKTOP-LPE6TEF:/mnt/d/github.com/TODO-APP/chatbot-backend$ uv run uvicorn app.main:app --reload --port 8001
INFO:     Will watch for changes in these directories: ['/mnt/d/github.com/TODO-APP/chatbot-backend']
INFO:     Uvicorn running on http://127.0.0.1:8001 (Press CTRL+C to quit)
INFO:     Started reloader process [9296] using WatchFiles
INFO:     Started server process [9298]
INFO:     Waiting for application startup.
{"timestamp": "2026-02-12T13:26:43.954318Z", "level": "INFO", "message": "Starting chatbot backend", "logger": "app.main"}
{"timestamp": "2026-02-12T13:26:43.954578Z", "level": "INFO", "message": "Port: 8001", "logger": "app.main"}      
{"timestamp": "2026-02-12T13:26:43.954730Z", "level": "INFO", "message": "MCP Server: https://todo-mcp-server-r2er.onrender.com/mcp", "logger": "app.main"}
{"timestamp": "2026-02-12T13:26:43.954874Z", "level": "INFO", "message": "Database: ep-fragrant-smoke-ahcmdopb-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require", "logger": "app.main"}
{"timestamp": "2026-02-12T13:26:43.955052Z", "level": "INFO", "message": "Configuration validated successfully", "logger": "app.main"}
INFO:     Application startup complete.
{"timestamp": "2026-02-12T13:27:01.759246Z", "level": "INFO", "message": "Verifying session token: bmayWniacSd2n9AkLZ4J...", "logger": "app.auth.jwt", "request_id": "11ab1fc7-3ad1-460a-8502-04f11045133a"}
{"timestamp": "2026-02-12T13:27:03.451024Z", "level": "INFO", "message": "Token verified successfully for user: vs1CAGjlMHXPQSRhuITcVpI4kWlSxW2e", "logger": "app.auth.jwt", "request_id": "11ab1fc7-3ad1-460a-8502-04f11045133a"}  
{"timestamp": "2026-02-12T13:27:03.652570Z", "level": "INFO", "message": "ChatKit request from user=vs1CAGjlMHXPQSRhuITcVpI4kWlSxW2e", "logger": "app.main", "request_id": "11ab1fc7-3ad1-460a-8502-04f11045133a"}
{"timestamp": "2026-02-12T13:27:03.667291Z", "level": "INFO", "message": "Received request op: threads.create", "logger": "chatkit", "request_id": "11ab1fc7-3ad1-460a-8502-04f11045133a"}
{"timestamp": "2026-02-12T13:27:06.369310Z", "level": "INFO", "message": "Database connection pool created", "logger": "app.store.neon_store", "request_id": "11ab1fc7-3ad1-460a-8502-04f11045133a"}
{"timestamp": "2026-02-12T13:27:08.479516Z", "level": "INFO", "message": "Processing message for user=vs1CAGjlMHXPQSRhuITcVpI4kWlSxW2e thread=thr_686ef6d2", "logger": "app.server.chatkit_server", "request_id": "11ab1fc7-3ad1-460a-8502-04f11045133a"}
{"timestamp": "2026-02-12T13:27:09.306499Z", "level": "INFO", "message": "Loaded 1 messages from thread history", "logger": "app.server.chatkit_server", "request_id": "11ab1fc7-3ad1-460a-8502-04f11045133a"}
{"timestamp": "2026-02-12T13:27:09.307039Z", "level": "INFO", "message": "MCP cache miss for user=vs1CAGjlMHXPQSRhuITcVpI4kWlSxW2e; creating new connection", "logger": "app.utils.agent_factory", "request_id": "11ab1fc7-3ad1-460a-8502-04f11045133a"}
{"timestamp": "2026-02-12T13:27:09.747863Z", "level": "INFO", "message": "HTTP Request: POST https://todo-mcp-server-r2er.onrender.com/mcp \"HTTP/1.1 200 OK\"", "logger": "httpx", "request_id": "11ab1fc7-3ad1-460a-8502-04f11045133a"}
{"timestamp": "2026-02-12T13:27:09.748643Z", "level": "INFO", "message": "Negotiated protocol version: 2025-11-25", "logger": "mcp.client.streamable_http", "request_id": "11ab1fc7-3ad1-460a-8502-04f11045133a"}
{"timestamp": "2026-02-12T13:27:09.751142Z", "level": "INFO", "message": "Successfully connected MCP client for user=vs1CAGjlMHXPQSRhuITcVpI4kWlSxW2e", "logger": "app.utils.agent_factory", "request_id": "11ab1fc7-3ad1-460a-8502-04f11045133a"}
{"timestamp": "2026-02-12T13:27:09.751705Z", "level": "INFO", "message": "Starting agent execution with streaming", "logger": "app.server.chatkit_server", "request_id": "11ab1fc7-3ad1-460a-8502-04f11045133a"}
{"timestamp": "2026-02-12T13:27:10.095140Z", "level": "INFO", "message": "HTTP Request: POST https://todo-mcp-server-r2er.onrender.com/mcp \"HTTP/1.1 202 Accepted\"", "logger": "httpx", "request_id": "11ab1fc7-3ad1-460a-8502-04f11045133a"}
{"timestamp": "2026-02-12T13:27:10.457204Z", "level": "INFO", "message": "HTTP Request: POST https://todo-mcp-server-r2er.onrender.com/mcp \"HTTP/1.1 200 OK\"", "logger": "httpx", "request_id": "11ab1fc7-3ad1-460a-8502-04f11045133a"}
{"timestamp": "2026-02-12T13:27:15.290300Z", "level": "INFO", "message": "HTTP Request: POST https://api.openai.com/v1/traces/ingest \"HTTP/1.1 204 No Content\"", "logger": "httpx"}
{"timestamp": "2026-02-12T13:27:19.192933Z", "level": "INFO", "message": "HTTP Request: POST https://generativelanguage.googleapis.com/v1beta/openai/chat/completions \"HTTP/1.1 200 OK\"", "logger": "httpx", "request_id": "11ab1fc7-3ad1-460a-8502-04f11045133a"}
{"timestamp": "2026-02-12T13:27:19.726931Z", "level": "INFO", "message": "HTTP Request: POST https://todo-mcp-server-r2er.onrender.com/mcp \"HTTP/1.1 200 OK\"", "logger": "httpx", "request_id": "11ab1fc7-3ad1-460a-8502-04f11045133a"}
{"timestamp": "2026-02-12T13:27:20.753128Z", "level": "INFO", "message": "HTTP Request: POST https://generativelanguage.googleapis.com/v1beta/openai/chat/completions \"HTTP/1.1 200 OK\"", "logger": "httpx", "request_id": "11ab1fc7-3ad1-460a-8502-04f11045133a"}
{"timestamp": "2026-02-12T13:27:21.042325Z", "level": "INFO", "message": "HTTP Request: POST https://api.openai.com/v1/traces/ingest \"HTTP/1.1 204 No Content\"", "logger": "httpx"}
{"timestamp": "2026-02-12T13:27:21.428655Z", "level": "INFO", "message": "HTTP Request: POST https://api.openai.com/v1/traces/ingest \"HTTP/1.1 204 No Content\"", "logger": "httpx"}
{"timestamp": "2026-02-12T13:27:21.831952Z", "level": "INFO", "message": "Completed streaming 10 events for user=vs1CAGjlMHXPQSRhuITcVpI4kWlSxW2e thread=thr_686ef6d2", "logger": "app.server.chatkit_server", "request_id": "11ab1fc7-3ad1-460a-8502-04f11045133a"}
