from beanie import Document
from pydantic import Field

from app.core.utils import now_ts


class Banner(Document):
    imageUrl: str
    linkType: str = "none"
    linkUrl: str = ""
    targetId: str = ""
    title: str = ""
    status: int = 1
    sort: int = 0
    createdAt: int = Field(default_factory=now_ts)
    updatedAt: int = Field(default_factory=now_ts)

    class Settings:
        name = "banners"
