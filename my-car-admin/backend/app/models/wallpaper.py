from beanie import Document
from pydantic import Field

from app.core.utils import now_ts


class Wallpaper(Document):
    title: str
    coverUrl: str
    originUrl: str
    brandId: str
    modelId: str = ""
    tags: list[str] = Field(default_factory=list)
    resolution: str = "1080x1920"
    fileSize: int = 0
    status: int = 1
    publishAt: int = Field(default_factory=now_ts)
    hotScore: int = 0
    downloadCount: int = 0
    favoriteCount: int = 0
    createdAt: int = Field(default_factory=now_ts)
    updatedAt: int = Field(default_factory=now_ts)

    class Settings:
        name = "wallpapers"
