from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File

from app.api.deps import get_current_admin
from app.api.v1._helpers import doc_to_dict, page_payload, save_upload_file, touch_update
from app.core.utils import now_ts
from app.models.admin import Admin
from app.models.banner import Banner
from app.schemas.content import BannerIn

router = APIRouter(prefix="/banners", tags=["banners"])


@router.get("")
async def list_banners(
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=100),
    status: int | None = None,
):
    query = {}
    if status is not None:
        query["status"] = status
    total = await Banner.find(query).count()
    items = (
        await Banner.find(query)
        .sort([("sort", 1), ("createdAt", -1)])
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .to_list()
    )
    return page_payload(items, total, page, pageSize)


@router.post("")
async def create_banner(payload: BannerIn, _: Admin = Depends(get_current_admin)):
    banner = Banner(**payload.model_dump(), createdAt=now_ts(), updatedAt=now_ts())
    await banner.insert()
    return doc_to_dict(banner)


@router.put("/{banner_id}")
async def update_banner(banner_id: str, payload: BannerIn, _: Admin = Depends(get_current_admin)):
    banner = await Banner.get(banner_id)
    if not banner:
        raise HTTPException(status_code=404, detail="轮播图不存在")
    update_data = touch_update(payload.model_dump())
    await banner.set(update_data)
    updated = await Banner.get(banner_id)
    return doc_to_dict(updated)


@router.delete("/{banner_id}")
async def delete_banner(banner_id: str, _: Admin = Depends(get_current_admin)):
    banner = await Banner.get(banner_id)
    if not banner:
        raise HTTPException(status_code=404, detail="轮播图不存在")
    await banner.delete()
    return {"ok": True}


@router.post("/upload-image")
async def upload_banner_image(
    file: UploadFile = File(...),
    _: Admin = Depends(get_current_admin),
):
    return {"url": await save_upload_file(file, "banners")}
