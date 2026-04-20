from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File

from app.api.deps import get_current_admin
from app.api.v1._helpers import doc_to_dict, page_payload, save_upload_file, touch_update
from app.core.utils import now_ts
from app.models.admin import Admin
from app.models.brand import Brand
from app.schemas.content import BrandIn

router = APIRouter(prefix="/brands", tags=["brands"])


@router.get("")
async def list_brands(
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=100),
    keyword: str = "",
):
    query = {}
    if keyword:
        query = {"name": {"$regex": keyword, "$options": "i"}}
    total = await Brand.find(query).count()
    items = (
        await Brand.find(query)
        .sort([("sort", 1), ("createdAt", -1)])
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .to_list()
    )
    return page_payload(items, total, page, pageSize)


@router.post("")
async def create_brand(payload: BrandIn, _: Admin = Depends(get_current_admin)):
    brand = Brand(**payload.model_dump(), createdAt=now_ts(), updatedAt=now_ts())
    await brand.insert()
    return doc_to_dict(brand)


@router.put("/{brand_id}")
async def update_brand(brand_id: str, payload: BrandIn, _: Admin = Depends(get_current_admin)):
    brand = await Brand.get(brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail="品牌不存在")
    update_data = touch_update(payload.model_dump())
    await brand.set(update_data)
    updated = await Brand.get(brand_id)
    return doc_to_dict(updated)


@router.delete("/{brand_id}")
async def delete_brand(brand_id: str, _: Admin = Depends(get_current_admin)):
    brand = await Brand.get(brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail="品牌不存在")
    await brand.delete()
    return {"ok": True}


@router.post("/upload-logo")
async def upload_logo(file: UploadFile = File(...), _: Admin = Depends(get_current_admin)):
    return {"url": await save_upload_file(file, "brands")}
