from pathlib import Path
from urllib.parse import urlparse

from mutagen import File as MutagenFile
from PIL import Image

from app.core.config import settings


def to_https_media_url(raw_url: str) -> str:
    if not raw_url or not isinstance(raw_url, str):
        return raw_url or ""
    if raw_url.startswith("https://"):
        return raw_url
    if raw_url.startswith("http://"):
        return raw_url.replace("http://", "https://", 1)
    if raw_url.startswith("//"):
        return f"https:{raw_url}"
    return raw_url


def _resolve_local_media_path(media_url: str) -> Path | None:
    if not media_url:
        return None

    parsed = urlparse(media_url)
    path = parsed.path or ""
    if not path.startswith("/media/"):
        return None

    relative_path = path.removeprefix("/media/").lstrip("/")
    upload_root = Path(settings.UPLOAD_DIR).resolve()
    target_path = (upload_root / relative_path).resolve()

    if not str(target_path).startswith(str(upload_root)):
        return None
    if not target_path.exists() or not target_path.is_file():
        return None
    return target_path


def detect_audio_duration(audio_url: str) -> float | None:
    local_path = _resolve_local_media_path(audio_url)
    if not local_path:
        return None

    try:
        media = MutagenFile(local_path)
        length = getattr(getattr(media, "info", None), "length", None)
        if length and length > 0:
            return round(float(length), 2)
    except Exception:
        return None
    return None


def detect_image_resolution(image_url: str) -> str | None:
    local_path = _resolve_local_media_path(image_url)
    if not local_path:
        return None

    try:
        with Image.open(local_path) as img:
            width, height = img.size
            if width > 0 and height > 0:
                return f"{width}x{height}"
    except Exception:
        return None
    return None
