import json
import sys
import uuid
from urllib import error, request

from pymongo import MongoClient

BASE_URL = "http://127.0.0.1:8000/api/v1"
MONGO_URI = "mongodb://127.0.0.1:27017"
DB_NAME = "my_car_admin"


def http_get(path: str):
    req = request.Request(f"{BASE_URL}{path}", method="GET")
    req.add_header("Content-Type", "application/json")
    try:
        with request.urlopen(req, timeout=10) as resp:
            body = resp.read().decode("utf-8") or "{}"
            return resp.status, json.loads(body)
    except error.HTTPError as exc:
        body = exc.read().decode("utf-8") or "{}"
        return exc.code, json.loads(body)


def assert_true(condition: bool, message: str):
    if not condition:
        print(f"[FAIL] {message}")
        sys.exit(1)
    print(f"[PASS] {message}")


def seed_content():
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    suffix = uuid.uuid4().hex[:8]

    brand = {
        "name": f"Phase4品牌{suffix}",
        "logo": "",
        "sort": 1,
        "status": 1,
        "createdAt": 1713590400000,
        "updatedAt": 1713590400000,
    }
    brand_id = str(db["brands"].insert_one(brand).inserted_id)

    db["banners"].insert_one(
        {
            "title": f"Phase4轮播{suffix}",
            "imageUrl": "https://example.com/banner.jpg",
            "linkType": "none",
            "linkUrl": "",
            "targetId": "",
            "status": 1,
            "sort": 1,
            "createdAt": 1713590400000,
            "updatedAt": 1713590400000,
        }
    )

    wallpaper_id = str(
        db["wallpapers"].insert_one(
            {
                "title": f"Phase4壁纸{suffix}",
                "coverUrl": "https://example.com/wallpaper-cover.jpg",
                "originUrl": "https://example.com/wallpaper-origin.jpg",
                "brandId": brand_id,
                "modelId": "",
                "tags": ["phase4"],
                "resolution": "1080x1920",
                "status": 1,
                "publishAt": 1713590400000,
                "hotScore": 99,
                "downloadCount": 0,
                "favoriteCount": 0,
                "createdAt": 1713590400000,
                "updatedAt": 1713590400000,
            }
        ).inserted_id
    )

    sound_id = str(
        db["sounds"].insert_one(
            {
                "title": f"Phase4音效{suffix}",
                "coverUrl": "https://example.com/sound-cover.jpg",
                "audioUrl": "https://example.com/sound.mp3",
                "brandId": brand_id,
                "modelId": "",
                "soundType": "提示音",
                "duration": 2.5,
                "bitrate": 320,
                "status": 1,
                "publishAt": 1713590400000,
                "hotScore": 88,
                "playCount": 0,
                "downloadCount": 0,
                "favoriteCount": 0,
                "createdAt": 1713590400000,
                "updatedAt": 1713590400000,
            }
        ).inserted_id
    )
    return brand_id, wallpaper_id, sound_id


def main():
    brand_id, wallpaper_id, sound_id = seed_content()

    status, data = http_get("/public/home")
    assert_true(status == 200 and "brands" in data and "hotWallpapers" in data, "public home 接口可用")

    status, data = http_get(f"/public/wallpapers?page=1&pageSize=10&brandId={brand_id}")
    assert_true(status == 200 and isinstance(data.get("list"), list), "public wallpapers 列表可用")

    status, data = http_get(f"/public/wallpapers/{wallpaper_id}")
    assert_true(status == 200 and data.get("_id"), "public wallpaper 详情可用")

    status, data = http_get(f"/public/sounds?page=1&pageSize=10&brandId={brand_id}")
    assert_true(status == 200 and isinstance(data.get("list"), list), "public sounds 列表可用")

    status, data = http_get(f"/public/sounds/{sound_id}")
    assert_true(status == 200 and data.get("_id"), "public sound 详情可用")

    status, data = http_get("/public/search/suggest?keyword=Phase4")
    assert_true(status == 200 and "suggestions" in data, "public search suggest 可用")

    status, data = http_get("/public/search?keyword=Phase4&type=all&page=1&pageSize=20")
    assert_true(status == 200 and "wallpapers" in data and "sounds" in data, "public search 可用")

    status, data = http_get("/public/search/hot")
    assert_true(status == 200 and "keywords" in data, "public search hot 可用")

    print("\nAll phase4 public API tests passed.")


if __name__ == "__main__":
    main()
