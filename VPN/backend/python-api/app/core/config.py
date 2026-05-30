from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "SecureVPN"
    DATABASE_URL: str = "sqlite:///./vpn.db"
    JWT_SECRET: str = "change-this-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    REDIS_URL: str = "redis://localhost:6379"
    CORS_ORIGINS: List[str] = ["*"]
    GO_PROXY_URL: str = "http://go-proxy:8080"
    WS_TUNNEL_URL: str = "http://node-tunnel:3001"

    class Config:
        env_file = ".env"


settings = Settings()
