from beanie import Document
from pydantic import Field

from app.core.utils import now_ts


class Sound(Document):
    title: str
    coverUrl: str
    audioUrl: str
    brandId: str
    modelId: str = ""
    soundType: str = "提示音"
    duration: float = 0
    bitrate: int = 320
    fileSize: int = 0
    status: int = 1
    publishAt: int = Field(default_factory=now_ts)
    hotScore: int = 0
    playCount: int = 0
    downloadCount: int = 0
    favoriteCount: int = 0
    createdAt: int = Field(default_factory=now_ts)
    updatedAt: int = Field(default_factory=now_ts)

    class Settings:
        name = "sounds"
