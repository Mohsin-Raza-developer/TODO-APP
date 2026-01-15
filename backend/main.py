"""
FastAPI application initialization with CORS and global exception handlers.

This module provides:
- FastAPI app instance
- CORS middleware configuration for Next.js frontend
- Global exception handlers for consistent error responses
- API router registration
"""

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from config import settings
from schemas.error import ErrorResponse
import logging


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Initialize FastAPI application
app = FastAPI(
    title="Todo API - Multi-User REST API",
    description="REST API for multi-user todo application with Better Auth JWT authentication",
    version="1.0.0",
)


# CORS Configuration
# Allows Next.js frontend to make cross-origin requests to the API
origins = [
    "http://localhost:3000",  # Next.js dev server
    "http://localhost:3001",  # Alternative dev port
    settings.frontend_url,  # Production frontend URL from environment
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,  # Required for cookies
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)


# Global Exception Handlers
# Provides consistent error response format across all endpoints


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """
    Handle HTTPException and return standardized ErrorResponse.

    Args:
        request: FastAPI request object
        exc: HTTPException raised by endpoint or dependency

    Returns:
        JSONResponse: Standardized error response with appropriate status code

    Example:
        HTTPException(status_code=401, detail="Token expired")
        → {"error": "unauthorized", "message": "Token expired"}
    """
    error_type = {
        400: "validation_error",
        401: "unauthorized",
        403: "forbidden",
        404: "not_found",
        500: "internal_server_error",
    }.get(exc.status_code, "error")

    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(error=error_type, message=exc.detail).model_dump(),
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Handle unexpected exceptions and return sanitized error response.

    Args:
        request: FastAPI request object
        exc: Unhandled exception

    Returns:
        JSONResponse: Generic error response (doesn't expose internal details)

    Notes:
        - Logs full exception server-side for debugging
        - Returns sanitized message to client for security
        - Constitutional requirement (Principle V): "Human-readable error messages"
    """
    # Log full error server-side
    logger.error(f"Unhandled exception: {exc}", exc_info=True)

    # Return sanitized error to client
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            error="internal_server_error",
            message="An unexpected error occurred",
        ).model_dump(),
    )


# API Router Registration
from api.tasks import router as tasks_router

app.include_router(tasks_router, prefix="/api", tags=["Tasks"])


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "message": "Todo REST API is running"}
