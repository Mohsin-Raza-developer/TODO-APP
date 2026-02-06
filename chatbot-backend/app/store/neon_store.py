"""Neon PostgreSQL implementation of ChatKit Store interface.

This module provides database-backed persistent storage for chat threads and messages.
All operations enforce user isolation through user_id filtering.

Architecture:
- AsyncPG for database connections
- Connection pooling via asyncpg.create_pool()
- User isolation enforced at query level
- CASCADE DELETE handles cleanup
- Pagination support for message history
"""

from datetime import datetime, timezone
from typing import Optional
import asyncpg
import logging
import json

from chatkit.store import Store, NotFoundError
from chatkit.types import (
    ThreadMetadata, ThreadItem, UserMessageItem, AssistantMessageItem,
    Attachment, Page, InferenceOptions, AssistantMessageContent, UserMessageTextContent
)

from app.config import settings
from app.models.request_context import RequestContext

logger = logging.getLogger(__name__)


def _reconstruct_content(content_data: list, role: str) -> list:
    """Reconstruct ChatKit content objects from JSON data.

    Args:
        content_data: List of content dictionaries from JSON
        role: Message role ('user' or 'assistant')

    Returns:
        List of properly typed ChatKit content objects
    """
    reconstructed = []
    for item in content_data:
        if role == 'assistant':
            # Reconstruct AssistantMessageContent
            reconstructed.append(AssistantMessageContent(
                type=item.get('type', 'output_text'),
                text=item.get('text', ''),
                annotations=item.get('annotations', [])
            ))
        elif role == 'user':
            # Reconstruct UserMessageTextContent
            content_type = item.get('type', 'input_text')
            if content_type == 'input_text':
                reconstructed.append(UserMessageTextContent(
                    type='input_text',
                    text=item.get('text', '')
                ))
            # Add more types if needed (AudioInput, etc.)
    return reconstructed


