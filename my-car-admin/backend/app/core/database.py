from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings
from app.models.banner import Banner
from app.models.admin import Admin
from app.models.brand import Brand
from app.models.sound import Sound
from app.models.user import User
from app.models.user_event import UserEvent
from app.models.user_favorite import UserFavorite
from app.models.wallpaper import Wallpaper

mongo_client: AsyncIOMotorClient | None = None


async def init_db() -> None:
    global mongo_client
    mongo_client = AsyncIOMotorClient(settings.MONGO_URI)
    database = mongo_client[settings.MONGO_DB_NAME]
    await init_beanie(
        database=database,
        document_models=[
            Admin,
            Brand,
            Banner,
            Wallpaper,
            Sound,
            User,
            UserFavorite,
            UserEvent,
        ],
    )


async def close_db() -> None:
    global mongo_client
    if mongo_client:
        mongo_client.close()
        mongo_client = None
