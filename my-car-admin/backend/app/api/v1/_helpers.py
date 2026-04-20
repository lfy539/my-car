from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.core.config import settings
from app.core.utils import now_ts


def doc_to_dict(doc) -> dict:
    data = doc.model_dump()
    data["_id"] = str(doc.id)
    return data


def page_payload(items: list, total: int, page: int, page_size: int) -> dict:
    return {
        "list": [doc_to_dict(item) for item in items],
        "total": total,
        "page": page,
        "pageSize": page_size,
    }


def touch_update(data: dict) -> dict:
    data["updatedAt"] = now_ts()
    return data


async def save_upload_file(upload_file: UploadFile, folder: str) -> str:
    upload_root = Path(settings.UPLOAD_DIR)
    target_dir = upload_root / folder
    target_dir.mkdir(parents=True, exist_ok=True)

    ext = Path(upload_file.filename or "").suffix or ".bin"
    filename = f"{uuid4().hex}{ext}"
    target_path = target_dir / filename

    content = await upload_file.read()
    target_path.write_bytes(content)

    return f"{settings.MEDIA_BASE_URL}/{folder}/{filename}"
