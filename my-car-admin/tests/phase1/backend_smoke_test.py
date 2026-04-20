import json
import sys
from urllib import error, request

BASE_URL = "http://127.0.0.1:8000/api/v1"


def http_get(path: str, token: str | None = None) -> tuple[int, dict]:
    req = request.Request(f"{BASE_URL}{path}", method="GET")
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        with request.urlopen(req, timeout=10) as resp:
            body = resp.read().decode("utf-8")
            return resp.status, json.loads(body)
    except error.HTTPError as exc:
        body = exc.read().decode("utf-8") or "{}"
        return exc.code, json.loads(body)


def http_post(path: str, payload: dict) -> tuple[int, dict]:
    data = json.dumps(payload).encode("utf-8")
    req = request.Request(f"{BASE_URL}{path}", data=data, method="POST")
    req.add_header("Content-Type", "application/json")
    try:
        with request.urlopen(req, timeout=10) as resp:
            body = resp.read().decode("utf-8")
            return resp.status, json.loads(body)
    except error.HTTPError as exc:
        body = exc.read().decode("utf-8") or "{}"
        return exc.code, json.loads(body)


def assert_true(condition: bool, message: str) -> None:
    if not condition:
        print(f"[FAIL] {message}")
        sys.exit(1)
    print(f"[PASS] {message}")


def main() -> None:
    status, data = http_get("/health")
    assert_true(status == 200 and data.get("ok") is True, "health check 可用")

    status, data = http_post(
        "/auth/login",
        {"username": "admin", "password": "admin123456"},
    )
    token = data.get("access_token")
    assert_true(status == 200 and isinstance(token, str), "管理员登录成功")

    status, data = http_get("/auth/me", token=token)
    assert_true(status == 200 and data.get("username") == "admin", "获取当前管理员信息成功")

    print("\nAll phase1 backend smoke tests passed.")


if __name__ == "__main__":
    main()
