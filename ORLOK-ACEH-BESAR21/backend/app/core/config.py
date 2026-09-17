import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

PROJECT_ROOT = Path(__file__).resolve().parents[2]


def _sqlite_url(value: str) -> str:
    if value.startswith("file:"):
        path = Path(value[5:])
        if not path.is_absolute():
            path = PROJECT_ROOT / path
        return f"sqlite+aiosqlite:///{path}"
    if value.startswith("sqlite:///"):
        path = Path(value[len("sqlite:///"):])
        if not path.is_absolute():
            path = PROJECT_ROOT / path
        return f"sqlite+aiosqlite:///{path}"
    return value.replace("postgres://", "postgresql+asyncpg://")


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str = "sqlite+aiosqlite:///./dev.db"
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "") or os.urandom(32).hex()
    JWT_ACCESS_SECRET: str = ""
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    JWT_ACCESS_EXPIRY: str = ""
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024
    ENVIRONMENT: str = "development"


settings = Settings()
settings.DATABASE_URL = _sqlite_url(settings.DATABASE_URL)
settings.UPLOAD_DIR = str(Path(settings.UPLOAD_DIR).resolve())
if not settings.JWT_SECRET_KEY:
    settings.JWT_SECRET_KEY = settings.JWT_ACCESS_SECRET or settings.JWT_SECRET_KEY
if settings.ACCESS_TOKEN_EXPIRE_MINUTES <= 0 and settings.JWT_ACCESS_EXPIRY:
    value = settings.JWT_ACCESS_EXPIRY.strip().lower()
    multiplier = {"d": 1440, "h": 60, "m": 1}.get(value[-1])
    if multiplier:
        settings.ACCESS_TOKEN_EXPIRE_MINUTES = int(value[:-1]) * multiplier
