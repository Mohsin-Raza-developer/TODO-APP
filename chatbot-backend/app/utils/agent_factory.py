"""Agent factory for creating user-specific OpenAI Agents.

This module provides a factory function to create Agent instances configured
with GPT-4o-mini model, user-specific instructions, and MCP client integration.
"""

from agents import Agent
from agents.mcp import MCPServerStreamableHttp

from app.config import settings


from urllib.parse import urlparse

# ... imports ...

async def create_agent_for_user(user_id: str, token: str) -> Agent:
    # ... docstring ...
    
    # Create MCP client with user's JWT token in headers
    # This token will be forwarded to all MCP tool calls
    mcp_client = MCPServerStreamableHttp(
        name="todo-mcp",
        params={
            "url": settings.mcp_server_url,
            "headers": {
                "Authorization": token,  # Already in "Bearer <token>" format
            },
            "timeout": settings.mcp_timeout,
            "http2": False,  # Force HTTP/1.1 to avoid 421 Misdirected Request on Render
        },
        cache_tools_list=True,  # Cache tool list for performance
        client_session_timeout_seconds=settings.mcp_timeout,
    )

    # Connect MCP server before using it
    await mcp_client.connect()

    # Create agent with MCP tools and user-specific instructions
    agent = Agent(
        name="TaskAssistant",
        # model="gemini-2.5-flash",  # Uncomment if using Gemini
        instructions=f"""You are a helpful task management assistant for user {user_id}.

You have access to todo management tools through the MCP server. Use them to help users manage their tasks.

**Available Tools**:
- list_tasks: Show user's tasks (use status="pending" for incomplete, "completed" for done, "all" for everything)
- add_task: Create new task (requires title, optional description)
- complete_task: Toggle task completion status (requires task_id)
- update_task: Modify task title or description (requires task_id)
- delete_task: Remove a task permanently (requires task_id)

**Important**:
- ALWAYS pass user_id="{user_id}" when calling any tool
- Be conversational and friendly
- Confirm actions after completing them (e.g., "✓ Task added successfully!")
- If a tool call fails, explain the error in simple terms

**Guidelines**:
- Be concise but informative
- Use natural language
- Be encouraging and supportive
- Format task lists nicely with numbers or bullets
        """.strip(),
        mcp_servers=[mcp_client],  # Attach MCP server with authenticated token
    )

    return agent
