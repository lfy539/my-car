from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import close_db, init_db
from app.core.security import get_password_hash
from app.models.admin import Admin


@asynccontextmanager
async def lifespan(_: FastAPI):
    await init_db()

    # Initialize a default admin once for first boot.
    admin = await Admin.find_one(Admin.username == settings.ADMIN_INIT_USERNAME)
    if not admin:
        await Admin(
            username=settings.ADMIN_INIT_USERNAME,
            password_hash=get_password_hash(settings.ADMIN_INIT_PASSWORD),
            nickname="系统管理员",
            role="admin",
            status=1,
        ).insert()

    yield
    await close_db()


app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

upload_dir = Path(settings.UPLOAD_DIR)
upload_dir.mkdir(parents=True, exist_ok=True)
app.mount("/media", StaticFiles(directory=str(upload_dir)), name="media")
