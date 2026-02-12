"""Agent factory for creating user-specific OpenAI Agents.

This module provides a factory function to create Agent instances configured
with GPT-4o-mini model, user-specific instructions, and MCP client integration.
"""

import asyncio
import inspect
import logging
import time
from dataclasses import dataclass

from agents import Agent, ModelSettings
from agents.mcp import MCPServerStreamableHttp

from app.config import settings

logger = logging.getLogger(__name__)

MCP_CLIENT_IDLE_TTL_SECONDS = 10 * 60


@dataclass
class CachedMCPClient:
    client: MCPServerStreamableHttp
    token: str
    last_used_monotonic: float


_mcp_client_cache: dict[str, CachedMCPClient] = {}
_mcp_client_lock = asyncio.Lock()


async def _safe_close_mcp_client(client: MCPServerStreamableHttp) -> None:
    """Close MCP client with best-effort compatibility across SDK versions."""
    for method_name in ("cleanup", "close", "disconnect"):
        method = getattr(client, method_name, None)
        if method is None:
            continue
        try:
            result = method()
            if inspect.isawaitable(result):
                await result
            logger.info("Closed MCP client via %s()", method_name)
            return
        except Exception:
            logger.warning("Failed to close MCP client via %s()", method_name, exc_info=True)


async def _evict_expired_clients(now_monotonic: float) -> None:
    expired_user_ids: list[str] = []
    for user_id, cached in _mcp_client_cache.items():
        if now_monotonic - cached.last_used_monotonic > MCP_CLIENT_IDLE_TTL_SECONDS:
            expired_user_ids.append(user_id)

    for user_id in expired_user_ids:
        stale = _mcp_client_cache.pop(user_id, None)
        if stale:
            await _safe_close_mcp_client(stale.client)
            logger.info("Evicted stale MCP client cache for user=%s", user_id)


async def invalidate_mcp_client_cache(user_id: str) -> None:
    """Invalidate cached MCP client for a specific user."""
    async with _mcp_client_lock:
        cached = _mcp_client_cache.pop(user_id, None)
        if not cached:
            return
        await _safe_close_mcp_client(cached.client)
        logger.info("Invalidated MCP client cache for user=%s", user_id)


async def get_or_create_mcp_client(user_id: str, token: str) -> MCPServerStreamableHttp:
    """
    Get an existing connected MCP client from cache or create and connect a new one.
    
    Args:
        user_id: The ID of the user.
        token: The authentication token.
        
    Returns:
        A connected MCPServerStreamableHttp instance.
    """
    now_monotonic = time.monotonic()

    async with _mcp_client_lock:
        await _evict_expired_clients(now_monotonic)

        cached = _mcp_client_cache.get(user_id)
        if cached and cached.token == token:
            cached.last_used_monotonic = now_monotonic
            logger.info("MCP cache hit for user=%s", user_id)
            return cached.client

        if cached:
            logger.info("MCP cache refresh for user=%s (token changed)", user_id)
            _mcp_client_cache.pop(user_id, None)
            await _safe_close_mcp_client(cached.client)

        logger.info("MCP cache miss for user=%s; creating new connection", user_id)
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

        try:
            await mcp_client.connect()
        except Exception:
            await _safe_close_mcp_client(mcp_client)
            logger.exception("MCP connect failed for user=%s", user_id)
            raise

        _mcp_client_cache[user_id] = CachedMCPClient(
            client=mcp_client,
            token=token,
            last_used_monotonic=now_monotonic,
        )
        logger.info("Successfully connected MCP client for user=%s", user_id)
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
        model_settings=ModelSettings(parallel_tool_calls=True, max_tokens=250),
        mcp_servers=[mcp_client],  # Attach MCP server with authenticated token
    )

    return agent
