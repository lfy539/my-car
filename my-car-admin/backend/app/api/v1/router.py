from fastapi import APIRouter

from app.api.v1 import auth, banners, brands, health, public, sounds, stats, users, wallpapers

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(brands.router)
api_router.include_router(banners.router)
api_router.include_router(wallpapers.router)
api_router.include_router(sounds.router)
api_router.include_router(users.router)
api_router.include_router(stats.router)
api_router.include_router(public.router)
