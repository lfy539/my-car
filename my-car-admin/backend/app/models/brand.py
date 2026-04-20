from beanie import Document
from pydantic import Field

from app.core.utils import now_ts


class Brand(Document):
    name: str
    logo: str = ""
    sort: int = 0
    status: int = 1
    createdAt: int = Field(default_factory=now_ts)
    updatedAt: int = Field(default_factory=now_ts)

    class Settings:
        name = "brands"
