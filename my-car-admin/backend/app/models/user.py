from beanie import Document, Indexed
from pydantic import Field

from app.core.utils import now_ts


class User(Document):
    openId: Indexed(str, unique=True)
    unionId: str = ""
    nickname: str = ""
    avatar: str = ""
    phone: str = ""
    status: int = 1
    lastLoginAt: int | None = None
    createdAt: int = Field(default_factory=now_ts)
    updatedAt: int = Field(default_factory=now_ts)

    class Settings:
        name = "users"
