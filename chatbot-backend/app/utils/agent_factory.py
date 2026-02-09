"""Agent factory for creating user-specific OpenAI Agents.

This module provides a factory function to create Agent instances configured
with GPT-4o-mini model, user-specific instructions, and MCP client integration.
"""

import asyncio
import logging
from typing import Dict, Tuple

from agents import Agent,ModelSettings
from agents.mcp import MCPServerStreamableHttp

from app.config import settings


from urllib.parse import urlparse

# ... imports ...

logger = logging.getLogger(__name__)

# Global cache for MCP clients: (user_id, token) -> MCPServerStreamableHttp
# _mcp_client_cache: Dict[Tuple[str, str], MCPServerStreamableHttp] = {}
# _mcp_client_lock = asyncio.Lock()


async def get_or_create_mcp_client(user_id: str, token: str) -> MCPServerStreamableHttp:
    """
    Get an existing connected MCP client from cache or create and connect a new one.
    
    Args:
        user_id: The ID of the user.
        token: The authentication token.
        
    Returns:
        A connected MCPServerStreamableHttp instance.
    """
    # cache_key = (user_id, token)
    
    mcp_client = MCPServerStreamableHttp(
            name="todo-mcp",
            params={
                "url": settings.mcp_server_url,
                "headers": {
                    "Authorization": token,  # Already in "Bearer <token>" format
                },
                "timeout": settings.mcp_timeout,
                "http2": False, 
            },
            cache_tools_list=True,  # Cache tool list for performance
            client_session_timeout_seconds=settings.mcp_timeout,
        ) 

    # Connect with retry logic
    await mcp_client.connect()
    logger.info(f"Successfully connected MCP client for user {user_id}")
    return mcp_client

async def create_agent_for_user(user_id: str, token: str) -> Agent:
    # ... docstring ...
    
    # Get cached or new MCP client
    mcp_client = await get_or_create_mcp_client(user_id, token) 

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
- Format task lists nicely with numbers or bullets,
        """.strip(),
        model_settings = ModelSettings(parallel_tool_calls=True,max_tokens=250),
        mcp_servers=[mcp_client],  # Attach MCP server with authenticated token
    )

    return agent
