# my-car-admin 后端 API 说明

本文档描述 FastAPI 服务对外暴露的 HTTP 接口，并与管理后台前端（`frontend/src/services/*.ts`）联调关系对照。

交互式文档：服务启动后访问 **`/docs`**（Swagger UI）、**`/redoc`**（ReDoc），路径在站点根下（不含 `/api/v1` 前缀）。

---

## 基础约定

| 项 | 说明 |
|----|------|
| API 前缀 | 默认 **`/api/v1`**，由环境变量 `API_V1_PREFIX` 配置（见 `app/core/config.py`），在 `app/main.py` 挂载。 |
| 完整 Base URL | `{scheme}://{host}:{port}/api/v1`，例如本地 `http://127.0.0.1:8000/api/v1`。 |
| 静态资源 | **`/media`** 挂载上传目录 `UPLOAD_DIR`；上传接口返回的 `url` 通常形如 `{MEDIA_BASE_URL}/...`（见 `MEDIA_BASE_URL`）。 |
| 管理端认证 | 需登录的接口：`Authorization: Bearer <JWT>`（见 `app/api/deps.py`）。 |
| 分页列表结构 | `page_payload`：`{ "list": [...], "total": number, "page": number, "pageSize": number }`，文档中的 `_id` 为字符串。 |

### 前端 Base URL

管理端 axios 使用同一前缀：`VITE_API_BASE` 或本地 `http://127.0.0.1:8000/api/v1`（见 `frontend/src/services/auth.ts`、`content.ts`、`users.ts`、`stats.ts`）。

---

## HTTP 状态码与错误体

| 状态码 | 常见场景 |
|--------|----------|
| **200** | 成功；DELETE 部分接口返回 `{ "ok": true }`。 |
| **401** | 未带 Token、Token 无效或过期、账号禁用（登录失败为用户名密码错误也返回 401，见 `/auth/login`）。 |
| **403** | 账号已禁用等非认证场景（如登录时 `status != 1`）。 |
| **404** | 资源不存在（品牌/轮播/壁纸/音效/用户等）。 |
| **422** | 请求体验证失败（Pydantic），例如必填字段缺失、类型错误。 |

错误响应体一般为 FastAPI 默认格式，包含 `detail` 字段（字符串或校验明细列表）。

---

## curl 示例

以下假定 `BASE=http://127.0.0.1:8000/api/v1`，登录后：

```bash
export BASE=http://127.0.0.1:8000/api/v1
export TOKEN='<粘贴 login 返回的 access_token>'
```

**登录（无需 Token）**

```bash
curl -sS -X POST "$BASE/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123456"}'
```

**带认证的请求**

```bash
curl -sS "$BASE/auth/me" -H "Authorization: Bearer $TOKEN"
curl -sS "$BASE/stats/overview" -H "Authorization: Bearer $TOKEN"
```

**上传文件（multipart 字段名为 `file`）**

```bash
curl -sS -X POST "$BASE/brands/upload-logo" \
  -H "Authorization: Bearer $TOKEN" \
  -F 'file=@./logo.png'
```

---

## 接口一览（路径相对于 `{origin}/api/v1`）

### 健康检查

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/health` | 否 | 返回 `ok`、`service`、`env`（`app/api/v1/health.py`） |

---

### 认证（`app/api/v1/auth.py`）

| 方法 | 路径 | 认证 | 请求体 | 响应 |
|------|------|------|--------|------|
| POST | `/auth/login` | 否 | `LoginRequest`：`username`、`password`（`app/schemas/auth.py`） | `TokenResponse`：`access_token`、`token_type`、`expires_in` |
| GET | `/auth/me` | 是 | — | `AdminProfile`：`id`、`username`、`nickname`、`avatar`、`role`、`status` |

**前端联调**：`frontend/src/services/auth.ts` 调用 `/auth/login`；Token 存 `localStorage.admin_token`（`Login.tsx`）。`getProfile` 已实现但布局未调用。

---

### 品牌（`app/api/v1/brands.py`）

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/brands` | **否** | Query：`page`、`pageSize`、`keyword` |
| POST | `/brands` | 是 | Body：`BrandIn`（`app/schemas/content.py`） |
| PUT | `/brands/{brand_id}` | 是 | Body：`BrandIn` |
| DELETE | `/brands/{brand_id}` | 是 | 成功返回 `{ "ok": true }` |
| POST | `/brands/upload-logo` | 是 | multipart：`file` → `{ "url" }` |

**前端联调**：`frontend/src/services/content.ts` 一致（含 `upload-logo`）。

---

