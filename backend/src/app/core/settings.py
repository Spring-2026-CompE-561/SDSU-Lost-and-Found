from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "SDSU Lost and Found"
    app_version: str = "1.0.0"

    secret_key: str = Field(
        default="your_secret_key",
        description="The secret key for JWT",
    )

    algorithm: str = Field(
        default="HS256",
        description="The algorithm used for JWT",
    )

    access_token_expire_minutes: int = Field(
        default=15,
        description="Access token expiration time in minutes",
    )

    refresh_token_expire_days: int = Field(
        default=7,
        description="Refresh token expiration time in days",
    )

    database_url: str = Field(
        default="sqlite:///./sdsu_lost_and_found.db",
        description="Database connection URL",
    )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()