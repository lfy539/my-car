from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    APP_NAME: str = "my-car-admin-api"
    ENV: str = "dev"
    API_V1_PREFIX: str = "/api/v1"
    CORS_ORIGINS: str = "http://localhost:5174,http://127.0.0.1:5174"

    JWT_SECRET_KEY: str = "replace-with-strong-secret"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24

    MONGO_URI: str = "mongodb://127.0.0.1:27017"
    MONGO_DB_NAME: str = "my_car_admin"
    MEDIA_BASE_URL: str = "http://127.0.0.1:8000/media"
    UPLOAD_DIR: str = "uploads"

    ADMIN_INIT_USERNAME: str = "admin"
    ADMIN_INIT_PASSWORD: str = "admin123456"


settings = Settings()
