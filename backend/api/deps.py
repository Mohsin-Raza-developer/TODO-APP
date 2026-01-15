"""
Shared FastAPI dependencies for authentication and authorization.

This module provides reusable dependencies for:
- JWT token verification
- User ownership verification
"""

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Annotated, Dict, Any
from core.security import decode_jwt_token


# HTTPBearer security scheme for extracting JWT from Authorization header
security = HTTPBearer()


async def verify_jwt_token(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)]
) -> Dict[str, Any]:
    """
    Verify JWT token and extract payload.

    This dependency extracts the JWT token from the Authorization header,
    verifies its signature using BETTER_AUTH_SECRET, and returns the payload.

    Args:
        credentials: HTTPAuthorizationCredentials from Authorization header

    Returns:
        Dict[str, Any]: Decoded token payload containing user_id and other claims

    Raises:
        HTTPException: 401 if token is invalid or expired

    Usage:
        @app.get("/api/{user_id}/tasks")
        async def list_tasks(
            token_payload: Annotated[dict, Depends(verify_jwt_token)]
        ):
            user_id = token_payload.get("user_id")
            ...
    """
    try:
        payload = decode_jwt_token(credentials.credentials)
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )


async def verify_user_ownership(
    user_id: str, token_payload: Annotated[Dict[str, Any], Depends(verify_jwt_token)]
) -> str:
    """
    Verify that the user_id in URL matches authenticated user.

    This dependency combines JWT verification with user_id validation,
    ensuring the authenticated user can only access their own resources.

    Args:
        user_id: User ID from URL path parameter
        token_payload: Decoded JWT payload from verify_jwt_token dependency

    Returns:
        str: Validated user_id

    Raises:
        HTTPException: 401 if user_id missing from token
        HTTPException: 403 if user_id doesn't match token

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
    token_user_id = token_payload.get("userId")

    if not token_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing userId in token"
        )

    if token_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="User ID mismatch"
        )

    return user_id
