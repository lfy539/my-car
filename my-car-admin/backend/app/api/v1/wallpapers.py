from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File

from app.api.deps import get_current_admin
from app.api.v1._helpers import doc_to_dict, page_payload, save_upload_file, touch_update
from app.core.utils import now_ts
from app.models.admin import Admin
from app.models.wallpaper import Wallpaper
from app.schemas.content import WallpaperIn

router = APIRouter(prefix="/wallpapers", tags=["wallpapers"])


@router.get("")
async def list_wallpapers(
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=100),
    brandId: str = "",
    status: int | None = None,
    keyword: str = "",
):
    query = {}
    if brandId:
        query["brandId"] = brandId
    if status is not None:
        query["status"] = status
    if keyword:
        query["title"] = {"$regex": keyword, "$options": "i"}

    total = await Wallpaper.find(query).count()
    items = (
        await Wallpaper.find(query)
        .sort([("publishAt", -1), ("createdAt", -1)])
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .to_list()
    )
    return page_payload(items, total, page, pageSize)


@router.post("")
async def create_wallpaper(payload: WallpaperIn, _: Admin = Depends(get_current_admin)):
    data = payload.model_dump()
    if not data.get("publishAt"):
        data["publishAt"] = now_ts()
    wallpaper = Wallpaper(**data, createdAt=now_ts(), updatedAt=now_ts())
    await wallpaper.insert()
    return doc_to_dict(wallpaper)


@router.put("/{wallpaper_id}")
async def update_wallpaper(
    wallpaper_id: str,
    payload: WallpaperIn,
    _: Admin = Depends(get_current_admin),
):
    wallpaper = await Wallpaper.get(wallpaper_id)
    if not wallpaper:
        raise HTTPException(status_code=404, detail="壁纸不存在")
    update_data = payload.model_dump()
    if not update_data.get("publishAt"):
        update_data["publishAt"] = wallpaper.publishAt
    touch_update(update_data)
    await wallpaper.set(update_data)
    updated = await Wallpaper.get(wallpaper_id)
    return doc_to_dict(updated)


@router.delete("/{wallpaper_id}")
async def delete_wallpaper(wallpaper_id: str, _: Admin = Depends(get_current_admin)):
    wallpaper = await Wallpaper.get(wallpaper_id)
    if not wallpaper:
        raise HTTPException(status_code=404, detail="壁纸不存在")
    await wallpaper.delete()
    return {"ok": True}


@router.post("/upload-cover")
async def upload_cover(file: UploadFile = File(...), _: Admin = Depends(get_current_admin)):
    return {"url": await save_upload_file(file, "wallpapers/covers")}


@router.post("/upload-origin")
async def upload_origin(file: UploadFile = File(...), _: Admin = Depends(get_current_admin)):
    return {"url": await save_upload_file(file, "wallpapers/origins")}