class NeonPostgresStore(Store[RequestContext]):
    """PostgreSQL-backed store for persistent chat history.

    This store persists all chat data to Neon PostgreSQL database:
    - chat_threads: Thread metadata with user ownership
    - chat_messages: Individual messages within threads

    User isolation is enforced at the database query level using user_id filtering.
    All operations are async and use connection pooling for performance.

    Attributes:
        pool: AsyncPG connection pool
    """

    def __init__(self):
        """Initialize store (connection pool created on first use)."""
        self._pool: Optional[asyncpg.Pool] = None

    async def _get_pool(self) -> asyncpg.Pool:
        """Get or create connection pool.

        Returns:
            asyncpg.Pool: Database connection pool

        Note:
            Pool is lazily initialized on first use to avoid creating
            connections during import time.
        """
        if self._pool is None:
            # Remove +asyncpg prefix for direct asyncpg usage
            db_url = settings.database_url.replace('postgresql+asyncpg://', 'postgresql://')
            self._pool = await asyncpg.create_pool(
                db_url,
                min_size=2,
                max_size=10,
                command_timeout=30
            )
            logger.info("Database connection pool created")
        return self._pool

    async def close(self):
        """Close database connection pool."""
        if self._pool:
            await self._pool.close()
            logger.info("Database connection pool closed")

    # T044: Implement load_thread
    async def load_thread(
        self, thread_id: str, context: RequestContext
    ) -> ThreadMetadata:
        """Load thread metadata by ID with user isolation.

        Args:
            thread_id: Thread identifier (UUID)
            context: Request context with user_id for isolation

        Returns:
            ThreadMetadata: Thread metadata

        Raises:
            NotFoundError: Thread not found or doesn't belong to user
        """
        # Handle empty thread_id (should not happen, but defensive)
        if not thread_id or thread_id.strip() == "":
            raise NotFoundError("Thread ID cannot be empty. Use null/None to create new thread.")

        pool = await self._get_pool()

        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                SELECT id, user_id, title, created_at, updated_at
                FROM chat_threads
                WHERE id = $1 AND user_id = $2
                """,
                thread_id,
                context.user_id
            )

            if not row:
                raise NotFoundError(f"Thread {thread_id} not found")

            return ThreadMetadata(
                id=row['id'],
                created_at=row['created_at'],
                previous_response_id=None  # Not tracking response IDs yet
            )

    # T045: Implement save_thread
    async def save_thread(
        self, thread: ThreadMetadata, context: RequestContext
    ) -> None:
        """Create or update thread in database.

        Args:
            thread: Thread metadata to save
            context: Request context with user_id for ownership

        Note:
            Creates new thread if ID doesn't exist, updates if it does.
            User isolation enforced - can only update own threads.
        """
        pool = await self._get_pool()

        async with pool.acquire() as conn:
            # Upsert thread
            await conn.execute(
                """
                INSERT INTO chat_threads (id, user_id, title, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (id) DO UPDATE SET
                    title = EXCLUDED.title,
                    updated_at = EXCLUDED.updated_at
                WHERE chat_threads.user_id = $2
                """,
                thread.id,
                context.user_id,
                None,  # Title (optional, can be set later)
                thread.created_at,
                datetime.now(timezone.utc)  # Use current timestamp for updated_at
            )
            logger.debug(f"Saved thread {thread.id} for user {context.user_id}")

    async def load_threads(
        self, limit: int, after: str | None, order: str, context: RequestContext
    ) -> Page[ThreadMetadata]:
        """Load paginated list of user's threads.

        Args:
            limit: Maximum number of threads to return
            after: Cursor for pagination (thread_id to start after)
            order: Sort order ('asc' or 'desc' by updated_at)
            context: Request context with user_id for filtering

        Returns:
            Page[ThreadMetadata]: Paginated thread list
        """
        pool = await self._get_pool()

        async with pool.acquire() as conn:
            # Build query with pagination
            order_clause = "DESC" if order == "desc" else "ASC"

            if after:
                # Pagination: Get threads after the cursor
                query = f"""
                SELECT id, user_id, title, created_at, updated_at
                FROM chat_threads
                WHERE user_id = $1
                  AND updated_at < (SELECT updated_at FROM chat_threads WHERE id = $2)
                ORDER BY updated_at {order_clause}
                LIMIT $3
                """
                rows = await conn.fetch(query, context.user_id, after, limit + 1)
            else:
                # First page
                query = f"""
                SELECT id, user_id, title, created_at, updated_at
                FROM chat_threads
                WHERE user_id = $1
                ORDER BY updated_at {order_clause}
                LIMIT $2
                """
                rows = await conn.fetch(query, context.user_id, limit + 1)

            # Check if there are more results
            has_more = len(rows) > limit
            threads_data = rows[:limit]

            # Convert to ThreadMetadata objects
            threads = [
                ThreadMetadata(
                    id=row['id'],
                    created_at=row['created_at'],
                    updated_at=row['updated_at'],
                    previous_response_id=None
                )
                for row in threads_data
            ]

            # Determine next cursor
            next_after = threads[-1].id if has_more and threads else None

            return Page(
                data=threads,
                has_more=has_more,
                after=next_after
            )

    # T046: Implement load_thread_items
    async def load_thread_items(
        self, thread_id: str, after: str | None, limit: int, order: str, context: RequestContext
    ) -> Page[ThreadItem]:
        """Load messages from a thread with pagination.

        Args:
            thread_id: Thread identifier
            after: Cursor for pagination (message_id to start after)
            limit: Maximum number of messages to return
            order: Sort order ('asc' or 'desc' by created_at)
            context: Request context (user isolation via thread ownership)

        Returns:
            Page[ThreadItem]: Paginated message list

        Note:
            Loads last 20 messages by default for chat history.
            User isolation enforced by checking thread ownership.
        """
        pool = await self._get_pool()

        async with pool.acquire() as conn:
            # First verify user owns this thread
            thread_check = await conn.fetchval(
                "SELECT user_id FROM chat_threads WHERE id = $1",
                thread_id
            )

            if not thread_check:
                raise NotFoundError(f"Thread {thread_id} not found")

            if thread_check != context.user_id:
                raise NotFoundError(f"Thread {thread_id} not found")  # Don't leak info

            # Build query with pagination
            order_clause = "DESC" if order == "desc" else "ASC"

            if after:
                # Pagination: Get messages after cursor
                query = f"""
                SELECT id, thread_id, role, content, created_at
                FROM chat_messages
                WHERE thread_id = $1
                  AND id > $2
                ORDER BY created_at {order_clause}
                LIMIT $3
                """
                rows = await conn.fetch(query, thread_id, int(after), limit + 1)
            else:
                # First page
                query = f"""
                SELECT id, thread_id, role, content, created_at
                FROM chat_messages
                WHERE thread_id = $1
                ORDER BY created_at {order_clause}
                LIMIT $2
                """
                rows = await conn.fetch(query, thread_id, limit + 1)

            # Check if there are more results
            has_more = len(rows) > limit
            messages_data = rows[:limit]

            # Convert to ThreadItem objects
            items = []
            for row in messages_data:
                # Deserialize JSON content
                content_data = json.loads(row['content'])

                # Reconstruct proper ChatKit content objects
                content = _reconstruct_content(content_data, row['role'])

                if row['role'] == 'user':
                    items.append(UserMessageItem(
                        id=str(row['id']),
                        thread_id=row['thread_id'],
                        created_at=row['created_at'],
                        content=content,
                        inference_options=InferenceOptions()
                    ))
                elif row['role'] == 'assistant':
                    items.append(AssistantMessageItem(
                        id=str(row['id']),
                        thread_id=row['thread_id'],
                        created_at=row['created_at'],
                        content=content
                    ))

            # Determine next cursor
            next_after = items[-1].id if has_more and items else None

            return Page(
                data=items,
                has_more=has_more,
                after=next_after
            )

    # T047: Implement add_thread_item
    async def add_thread_item(
        self, thread_id: str, item: ThreadItem, context: RequestContext
    ) -> None:
        """Add a message to a thread.

        Args:
            thread_id: Thread identifier
            item: Message item (UserMessageItem or AssistantMessageItem)
            context: Request context (user isolation via thread ownership)

        Raises:
            NotFoundError: Thread not found or doesn't belong to user
        """
        pool = await self._get_pool()

        async with pool.acquire() as conn:
            # Verify thread ownership
            thread_check = await conn.fetchval(
                "SELECT user_id FROM chat_threads WHERE id = $1",
                thread_id
            )

            if not thread_check or thread_check != context.user_id:
                raise NotFoundError(f"Thread {thread_id} not found")

            # Determine role and content based on item type
            if isinstance(item, UserMessageItem):
                role = 'user'
                # Serialize content list to JSON
                content = json.dumps([c.model_dump() if hasattr(c, 'model_dump') else c for c in item.content])
            elif isinstance(item, AssistantMessageItem):
                role = 'assistant'
                # Serialize content list to JSON
                content = json.dumps([c.model_dump() if hasattr(c, 'model_dump') else c for c in item.content])
            else:
                role = 'system'
                content = str(item)

            # Insert message
            await conn.execute(
                """
                INSERT INTO chat_messages (thread_id, role, content, created_at)
                VALUES ($1, $2, $3, $4)
                """,
                thread_id,
                role,
                content,
                item.created_at
            )

            # Update thread's updated_at timestamp
            await conn.execute(
                """
                UPDATE chat_threads
                SET updated_at = $2
                WHERE id = $1
                """,
                thread_id,
                item.created_at
            )

            logger.debug(f"Added {role} message to thread {thread_id}")

    # T048: Implement save_item
    async def save_item(
        self, item: ThreadItem, context: RequestContext
    ) -> None:
        """Save or update a message item.

        Args:
            item: Message item to save
            context: Request context

        Note:
            Updates existing message if ID exists, creates new if not.
            Thread ownership verified before update.
        """
        pool = await self._get_pool()

        async with pool.acquire() as conn:
            # Check if message exists
            existing = await conn.fetchrow(
                """
                SELECT m.id, t.user_id
                FROM chat_messages m
                JOIN chat_threads t ON m.thread_id = t.id
                WHERE m.id = $1
                """,
                int(item.id)
            )

            if existing:
                # Verify ownership
                if existing['user_id'] != context.user_id:
                    raise NotFoundError(f"Message {item.id} not found")

                # Update existing message
                # Serialize content list to JSON
                content = json.dumps([c.model_dump() if hasattr(c, 'model_dump') else c for c in item.content])
                await conn.execute(
                    """
                    UPDATE chat_messages
                    SET content = $2
                    WHERE id = $1
                    """,
                    int(item.id),
                    content
                )
                logger.debug(f"Updated message {item.id}")
            else:
                logger.warning(f"Attempted to save non-existent message {item.id}")

    async def load_item(
        self, item_id: str, context: RequestContext
    ) -> ThreadItem:
        """Load a single message by ID.

        Args:
            item_id: Message identifier
            context: Request context for user isolation

        Returns:
            ThreadItem: Message item

        Raises:
            NotFoundError: Message not found or doesn't belong to user's threads
        """
        pool = await self._get_pool()

        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                SELECT m.id, m.thread_id, m.role, m.content, m.created_at
                FROM chat_messages m
                JOIN chat_threads t ON m.thread_id = t.id
                WHERE m.id = $1 AND t.user_id = $2
                """,
                int(item_id),
                context.user_id
            )

            if not row:
                raise NotFoundError(f"Message {item_id} not found")

            # Deserialize JSON content
            content_data = json.loads(row['content'])

            # Reconstruct proper ChatKit content objects
            content = _reconstruct_content(content_data, row['role'])

            if row['role'] == 'user':
                return UserMessageItem(
                    id=str(row['id']),
                    thread_id=row['thread_id'],
                    created_at=row['created_at'],
                    content=content,
                    inference_options=InferenceOptions()
                )
            else:
                return AssistantMessageItem(
                    id=str(row['id']),
                    thread_id=row['thread_id'],
                    created_at=row['created_at'],
                    content=content
                )

    # T049: Implement delete_thread
    async def delete_thread(
        self, thread_id: str, context: RequestContext
    ) -> None:
        """Delete a thread and all its messages (CASCADE).

        Args:
            thread_id: Thread identifier
            context: Request context for user isolation

        Note:
            CASCADE DELETE automatically removes all messages.
            Only thread owner can delete.
        """
        pool = await self._get_pool()

        async with pool.acquire() as conn:
            result = await conn.execute(
                """
                DELETE FROM chat_threads
                WHERE id = $1 AND user_id = $2
                """,
                thread_id,
                context.user_id
            )

            # Check if anything was deleted
            if result == "DELETE 0":
                raise NotFoundError(f"Thread {thread_id} not found")

            logger.info(f"Deleted thread {thread_id} for user {context.user_id}")

    async def delete_thread_item(
        self, item_id: str, context: RequestContext
    ) -> None:
        """Delete a single message.

        Args:
            item_id: Message identifier
            context: Request context for user isolation

        Note:
            User must own the thread containing the message.
        """
        pool = await self._get_pool()

        async with pool.acquire() as conn:
            result = await conn.execute(
                """
                DELETE FROM chat_messages
                WHERE id = $1
                AND thread_id IN (
                    SELECT id FROM chat_threads WHERE user_id = $2
                )
                """,
                int(item_id),
                context.user_id
            )

            if result == "DELETE 0":
                raise NotFoundError(f"Message {item_id} not found")

            logger.debug(f"Deleted message {item_id}")

    # Attachment methods (not implemented in Phase 5, using in-memory fallback)

    async def save_attachment(
        self, attachment: Attachment, context: RequestContext
    ) -> None:
        """Save attachment (not implemented in Phase 5)."""
        logger.warning("Attachments not yet supported in NeonPostgresStore")

    async def load_attachment(
        self, attachment_id: str, context: RequestContext
    ) -> Attachment:
        """Load attachment (not implemented in Phase 5)."""
        raise NotFoundError(f"Attachment {attachment_id} not found (not implemented)")

    async def delete_attachment(
        self, attachment_id: str, context: RequestContext
    ) -> None:
        """Delete attachment (not implemented in Phase 5)."""
        logger.warning(f"Attempted to delete attachment {attachment_id} (not implemented)")