### 轮播（`app/api/v1/banners.py`）

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/banners` | **否** | Query：`page`、`pageSize`、`status`（可选） |
| POST | `/banners` | 是 | Body：`BannerIn` |
| PUT | `/banners/{banner_id}` | 是 | Body：`BannerIn` |
| DELETE | `/banners/{banner_id}` | 是 | |
| POST | `/banners/upload-image` | 是 | multipart：`file` → `{ "url" }` |

**前端联调**：`content.ts` 一致。

---

### 壁纸（`app/api/v1/wallpapers.py`）

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/wallpapers` | **否** | Query：`page`、`pageSize`、`brandId`、`status`、`keyword` |
| POST | `/wallpapers` | 是 | Body：`WallpaperIn`；服务端可补 `coverUrl`、`resolution`、`publishAt` |
| PUT | `/wallpapers/{wallpaper_id}` | 是 | Body：`WallpaperIn` |
| DELETE | `/wallpapers/{wallpaper_id}` | 是 | |
| POST | `/wallpapers/upload-cover` | 是 | `{ "url" }` |
| POST | `/wallpapers/upload-origin` | 是 | `{ "url", "resolution"? }` |

**前端联调**：`content.ts` 一致（含 `upload-cover`、`upload-origin`）。

---

### 音效（`app/api/v1/sounds.py`）

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/sounds` | **否** | Query：`page`、`pageSize`、`brandId`、`status`、`keyword` |
| POST | `/sounds` | 是 | Body：`SoundIn`；可按 `audioUrl` 推断 `duration` |
| PUT | `/sounds/{sound_id}` | 是 | Body：`SoundIn` |
| DELETE | `/sounds/{sound_id}` | 是 | |
| POST | `/sounds/upload-cover` | 是 | `{ "url" }` |
| POST | `/sounds/upload-audio` | 是 | `{ "url" }` |

**前端联调**：路径一致。若提交体缺少 `SoundIn` 必填字段，后端返回 **422**；表单应先上传文件再提交完整字段。

---

### 用户（`app/api/v1/users.py`）

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/users` | 是 | Query：`page`、`pageSize`、`keyword`、`status`；`list` 项含 `_id`、`openId`、`favoriteCount`、`eventCount` 等 |
| PATCH | `/users/{user_id}/status` | 是 | Body：`{ "status": number }`；`user_id` 为 **Mongo 文档 id**（不是 `openId`） |

**前端联调**：`Users.tsx` 使用 `row._id` 调用 `updateUserStatus`，与 `User.get(user_id)` 一致。

---

### 统计（`app/api/v1/stats.py`）

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/stats/overview` | 是 | `totalUsers`、`totalWallpapers`、`totalSounds`、`todayViews`、`todayDownloads`、`todayNewUsers`、`viewsGrowth` |
| GET | `/stats/trend` | 是 | Query：`days`（默认 7，**范围 3–30**）；`dates`、`views`、`downloads`、`newUsers` |
| GET | `/stats/top-content` | 是 | Query：`limit`（1–20）；`wallpapers`、`sounds` 精简列表 |

**前端联调**：`Dashboard.tsx` 与 `types.ts` 字段一致；`getStatsTrend(7)` 在允许范围内。

---

### 公开接口（`app/api/v1/public.py`）

供小程序/客户端使用，管理后台 SPA 通常不调用。

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/public/home` | 首页聚合：banners、brands、hotWallpapers、hotSounds |
| GET | `/public/wallpapers` | 分页；`brandId`、`modelId`、`sortBy` |
| GET | `/public/wallpapers/{wallpaper_id}` | 详情（会递增 hotScore） |
| GET | `/public/sounds` | 分页 |
| GET | `/public/sounds/{sound_id}` | 详情（hotScore+1） |
| GET | `/public/search/suggest` | 搜索建议 |
| GET | `/public/search` | 综合搜索：`keyword`、`type`、`page`、`pageSize` |
| GET | `/public/search/hot` | 热门搜索词 |

---

## 前后端联调摘要

- **路径与 HTTP 方法**：管理端用到的 `/auth`、`/brands`、`/banners`、`/wallpapers`、`/sounds`、`/users`、`/stats` 与后端 **一致**。
- **列表类 GET**（品牌/轮播/壁纸/音效）：后端 **未强制 JWT**；前端仍会附带 Token。若需未登录不可访问，需在对应路由增加 `Depends(get_current_admin)`。
- **部署**：生产环境请配置 `CORS_ORIGINS`、`MEDIA_BASE_URL` 与前端域名、资源域名一致，避免跨域或图片地址错误。
