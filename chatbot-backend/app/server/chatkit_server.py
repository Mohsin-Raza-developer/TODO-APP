"""Custom ChatKit server implementation with OpenAI Agents integration.

This module provides the ChatbotServer class that extends ChatKitServer
to coordinate agent responses with streaming support.
"""

from collections.abc import AsyncIterator
import logging

from agents import Runner
from chatkit.server import ChatKitServer
from chatkit.errors import CustomStreamError
from chatkit.types import (
    ThreadMetadata,
    UserMessageItem,
    ThreadStreamEvent,
    ThreadItemAddedEvent,
    ThreadItemUpdatedEvent,
    ThreadItemDoneEvent,
)
from openai import RateLimitError
import re
from chatkit.agents import AgentContext, stream_agent_response, simple_to_agent_input
from app.server.gemini_model_for_agent import gemini_config

from app.models.request_context import RequestContext
from app.utils.agent_factory import create_agent_for_user

logger = logging.getLogger(__name__)


class ChatbotServer(ChatKitServer[RequestContext]):
    """Custom ChatKit server with Agent-powered responses.

    This server integrates OpenAI Agents SDK to generate streaming responses
    to user messages. It creates per-request Agent instances with user-specific
    instructions and coordinates streaming output.
    """

    async def respond(
        self,
        thread: ThreadMetadata,
        input_message: UserMessageItem | None,
        context: RequestContext,
        gemini_config = gemini_config
    ) -> AsyncIterator[ThreadStreamEvent]:
        """Generate assistant response for user message.

        This method is called by ChatKit for each user message. It:
        1. Loads thread history (last 20 messages)
        2. Creates user-specific Agent instance
        3. Runs agent with streaming enabled
        4. Yields ThreadStreamEvents back to frontend

        Args:
            thread: Thread metadata
            input_message: User's message (None for non-message operations)
            context: Request context with user_id and token

        Yields:
            ThreadStreamEvent: Streaming events (content deltas, done events, etc.)
        """
        logger.info(
            f"Processing message for user={context.user_id} "
            f"thread={thread.id}"
        )

        # Load thread history for context (last 20 messages)
        items_page = await self.store.load_thread_items(
            thread.id,
            after=None,
            limit=20,
            order="asc",  # Chronological order for agent context
            context=context,
        )

        logger.info(
            f"Loaded {len(items_page.data)} messages from thread history"
        )

        # Create agent with user-specific instructions
        agent = await create_agent_for_user(
            user_id=context.user_id,
            token=context.token
        )

        # Prepare input items for agent (history + new message)
        input_items = items_page.data
        if input_message:
            input_items = input_items + [input_message]

        # Convert ChatKit items to Agent SDK format using built-in converter
        # This properly handles all item types including database-loaded messages
        converted_items = await simple_to_agent_input(input_items)

        # Create AgentContext for streaming
        agent_context = AgentContext(
            thread=thread,
            store=self.store,
            request_context=context,
            previous_response_id=None,  # Thread model doesn't have previous_response_id field
        )

        # Run agent with streaming
        logger.info("Starting agent execution with streaming")
        result = Runner.run_streamed(agent, converted_items, context=agent_context, run_config=gemini_config)

        # Stream events back to frontend
        # If the upstream model doesn't provide a stable item_id, it can default to "__fake_id__",
        # which causes the UI to overwrite prior assistant messages. Remap it to a unique id per response.
        fake_id: str | None = None

        def remap_fake_id(item_id: str) -> str:
            nonlocal fake_id
            if item_id != "__fake_id__":
                return item_id
            if fake_id is None:
                fake_id = self.store.generate_item_id("message", thread, context)
            return fake_id

        event_count = 0
        try:
            async for event in stream_agent_response(agent_context, result):
                if isinstance(event, ThreadItemAddedEvent):
                    event.item.id = remap_fake_id(event.item.id)
                elif isinstance(event, ThreadItemUpdatedEvent):
                    event.item_id = remap_fake_id(event.item_id)
                elif isinstance(event, ThreadItemDoneEvent):
                    event.item.id = remap_fake_id(event.item.id)

                event_count += 1
                yield event
        except RateLimitError as e:
            error_msg = str(e)
            retry_info = ""
            match = re.search(r"retry in (\d+\.?\d*)s", error_msg, re.IGNORECASE)
            if match:
                try:
                    retry_seconds = float(match.group(1))
                    if retry_seconds >= 60:
                        retry_minutes = int(retry_seconds / 60)
                        retry_info = f" Please try again in {retry_minutes} minutes."
                    else:
                        retry_info = " Please try again in a few seconds."
                except Exception:
                    pass
            raise CustomStreamError(
                message=f"AI quota exceeded.{retry_info}",
                allow_retry=True,
            )

        logger.info(
            f"Completed streaming {event_count} events for "
            f"user={context.user_id} thread={thread.id}"
        )
