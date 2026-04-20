import re

from fastapi import APIRouter, HTTPException, Query

from app.core.utils import now_ts
from app.models.banner import Banner
from app.models.brand import Brand
from app.models.sound import Sound
from app.models.wallpaper import Wallpaper

router = APIRouter(prefix="/public", tags=["public"])


def doc_to_dict(doc) -> dict:
    data = doc.model_dump()
    data["_id"] = str(doc.id)
    return data


@router.get("/home")
async def public_home():
    banners = await Banner.find({"status": 1}).sort([("sort", 1)]).limit(5).to_list()
    brands = await Brand.find({"status": 1}).sort([("sort", 1)]).to_list()
    hot_wallpapers = await Wallpaper.find({"status": 1}).sort([("hotScore", -1)]).limit(6).to_list()
    hot_sounds = await Sound.find({"status": 1}).sort([("hotScore", -1)]).limit(3).to_list()

    return {
        "banners": [doc_to_dict(item) for item in banners],
        "brands": [doc_to_dict(item) for item in brands],
        "hotWallpapers": [doc_to_dict(item) for item in hot_wallpapers],
        "hotSounds": [doc_to_dict(item) for item in hot_sounds],
    }


@router.get("/wallpapers")
async def public_wallpapers(
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=100),
    brandId: str = "",
    modelId: str = "",
    sortBy: str = Query("latest"),
):
    query = {"status": 1}
    if brandId:
        query["brandId"] = brandId
    if modelId:
        query["modelId"] = modelId

    total = await Wallpaper.find(query).count()
    cursor = Wallpaper.find(query)
    if sortBy == "hot":
        cursor = cursor.sort([("hotScore", -1)])
    else:
        cursor = cursor.sort([("publishAt", -1)])
    rows = await cursor.skip((page - 1) * pageSize).limit(pageSize).to_list()
    return {
        "list": [doc_to_dict(item) for item in rows],
        "total": total,
        "page": page,
        "pageSize": pageSize,
    }


@router.get("/wallpapers/{wallpaper_id}")
async def public_wallpaper_detail(wallpaper_id: str):
    row = await Wallpaper.get(wallpaper_id)
    if not row or row.status != 1:
        raise HTTPException(status_code=404, detail="壁纸不存在")
    row.hotScore = (row.hotScore or 0) + 1
    row.updatedAt = now_ts()
    await row.save()
    return doc_to_dict(row)


@router.get("/sounds")
async def public_sounds(
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=100),
    brandId: str = "",
    modelId: str = "",
    soundType: str = "",
    sortBy: str = Query("latest"),
):
    query = {"status": 1}
    if brandId:
        query["brandId"] = brandId
    if modelId:
        query["modelId"] = modelId
    if soundType:
        query["soundType"] = soundType

    total = await Sound.find(query).count()
    cursor = Sound.find(query)
    if sortBy == "hot":
        cursor = cursor.sort([("hotScore", -1)])
    else:
        cursor = cursor.sort([("publishAt", -1)])
    rows = await cursor.skip((page - 1) * pageSize).limit(pageSize).to_list()
    return {
        "list": [doc_to_dict(item) for item in rows],
        "total": total,
        "page": page,
        "pageSize": pageSize,
    }


@router.get("/sounds/{sound_id}")
async def public_sound_detail(sound_id: str):
    row = await Sound.get(sound_id)
    if not row or row.status != 1:
        raise HTTPException(status_code=404, detail="音效不存在")
    row.hotScore = (row.hotScore or 0) + 1
    row.updatedAt = now_ts()
    await row.save()
    return doc_to_dict(row)


@router.get("/search/suggest")
async def public_search_suggest(keyword: str = ""):
    if not keyword:
        return {"suggestions": []}
    regex = re.compile(re.escape(keyword), re.IGNORECASE)

    brands = await Brand.find({"name": {"$regex": regex.pattern, "$options": "i"}}).limit(3).to_list()
    wallpapers = await Wallpaper.find({"status": 1, "title": {"$regex": regex.pattern, "$options": "i"}}).limit(5).to_list()
    sounds = await Sound.find({"status": 1, "title": {"$regex": regex.pattern, "$options": "i"}}).limit(5).to_list()

    merged = [*(b.name for b in brands), *(w.title for w in wallpapers), *(s.title for s in sounds)]
    deduped = list(dict.fromkeys(merged))[:10]
    return {"suggestions": deduped}


@router.get("/search")
async def public_search(
    keyword: str = Query(..., min_length=1),
    type: str = Query("all"),
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=50),
):
    regex = {"$regex": re.escape(keyword), "$options": "i"}
    wallpapers = []
    sounds = []
    wallpaper_total = 0
    sound_total = 0
    half = (pageSize + 1) // 2

    if type in ("all", "wallpaper"):
        w_query = {"status": 1, "$or": [{"title": regex}, {"tags": regex}]}
        wallpaper_total = await Wallpaper.find(w_query).count()
        w_rows = (
            await Wallpaper.find(w_query)
            .sort([("hotScore", -1)])
            .skip(0 if type == "all" else (page - 1) * pageSize)
            .limit(half if type == "all" else pageSize)
            .to_list()
        )
        wallpapers = [doc_to_dict(item) for item in w_rows]

    if type in ("all", "sound"):
        s_query = {"status": 1, "$or": [{"title": regex}, {"soundType": regex}]}
        sound_total = await Sound.find(s_query).count()
        s_rows = (
            await Sound.find(s_query)
            .sort([("hotScore", -1)])
            .skip(0 if type == "all" else (page - 1) * pageSize)
            .limit(half if type == "all" else pageSize)
            .to_list()
        )
        sounds = [doc_to_dict(item) for item in s_rows]

    return {
        "wallpapers": wallpapers,
        "sounds": sounds,
        "wallpaperTotal": wallpaper_total,
        "soundTotal": sound_total,
        "total": wallpaper_total + sound_total,
        "page": page,
        "pageSize": pageSize,
    }


@router.get("/search/hot")
async def public_search_hot():
    # v1: derive from current hot content tags/titles; can be replaced by dedicated keyword stats later
    hot_wallpapers = await Wallpaper.find({"status": 1}).sort([("hotScore", -1)]).limit(5).to_list()
    hot_sounds = await Sound.find({"status": 1}).sort([("hotScore", -1)]).limit(5).to_list()
    keywords = []
    for row in hot_wallpapers:
        keywords.append({"keyword": row.title, "count": row.hotScore, "isHot": row.hotScore > 100})
    for row in hot_sounds:
        keywords.append({"keyword": row.title, "count": row.hotScore, "isHot": row.hotScore > 100})
    return {"keywords": keywords[:10]}
