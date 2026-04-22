# Phase 5 阿里云部署和上线详细方案

## 目标与范围

- 将 `my-car-admin`（FastAPI 后端 + React 管理台）部署到阿里云 ECS 生产环境。
- 使用 `breakcode.top` 子域名：`admin.breakcode.top`（管理台）、`api.breakcode.top`（API）。
- 保持调用链路：`miniprogram -> cloudfunctions -> my-car-admin(API)`。
- 保证可观测、可回滚、可持续发布。

涉及代码与配置路径：
- [my-car-admin/backend/.env.example](/Users/lfy/project/my-car/my-car-admin/backend/.env.example)
- [my-car-admin/backend/requirements.txt](/Users/lfy/project/my-car/my-car-admin/backend/requirements.txt)
- [my-car-admin/frontend/package.json](/Users/lfy/project/my-car/my-car-admin/frontend/package.json)
- [cloudfunctions/api-home/index.js](/Users/lfy/project/my-car/cloudfunctions/api-home/index.js)
- [cloudfunctions/api-wallpapers/index.js](/Users/lfy/project/my-car/cloudfunctions/api-wallpapers/index.js)
- [cloudfunctions/api-sounds/index.js](/Users/lfy/project/my-car/cloudfunctions/api-sounds/index.js)
- [cloudfunctions/api-search/index.js](/Users/lfy/project/my-car/cloudfunctions/api-search/index.js)
- [docs/DEPLOY.md](/Users/lfy/project/my-car/docs/DEPLOY.md)

## 架构落地

```mermaid
flowchart LR
  subgraph aliyunProd [AliyunProduction]
    ecs[ECS_DockerHost]
    nginx[Nginx_ReverseProxy]
    backend[FastAPI_Container]
    frontend[Admin_Static_Build]
    mongo[MongoDB_ReplicaSet]
    oss[Aliyun_OSS]
    cdn[Aliyun_CDN]
    sls[SLS_LogService]
    cms[CloudMonitor]
  end

  adminBrowser[AdminBrowser] -->|"HTTPS admin.breakcode.top"| nginx
  miniCloudFunc[MiniProgram_CloudFunctions] -->|"HTTPS api.breakcode.top"| nginx
  nginx --> frontend
  nginx --> backend
  backend --> mongo
  backend --> oss
  oss --> cdn
  backend --> sls
  cms --> ecs
  cms --> mongo
```

## Phase 5 分步实施

### 1) 购买与开通阿里云资源

- 购买 1 台 ECS（当前可用规格：`ecs.e-c1m1.large`，2C2G）。
- 数据库二选一：
  - 生产推荐：阿里云 MongoDB 副本集；
  - 预算方案：先自建 MongoDB（后续平滑迁移）。
- 开通 OSS（媒体文件）与 CDN（媒体分发，可后置）。
- 申请 SSL 证书（阿里云 SSL DV）。
- 完成域名备案（大陆节点建议完成）。

推荐资源命名：
- ECS: `mycar-prod-ecs`
- Mongo: `mycar-prod-mongo`
- OSS Bucket: `mycar-prod-media`
- 域名: `admin.breakcode.top`，`api.breakcode.top`

### 2) 网络与安全基线配置

- 安全组放行端口：`22`（白名单 IP）、`80`、`443`。
- MongoDB 仅允许 ECS 出口访问。
- ECS 初始化：
  - 创建非 root 用户
  - 配置 SSH key 登录并禁用密码登录
  - 开启最小暴露防火墙
- NTP 时间同步与时区统一（建议 `Asia/Shanghai`）。

### 3) ECS 安装运行时

- 安装 Docker 与 Docker Compose。
- 安装 Nginx（建议宿主机部署，便于证书管理）。
- 创建部署目录结构：
  - `/srv/my-car-admin/backend`
  - `/srv/my-car-admin/frontend`
  - `/srv/my-car-admin/nginx`
  - `/srv/my-car-admin/scripts`
  - `/srv/my-car-admin/logs`

### 4) 应用打包与发布策略

- 后端构建：基于 `backend/requirements.txt` 制作镜像。
- 前端构建：`npm run build` 产物由 Nginx 托管。
- 镜像仓库方案二选一：
  - 阿里云 ACR
  - GitHub Container Registry
