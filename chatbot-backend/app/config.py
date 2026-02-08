"""Configuration management using Pydantic Settings.

This module loads and validates environment variables required for the chatbot backend.
All settings are type-checked and validated at startup.
"""

from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Required settings
    database_url: str = Field(..., env="DATABASE_URL")
    openai_api_key: str = Field(..., env="OPENAI_API_KEY")
    better_auth_secret: str = Field(..., env="BETTER_AUTH_SECRET")

    # Optional settings with defaults
    mcp_server_url: str = Field(
        default="http://localhost:3000/mcp",
        env="MCP_SERVER_URL"
    )
    cors_origins: str = Field(
        default="http://localhost:3000,http://localhost:3001",
        env="CORS_ORIGINS"
    )
    port: int = Field(default=8001, env="PORT")
    host: str = Field(default="0.0.0.0", env="HOST")
    openai_timeout: int = Field(default=30, env="OPENAI_TIMEOUT")
    mcp_timeout: int = Field(default=10, env="MCP_TIMEOUT")

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8"
    }

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


# Global settings instance
settings = Settings()
