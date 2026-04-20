from beanie import Document
from pydantic import Field

from app.core.utils import now_ts


class UserEvent(Document):
    userId: str
    eventType: str
    targetType: str = ""
    targetId: str = ""
    ext: dict = Field(default_factory=dict)
    createdAt: int = Field(default_factory=now_ts)

    class Settings:
        name = "user_events"
