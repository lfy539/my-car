from pydantic import BaseModel, Field


class PageResponse(BaseModel):
    list: list[dict]
    total: int
    page: int
    pageSize: int


class BrandIn(BaseModel):
    name: str = Field(min_length=2, max_length=20)
    logo: str = ""
    sort: int = 0
    status: int = 1


class BannerIn(BaseModel):
    imageUrl: str
    linkType: str = "none"
    linkUrl: str = ""
    targetId: str = ""
    title: str = ""
    sort: int = 0
    status: int = 1


class WallpaperIn(BaseModel):
    title: str = Field(min_length=2, max_length=50)
    coverUrl: str
    originUrl: str
    brandId: str
    modelId: str = ""
    tags: list[str] = Field(default_factory=list)
    resolution: str = "1080x1920"
    fileSize: int = 0
    status: int = 1
    publishAt: int | None = None
    hotScore: int = 0


class SoundIn(BaseModel):
    title: str = Field(min_length=2, max_length=50)
    coverUrl: str
    audioUrl: str
    brandId: str
    modelId: str = ""
    soundType: str = "提示音"
    duration: float = 0
    bitrate: int = 320
    fileSize: int = 0
    status: int = 1
    publishAt: int | None = None
    hotScore: int = 0
