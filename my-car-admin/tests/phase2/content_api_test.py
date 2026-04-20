import json
import sys
from urllib import error, request

BASE_URL = "http://127.0.0.1:8000/api/v1"


def http_request(method: str, path: str, payload: dict | None = None, token: str | None = None):
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = request.Request(f"{BASE_URL}{path}", data=data, method=method)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
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


def login() -> str:
    status, data = http_request(
        "POST",
        "/auth/login",
        {"username": "admin", "password": "admin123456"},
    )
    assert_true(status == 200 and "access_token" in data, "管理员登录成功")
    return data["access_token"]


def test_brands(token: str):
    create_payload = {"name": "Phase2-Brand", "logo": "", "sort": 1, "status": 1}
    status, data = http_request("POST", "/brands", create_payload, token)
    assert_true(status == 200 and data.get("_id"), "品牌创建成功")
    brand_id = data["_id"]

    status, data = http_request("GET", "/brands?page=1&pageSize=20", token=token)
    assert_true(status == 200 and isinstance(data.get("list"), list), "品牌列表可查询")

    status, _ = http_request(
        "PUT",
        f"/brands/{brand_id}",
        {"name": "Phase2-Brand-Updated", "logo": "", "sort": 2, "status": 1},
        token,
    )
    assert_true(status == 200, "品牌更新成功")

    status, _ = http_request("DELETE", f"/brands/{brand_id}", token=token)
    assert_true(status == 200, "品牌删除成功")


def test_banners(token: str):
    create_payload = {
        "title": "Phase2-Banner",
        "imageUrl": "https://example.com/banner.jpg",
        "linkType": "none",
        "linkUrl": "",
        "targetId": "",
        "sort": 1,
        "status": 1,
    }
    status, data = http_request("POST", "/banners", create_payload, token)
    assert_true(status == 200 and data.get("_id"), "轮播图创建成功")
    banner_id = data["_id"]

    status, data = http_request("GET", "/banners?page=1&pageSize=20", token=token)
    assert_true(status == 200 and isinstance(data.get("list"), list), "轮播图列表可查询")

    status, _ = http_request(
        "PUT",
        f"/banners/{banner_id}",
        {**create_payload, "title": "Phase2-Banner-Updated"},
        token,
    )
    assert_true(status == 200, "轮播图更新成功")

    status, _ = http_request("DELETE", f"/banners/{banner_id}", token=token)
    assert_true(status == 200, "轮播图删除成功")


def test_wallpapers(token: str):
    create_payload = {
        "title": "Phase2-Wallpaper",
        "coverUrl": "https://example.com/cover.jpg",
        "originUrl": "https://example.com/origin.jpg",
        "brandId": "brand-demo",
        "modelId": "",
        "tags": ["科技"],
        "resolution": "1080x1920",
        "fileSize": 1024,
        "status": 1,
        "hotScore": 0,
    }
    status, data = http_request("POST", "/wallpapers", create_payload, token)
    assert_true(status == 200 and data.get("_id"), "壁纸创建成功")
    wallpaper_id = data["_id"]

    status, data = http_request("GET", "/wallpapers?page=1&pageSize=20", token=token)
    assert_true(status == 200 and isinstance(data.get("list"), list), "壁纸列表可查询")

    status, _ = http_request(
        "PUT",
        f"/wallpapers/{wallpaper_id}",
        {**create_payload, "title": "Phase2-Wallpaper-Updated"},
        token,
    )
    assert_true(status == 200, "壁纸更新成功")

    status, _ = http_request("DELETE", f"/wallpapers/{wallpaper_id}", token=token)
    assert_true(status == 200, "壁纸删除成功")


def test_sounds(token: str):
    create_payload = {
        "title": "Phase2-Sound",
        "coverUrl": "https://example.com/sound-cover.jpg",
        "audioUrl": "https://example.com/sound.mp3",
        "brandId": "brand-demo",
        "modelId": "",
        "soundType": "提示音",
        "duration": 3.2,
        "bitrate": 320,
        "fileSize": 2048,
        "status": 1,
        "hotScore": 0,
    }
    status, data = http_request("POST", "/sounds", create_payload, token)
    assert_true(status == 200 and data.get("_id"), "音效创建成功")
    sound_id = data["_id"]

    status, data = http_request("GET", "/sounds?page=1&pageSize=20", token=token)
    assert_true(status == 200 and isinstance(data.get("list"), list), "音效列表可查询")

    status, _ = http_request(
        "PUT",
        f"/sounds/{sound_id}",
        {**create_payload, "title": "Phase2-Sound-Updated"},
        token,
    )
    assert_true(status == 200, "音效更新成功")

    status, _ = http_request("DELETE", f"/sounds/{sound_id}", token=token)
    assert_true(status == 200, "音效删除成功")


def main():
    token = login()
    test_brands(token)
    test_banners(token)
    test_wallpapers(token)
    test_sounds(token)
    print("\nAll phase2 API tests passed.")


if __name__ == "__main__":
    main()
