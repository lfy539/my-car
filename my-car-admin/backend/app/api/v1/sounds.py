from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File

from app.api.deps import get_current_admin
from app.api.v1._helpers import doc_to_dict, page_payload, save_upload_file, touch_update
from app.core.media import detect_audio_duration
from app.core.utils import now_ts
from app.models.admin import Admin
from app.models.sound import Sound
from app.schemas.content import SoundIn

router = APIRouter(prefix="/sounds", tags=["sounds"])


@router.get("")
async def list_sounds(
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

    total = await Sound.find(query).count()
    items = (
        await Sound.find(query)
        .sort([("publishAt", -1), ("createdAt", -1)])
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .to_list()
    )
    return page_payload(items, total, page, pageSize)


@router.post("")
async def create_sound(payload: SoundIn, _: Admin = Depends(get_current_admin)):
    data = payload.model_dump()
    if not data.get("publishAt"):
        data["publishAt"] = now_ts()
    if (not data.get("duration")) and data.get("audioUrl"):
        detected = detect_audio_duration(data["audioUrl"])
        if detected:
            data["duration"] = detected
    sound = Sound(**data, createdAt=now_ts(), updatedAt=now_ts())
    await sound.insert()
    return doc_to_dict(sound)


@router.put("/{sound_id}")
async def update_sound(sound_id: str, payload: SoundIn, _: Admin = Depends(get_current_admin)):
    sound = await Sound.get(sound_id)
    if not sound:
        raise HTTPException(status_code=404, detail="音效不存在")
    update_data = payload.model_dump()
    if not update_data.get("publishAt"):
        update_data["publishAt"] = sound.publishAt
    if (not update_data.get("duration")) and update_data.get("audioUrl"):
        detected = detect_audio_duration(update_data["audioUrl"])
        if detected:
            update_data["duration"] = detected
    touch_update(update_data)
    await sound.set(update_data)
    updated = await Sound.get(sound_id)
    return doc_to_dict(updated)


@router.delete("/{sound_id}")
async def delete_sound(sound_id: str, _: Admin = Depends(get_current_admin)):
    sound = await Sound.get(sound_id)
    if not sound:
        raise HTTPException(status_code=404, detail="音效不存在")
    await sound.delete()
    return {"ok": True}


@router.post("/upload-cover")
async def upload_cover(file: UploadFile = File(...), _: Admin = Depends(get_current_admin)):
    return {"url": await save_upload_file(file, "sounds/covers")}


@router.post("/upload-audio")
async def upload_audio(file: UploadFile = File(...), _: Admin = Depends(get_current_admin)):
    return {"url": await save_upload_file(file, "sounds/audios")}
