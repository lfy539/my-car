import json
import sys
import uuid
from urllib import error, request

from pymongo import MongoClient

BASE_URL = "http://127.0.0.1:8000/api/v1"
MONGO_URI = "mongodb://127.0.0.1:27017"
DB_NAME = "my_car_admin"


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


def seed_demo_data() -> str:
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    suffix = uuid.uuid4().hex[:8]
    open_id = f"phase3-openid-{suffix}"

    user_doc = {
        "openId": open_id,
        "unionId": "",
        "nickname": f"phase3_user_{suffix}",
        "avatar": "",
        "phone": "",
        "status": 1,
        "createdAt": 1713590400000,
        "updatedAt": 1713590400000,
    }
    db["users"].insert_one(user_doc)

    db["user_events"].insert_many(
        [
            {"userId": open_id, "eventType": "view", "createdAt": 1713590400000},
            {"userId": open_id, "eventType": "download", "createdAt": 1713590500000},
        ]
    )
    db["user_favorites"].insert_one(
        {"userId": open_id, "targetType": "wallpaper", "targetId": "demo-wallpaper", "createdAt": 1713590600000}
    )
    return open_id


def login() -> str:
    status, data = http_request(
        "POST",
        "/auth/login",
        {"username": "admin", "password": "admin123456"},
    )
    assert_true(status == 200 and "access_token" in data, "管理员登录成功")
    return data["access_token"]


def test_users_and_stats(token: str):
    status, data = http_request("GET", "/users?page=1&pageSize=50", token=token)
    assert_true(status == 200 and isinstance(data.get("list"), list), "用户列表接口可用")
    assert_true(len(data["list"]) > 0, "用户列表有数据")

    user_id = data["list"][0]["_id"]
    status, data = http_request("PATCH", f"/users/{user_id}/status", {"status": 2}, token=token)
    assert_true(status == 200 and data.get("ok") is True, "用户封禁接口可用")

    status, data = http_request("PATCH", f"/users/{user_id}/status", {"status": 1}, token=token)
    assert_true(status == 200 and data.get("ok") is True, "用户解禁接口可用")

    status, data = http_request("GET", "/stats/overview", token=token)
    assert_true(status == 200 and "totalUsers" in data, "统计概览接口可用")

    status, data = http_request("GET", "/stats/trend?days=7", token=token)
    assert_true(status == 200 and len(data.get("dates", [])) == 7, "统计趋势接口可用")

    status, data = http_request("GET", "/stats/top-content?limit=5", token=token)
    assert_true(status == 200 and "wallpapers" in data and "sounds" in data, "热门内容接口可用")


def main():
    seed_demo_data()
    token = login()
    test_users_and_stats(token)
    print("\nAll phase3 API tests passed.")


if __name__ == "__main__":
    main()
