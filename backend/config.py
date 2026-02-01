"""
Application configuration management using Pydantic BaseSettings.

This module provides environment-based configuration for the FastAPI application,
loading values from environment variables with validation and type safety.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.

    All settings are loaded from .env file or system environment variables.
    Type hints provide automatic validation and conversion.

    Attributes:
        database_url: PostgreSQL connection string (must use pooled endpoint with -pooler suffix)
        better_auth_secret: JWT signing secret (must match frontend Better Auth secret)
        frontend_url: Frontend origin for CORS whitelist (e.g., http://localhost:3000)
    """

    database_url: str
    better_auth_secret: str
    frontend_url: str = "http://localhost:3000"  # Default for development

    class Config:
        """Pydantic configuration."""

        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False  # Allow DATABASE_URL or database_url


@lru_cache()
def get_settings() -> Settings:
    """
    Get application settings (cached for performance).

    Returns:
        Settings: Application configuration instance

    Note:
        Uses lru_cache to avoid reading .env file on every call.
        Settings are loaded once and reused throughout the application.
    """
    return Settings()


# Convenience instance for direct import
settings = get_settings()

