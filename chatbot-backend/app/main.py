"""FastAPI application entry point for chatbot backend.

This module initializes the FastAPI application with CORS middleware,
health check endpoint, and the main ChatKit endpoint.
"""

import logging
import uuid
from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import FastAPI, Request, Depends, Security, HTTPException
from fastapi.responses import StreamingResponse, Response, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from chatkit.server import StreamingResult
from sqlalchemy.exc import SQLAlchemyError
from httpx import HTTPStatusError
from openai import RateLimitError

from app.utils.logging import setup_logging, request_id_var
from app.config import settings
from app.auth.jwt import verify_token
from app.models.request_context import RequestContext
from app.store.neon_store import NeonPostgresStore
from app.server.chatkit_server import ChatbotServer
from app.utils.errors import ChatbotError, AgentError, MCPError, StorageError, QuotaExceededError

# Setup structured logging
setup_logging()
logger = logging.getLogger(__name__)

# Initialize ChatKit server (global, shared across requests)
store = NeonPostgresStore()
chatkit_server = ChatbotServer(store=store)
bearer_scheme = HTTPBearer()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup/shutdown events."""
    # Startup
    logger.info("Starting chatbot backend")
    logger.info(f"Port: {settings.port}")
    logger.info(f"MCP Server: {settings.mcp_server_url}")
    # Avoid logging credentials; only show host/db presence.
    if settings.database_url:
        try:
            db_host = settings.database_url.split("@", 1)[1]
        except Exception:
            db_host = "configured"
    else:
        db_host = "configured"
    logger.info(f"Database: {db_host}")

    # Validate required settings
    required = [
        ("DATABASE_URL", settings.database_url),
        ("OPENAI_API_KEY", settings.openai_api_key),
        ("BETTER_AUTH_SECRET", settings.better_auth_secret),
    ]
    for name, value in required:
        if not value:
            raise RuntimeError(f"Missing required environment variable: {name}")

    logger.info("Configuration validated successfully")

    yield

    # Shutdown
    logger.info("Shutting down chatbot backend")
    await store.close()


app = FastAPI(
    title="Chatbot Backend",
    description="AI chatbot backend with OpenAI Agents and ChatKit MCP Integration",
    version="0.1.0",
    lifespan=lifespan
)

# Add Request ID Middleware
@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    """
    Generates a unique request ID for each request and sets it in a context var.
    """
    request_id = str(uuid.uuid4())
    token = request_id_var.set(request_id)
    
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    
    request_id_var.reset(token)
    return response

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Next.js frontend (both ports)
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type", "Authorization", "X-Request-ID"],
)

# Custom Exception Handler
@app.exception_handler(ChatbotError)
async def chatbot_exception_handler(request: Request, exc: ChatbotError):
    """Handles all custom chatbot errors and returns a standardized JSON response."""
    logger.error(
        f"ChatbotError caught: {exc.__class__.__name__} - Status: {exc.status_code} - Message: {exc.message}",
        exc_info=True
    )
    return JSONResponse(
        status_code=exc.status_code,
        content=exc.to_dict(),
    )

@app.get("/health")
async def health():
    """Health check endpoint.

    Returns:
        dict: Status object indicating service health
    """
    return {"status": "healthy"}


@app.post("/api/chatkit", dependencies=[Depends(bearer_scheme)])
async def chatkit_endpoint(
    request: Request,
    credentials: Annotated[HTTPAuthorizationCredentials, Security(bearer_scheme)],
):
    """ChatKit protocol endpoint for AI chat interactions.
    """
    user_id = await verify_token(f"Bearer {credentials.credentials}")
    context = RequestContext(
        user_id=user_id,
        token=f"Bearer {credentials.credentials}",
        request=request
    )

    logger.info(f"ChatKit request from user={user_id}")

    body = await request.body()
    if not body:
        logger.error(f"Empty request body from user={user_id}")
        raise HTTPException(status_code=400, detail="Request body cannot be empty.")

    try:
        result = await chatkit_server.process(body, context)
        if isinstance(result, StreamingResult):
            return StreamingResponse(result, media_type="text/event-stream")
        else:
            return Response(content=result.json, media_type="application/json")
    except RateLimitError as e:
        # Extract retry time if available
        error_msg = str(e)
        retry_info = ""
        if "retry in" in error_msg.lower():
            try:
                # Extract retry time from error message
                import re
                match = re.search(r'retry in (\d+\.?\d*)s', error_msg)
                if match:
                    retry_seconds = float(match.group(1))
                    retry_minutes = int(retry_seconds / 60)
                    if retry_minutes > 0:
                        retry_info = f" Please try again in {retry_minutes} minutes."
                    else:
                        retry_info = f" Please try again in a few seconds."
            except:
                pass

        raise QuotaExceededError(
            message=f"AI service quota exceeded.{retry_info} If this continues, please check your API plan.",
            details=str(e)
        )
    except SQLAlchemyError as e:
        raise StorageError("Could not process your request due to a database issue.", details=str(e))
    except HTTPStatusError as e:
        raise MCPError("There was an issue communicating with a required service.", details=str(e))
    except Exception as e:
        if "ValidationError" in str(type(e).__name__):
            raise HTTPException(status_code=400, detail=f"Invalid message format: {e}")
        raise AgentError("An unexpected error occurred while processing your request.", details=str(e))
