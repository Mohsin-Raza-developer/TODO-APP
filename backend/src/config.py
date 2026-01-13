"""
Configuration module for environment variables and database connection.

This module centralizes environment variable loading and provides
validated configuration for the application.
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


def get_database_url() -> str:
    """
    Get DATABASE_URL from environment.

    Returns:
        str: PostgreSQL connection string (pooled endpoint required)

    Raises:
        ValueError: If DATABASE_URL is not set
    """
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise ValueError(
            "DATABASE_URL environment variable not set. "
            "Please create a .env file with your Neon PostgreSQL connection string."
        )
    return database_url


def get_better_auth_secret() -> str:
    """
    Get BETTER_AUTH_SECRET from environment.

    Returns:
        str: JWT secret key for Better Auth token verification

    Raises:
        ValueError: If BETTER_AUTH_SECRET is not set
    """
    secret = os.getenv("BETTER_AUTH_SECRET")
    if not secret:
        raise ValueError(
            "BETTER_AUTH_SECRET environment variable not set. "
            "Please create a .env file with your Better Auth secret key."
        )
    return secret
