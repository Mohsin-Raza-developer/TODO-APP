"""
JWT token verification utilities using PyJWT.

This module provides utilities for verifying JWT tokens issued by Better Auth.
"""

import jwt
from config import settings
from typing import Dict, Any


def decode_jwt_token(token: str) -> Dict[str, Any]:
    """
    Decode and verify a JWT token.

    Args:
        token: JWT token string (without "Bearer " prefix)

    Returns:
        Dict[str, Any]: Decoded token payload containing user_id and other claims

    Raises:
        jwt.ExpiredSignatureError: If token has expired
        jwt.InvalidTokenError: If token is malformed or signature invalid

    Example:
        payload = decode_jwt_token("eyJhbGciOiJIUzI1NiIs...")
        user_id = payload.get("user_id")
    """
    payload = jwt.decode(
        token,
        settings.better_auth_secret,
        algorithms=["HS256"],
    )
    return payload
