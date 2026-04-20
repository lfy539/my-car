from beanie import Document
from pydantic import Field

from app.core.utils import now_ts


class UserFavorite(Document):
    userId: str
    targetType: str
    targetId: str
    createdAt: int = Field(default_factory=now_ts)

    class Settings:
        name = "user_favorites"
