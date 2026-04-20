from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query

from app.api.deps import get_current_admin
from app.models.admin import Admin
from app.models.sound import Sound
from app.models.user import User
from app.models.user_event import UserEvent
from app.models.wallpaper import Wallpaper

router = APIRouter(prefix="/stats", tags=["stats"])


def day_start_ts(offset_days: int = 0) -> int:
    dt = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    dt = dt + timedelta(days=offset_days)
    return int(dt.timestamp() * 1000)


@router.get("/overview")
async def overview(_: Admin = Depends(get_current_admin)):
    total_users = await User.find_all().count()
    total_wallpapers = await Wallpaper.find_all().count()
    total_sounds = await Sound.find_all().count()

    today_start = day_start_ts(0)
    today_views = await UserEvent.find({"eventType": "view", "createdAt": {"$gte": today_start}}).count()
    today_downloads = await UserEvent.find(
        {"eventType": "download", "createdAt": {"$gte": today_start}}
    ).count()
    today_new_users = await User.find({"createdAt": {"$gte": today_start}}).count()

    yesterday_start = day_start_ts(-1)
    yesterday_views = await UserEvent.find(
        {"eventType": "view", "createdAt": {"$gte": yesterday_start, "$lt": today_start}}
    ).count()
    growth = 0
    if yesterday_views > 0:
        growth = round(((today_views - yesterday_views) / yesterday_views) * 100, 2)

    return {
        "totalUsers": total_users,
        "totalWallpapers": total_wallpapers,
        "totalSounds": total_sounds,
        "todayViews": today_views,
        "todayDownloads": today_downloads,
        "todayNewUsers": today_new_users,
        "viewsGrowth": growth,
    }


@router.get("/trend")
async def trend(days: int = Query(7, ge=3, le=30), _: Admin = Depends(get_current_admin)):
    dates: list[str] = []
    views: list[int] = []
    downloads: list[int] = []
    new_users: list[int] = []

    for offset in range(days - 1, -1, -1):
        start = day_start_ts(-offset)
        end = day_start_ts(-offset + 1)
        dt = datetime.fromtimestamp(start / 1000, tz=timezone.utc)
        dates.append(dt.strftime("%m-%d"))
        views.append(await UserEvent.find({"eventType": "view", "createdAt": {"$gte": start, "$lt": end}}).count())
        downloads.append(
            await UserEvent.find({"eventType": "download", "createdAt": {"$gte": start, "$lt": end}}).count()
        )
        new_users.append(await User.find({"createdAt": {"$gte": start, "$lt": end}}).count())

    return {"dates": dates, "views": views, "downloads": downloads, "newUsers": new_users}


@router.get("/top-content")
async def top_content(limit: int = Query(10, ge=1, le=20), _: Admin = Depends(get_current_admin)):
    wallpapers = await Wallpaper.find({"status": 1}).sort([("hotScore", -1)]).limit(limit).to_list()
    sounds = await Sound.find({"status": 1}).sort([("hotScore", -1)]).limit(limit).to_list()

    return {
        "wallpapers": [
            {
                "_id": str(w.id),
                "title": w.title,
                "coverUrl": w.coverUrl,
                "hotScore": w.hotScore,
                "downloadCount": w.downloadCount,
                "favoriteCount": w.favoriteCount,
            }
            for w in wallpapers
        ],
        "sounds": [
            {
                "_id": str(s.id),
                "title": s.title,
                "coverUrl": s.coverUrl,
                "hotScore": s.hotScore,
                "playCount": s.playCount,
                "downloadCount": s.downloadCount,
            }
            for s in sounds
        ],
    }