- 发布流程：
  - 打版本标签（例如 `v1.0.0`）
  - 构建镜像并推送
  - ECS 拉取新镜像并重启

### 5) 生产环境变量与密钥

后端 `.env` 必填建议项：
- `ENV=prod`
- `JWT_SECRET_KEY=<强随机密钥>`
- `MONGO_URI=<阿里云Mongo连接串>`
- `MONGO_DB_NAME=my_car_admin`
- `MEDIA_BASE_URL=https://cdn.breakcode.top`（未上 CDN 前可用 API 域名静态资源路径）
- `UPLOAD_DIR=/data/uploads`

云函数环境变量（四个函数一致）：
- `ADMIN_API_BASE_URL=https://api.breakcode.top/api/v1`
- `ADMIN_PUBLIC_TOKEN=<可选，若启用公共接口鉴权>`

### 6) Nginx 域名与 HTTPS 配置

- `admin.breakcode.top`:
  - `/` -> 前端静态资源
  - SPA 路由回退 `index.html`
- `api.breakcode.top`:
  - `/api/v1/*` -> FastAPI 容器
  - `/media/*` -> 上传文件目录（或反代 OSS）
- 配置 SSL 证书并开启：
  - HTTP 强制跳转 HTTPS
  - TLS 1.2+，禁用弱加密套件
  - 开启 gzip、请求体大小限制、超时策略

### 7) 数据与媒体迁移

- Mongo 数据准备：
  - 导入 brands/banners/wallpapers/sounds 基础数据
  - 确认索引（与 `docs/DEPLOY.md` 对齐）
- 媒体文件迁移：
  - 短期：`/media` 本地目录托管；
  - 中期：迁移至 OSS + CDN，数据库 URL 切换为 CDN 域名。

### 8) 小程序联调与灰度

- 在微信云开发控制台更新 4 个云函数环境变量。
- 重新部署：`api-home`、`api-wallpapers`、`api-sounds`、`api-search`。
- 云函数云端测试：
  - `api-home` 空参数返回 `code:0`
  - `api-wallpapers` `action:list`
  - `api-sounds` `action:list`
  - `api-search` `action:hot`
- 小程序端回归：
  - 首页、壁纸、音效、搜索、详情页全部走真实数据

### 9) 监控、日志与告警

- 接入阿里云日志服务（SLS）：Nginx 访问日志、后端应用日志。
- 阿里云监控告警：
  - ECS CPU/内存/磁盘阈值
  - API 5xx 比例、响应时延
  - Mongo 连接数与慢查询
- 关键业务指标：
  - 首页成功率
  - 搜索成功率
  - 壁纸/音效详情请求成功率

### 10) 上线验收与发布

上线前验收清单：
- 管理后台可登录、CRUD 正常。
- 小程序核心链路可用（首页、列表、详情、搜索）。
- HTTPS 证书、域名、跨域策略正常。
- 云函数与后端链路稳定，无大量 5xx。

发布策略：
- 先灰度（小程序灰度发布）
- 观察 24h 指标后全量

### 11) 回滚方案

- 应用回滚：
  - 保留上一版镜像 tag，`docker compose` 回退镜像版本。
- 小程序回滚：
  - 微信公众平台“版本回退”到上一稳定版本。
- 数据回滚：
  - MongoDB 备份恢复到指定时间点。

## 交付物（Phase 5）

- 部署脚本与配置：
  - `docker-compose.prod.yml`
  - `nginx/prod.conf`
  - `backend/.env.prod.example`
- 测试文件：
  - `my-car-admin/tests/phase5/phase5_test_plan.md`
  - `my-car-admin/tests/phase5/deploy_verification_checklist.md`
  - `my-car-admin/tests/phase5/online_smoke_test.sh`
- 运维文档：
  - 域名证书更新说明
  - 发布/回滚 SOP

## 时间建议（可执行排期）

- D1：资源购买与网络基线
- D2：容器化部署与域名证书
- D3：数据迁移与云函数联调
- D4：灰度与监控告警上线
- D5：全量发布与验收归档
