"""
Shared FastAPI dependencies for authentication and authorization.

This module provides reusable dependencies for:
- Better Auth session verification (via database)
- User ownership verification
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Annotated, Dict, Any
from sqlmodel import Session, select, text
from database import get_session
from datetime import datetime
import logging


# HTTPBearer security scheme for extracting session token from Authorization header
security = HTTPBearer()
logger = logging.getLogger(__name__)


async def verify_session_token(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    session: Annotated[Session, Depends(get_session)]
) -> Dict[str, Any]:
    """
    Verify Better Auth session token from database.

    This dependency extracts the session token from the Authorization header
    and validates it against the Better Auth session table in the database.

    Args:
        credentials: HTTPAuthorizationCredentials from Authorization header
        session: Database session

    Returns:
        Dict[str, Any]: Session data containing userId and other fields

    Raises:
        HTTPException: 401 if session is invalid or expired

    Usage:
        @app.get("/api/{user_id}/tasks")
        async def list_tasks(
            session_data: Annotated[dict, Depends(verify_session_token)]
        ):
            user_id = session_data.get("userId")
            ...
    """
    token = credentials.credentials

    logger.info(f"Received token: {token[:50]}..." if len(token) > 50 else f"Received token: {token}")

    try:
        # Query Better Auth session table
        # Better Auth creates a 'session' table with: id, token, userId, expiresAt, etc.
        query = text(
            """
            SELECT "userId", "expiresAt", id, token
            FROM session
            WHERE token = :token
            """
        ).bindparams(token=token)
        result = session.exec(query).first()

        logger.info(f"Database query result: {result}")

        if not result:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

        # Unpack result
        user_id, expires_at, session_id, session_token = result

        # Check if session is expired
        if expires_at:
            # Convert string to datetime if needed
            if isinstance(expires_at, str):
                expires_at = datetime.fromisoformat(expires_at.replace('Z', '+00:00'))

            if datetime.utcnow() > expires_at.replace(tzinfo=None):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Session expired"
                )

        # Return session data
        return {
            "userId": user_id,
            "sessionId": session_id,
            "token": session_token,
            "expiresAt": expires_at
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Session verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )


async def verify_email_verified(
    session_data: Annotated[Dict[str, Any], Depends(verify_session_token)],
    session: Annotated[Session, Depends(get_session)]
) -> Dict[str, Any]:
    """
    Best-effort verification gate for protected endpoints.

    Reads email verification state from Better Auth user table ("user"."emailVerified").
    If state is explicitly false, access is denied. If metadata is unavailable,
    this dependency falls back without blocking to preserve compatibility.
    """
    user_id = session_data.get("userId")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing userId in session"
        )

    try:
        query = text(
            """
            SELECT "emailVerified"
            FROM "user"
            WHERE id = :user_id
            """
        ).bindparams(user_id=user_id)
        result = session.exec(query).first()

        if result is None:
            logger.warning(f"No Better Auth user record found for userId={user_id}")
            return session_data

        email_verified = bool(result[0] if isinstance(result, tuple) else result)
        if not email_verified:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Email verification required"
            )

        session_data["emailVerified"] = True
        return session_data
    except HTTPException:
        raise
    except Exception as exc:
        logger.warning(
            "Email verification lookup skipped due to backend compatibility issue: %s",
            exc
        )
        return session_data


async def verify_user_ownership(
    user_id: str, session_data: Annotated[Dict[str, Any], Depends(verify_email_verified)]
) -> str:
    """
    Verify that the user_id in URL matches authenticated user from session.

    This dependency combines Better Auth session verification with user_id validation,
    ensuring the authenticated user can only access their own resources.

    Args:
        user_id: User ID from URL path parameter
        session_data: Session data from verify_session_token dependency

    Returns:
        str: Validated user_id

    Raises:
        HTTPException: 401 if user_id missing from session
        HTTPException: 403 if user_id doesn't match session

    Usage:
        @app.get("/api/{user_id}/tasks")
        async def list_tasks(
            user_id: Annotated[str, Depends(verify_user_ownership)]
        ):
            # user_id is verified to match authenticated user
            ...

    Note:
        Constitutional requirement (Principle VII): "Backend MUST verify that
        requested resource ID belongs to authenticated user ID"
    """
    # Better Auth uses "userId" (camelCase), not "user_id"
    session_user_id = session_data.get("userId")

    if not session_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing userId in session"
        )

    if session_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="User ID mismatch"
        )

    return user_id
