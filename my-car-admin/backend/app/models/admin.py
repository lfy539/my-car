from beanie import Document, Indexed
from pydantic import Field

from app.core.utils import now_ts


class Admin(Document):
    username: Indexed(str, unique=True)
    password_hash: str
    nickname: str = "超级管理员"
    avatar: str = ""
    role: str = "admin"
    status: int = 1
    last_login_at: int | None = None
    created_at: int = Field(default_factory=now_ts)
    updated_at: int = Field(default_factory=now_ts)

    class Settings:
        name = "admins"
