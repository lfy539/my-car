# 部署上线指南

本文档详细说明车机美化库小程序的部署上线步骤。

## 一、部署前准备

### 1.1 环境要求

- 微信开发者工具 >= 1.06.2401020
- Node.js >= 16.x
- 已注册小程序账号（企业或个人）
- 已开通云开发服务

### 1.2 账号信息确认

```
小程序 AppID: ______________
云开发环境ID: ______________
管理员微信号: ______________
```

### 1.3 域名配置

在 [微信公众平台](https://mp.weixin.qq.com) -> 开发 -> 开发设置 中配置：

**request 合法域名：**
- https://api.weixin.qq.com
- 云开发自动配置

**uploadFile 合法域名：**
- 云开发自动配置

**downloadFile 合法域名：**
- 云开发自动配置

---

## 二、云开发环境配置

### 2.1 创建正式环境

1. 打开微信开发者工具
2. 点击「云开发」按钮
3. 点击「设置」->「环境设置」
4. 创建新环境，命名为 `prod` 或 `production`
5. 选择付费模式（推荐按量付费）

### 2.2 创建数据库集合

在云开发控制台 -> 数据库中创建以下集合：

| 集合名称 | 说明 |
|---------|------|
| banners | 轮播图 |
| brands | 品牌 |
| car_models | 车型 |
| wallpapers | 壁纸 |
| sounds | 音效 |
| users | 用户 |
| user_favorites | 用户收藏 |
| user_events | 用户事件 |
| search_keywords | 搜索关键词 |

### 2.3 创建数据库索引

**wallpapers 集合：**
```javascript
// 索引 1: 列表默认排序
{ status: 1, publishAt: -1 }

// 索引 2: 热门排序
{ status: 1, hotScore: -1 }

// 索引 3: 品牌筛选
{ brandId: 1, status: 1 }
```

**sounds 集合：**
```javascript
// 索引 1: 列表默认排序
{ status: 1, publishAt: -1 }

// 索引 2: 热门排序
{ status: 1, hotScore: -1 }

// 索引 3: 品牌筛选
{ brandId: 1, status: 1 }

// 索引 4: 类型筛选
{ soundType: 1, status: 1 }
```

**user_favorites 集合：**
```javascript
// 唯一索引: 防止重复收藏
{ userId: 1, targetType: 1, targetId: 1 } (unique)

// 索引: 收藏列表查询
{ userId: 1, createdAt: -1 }
```

**user_events 集合：**
```javascript
// 索引: 统计查询
{ eventType: 1, createdAt: -1 }

// 索引: 内容热度统计
{ targetType: 1, targetId: 1, createdAt: -1 }
```

**users 集合：**
```javascript
// 唯一索引
{ openId: 1 } (unique)
```

### 2.4 配置存储目录

在云开发控制台 -> 存储中创建目录：

```
/wallpapers/
  /covers/     - 壁纸封面图
  /origins/    - 壁纸原图
/sounds/
  /covers/     - 音效封面
  /audios/     - 音频文件
/brands/       - 品牌Logo
/banners/      - 轮播图
/avatars/      - 用户头像
```

### 2.5 配置安全规则

**数据库安全规则示例：**

```json
{
  "read": true,
  "write": "auth.openid == doc.userId || auth.openid == doc._openid"
}
```

**存储安全规则：**
- 读取：所有用户
- 写入：仅管理员（通过 CMS）

---

## 三、云函数部署

### 3.1 部署步骤

1. 在微信开发者工具中打开项目
2. 确保 `project.config.json` 中的 `cloudfunctionRoot` 正确
3. 右键点击 `cloudfunctions` 目录下的每个函数
4. 选择「上传并部署：云端安装依赖」

### 3.2 云函数列表

| 函数名 | 说明 | 超时时间 | 内存 |
|-------|------|---------|------|
| api-health | 健康检查 | 3s | 128MB |
| api-user | 用户管理 | 5s | 128MB |
| api-home | 首页数据 | 5s | 128MB |
| api-wallpapers | 壁纸接口 | 5s | 128MB |
| api-sounds | 音效接口 | 5s | 128MB |
| api-favorites | 收藏接口 | 5s | 128MB |
| api-search | 搜索接口 | 5s | 256MB |
| api-events | 埋点接口 | 3s | 128MB |
| api-stats | 统计接口 | 10s | 256MB |

### 3.3 验证部署

部署完成后，在云开发控制台测试每个函数：

```javascript
// 测试 api-health
{}

// 测试 api-home
{}

// 测试 api-wallpapers
{ "action": "list", "page": 1, "pageSize": 10 }
```

---

## 四、CMS 内容管理配置

### 4.1 开启 CMS

1. 云开发控制台 -> 内容管理
2. 点击「开通」
3. 选择正式环境

### 4.2 创建内容模型

**轮播图 (banners)：**
- imageUrl (图片)
- linkType (枚举: wallpaper/sound/url/none)
- linkUrl (单行文本)
- targetId (单行文本)
- status (数字)
- sort (数字)

**品牌 (brands)：**
- name (单行文本)
- logo (图片)
- sort (数字)

**壁纸 (wallpapers)：**
- title (单行文本)
- coverUrl (图片)
- originUrl (图片)
- brandId (关联-brands)
- modelId (关联-car_models)
- tags (数组)
- resolution (单行文本)
- status (枚举: 0-待审核/1-已上架/2-已下架)
- publishAt (日期时间)

**音效 (sounds)：**
- title (单行文本)
- coverUrl (图片)
- audioUrl (文件)
- brandId (关联-brands)
- modelId (关联-car_models)
- soundType (枚举)
- duration (数字)
- bitrate (数字)
- status (枚举)
- publishAt (日期时间)

### 4.3 初始数据导入

通过 CMS 或数据库控制台导入初始数据：

```javascript
// brands 示例
[
  { "name": "特斯拉", "logo": "", "sort": 1 },
  { "name": "比亚迪", "logo": "", "sort": 2 },
  { "name": "蔚来", "logo": "", "sort": 3 },
  { "name": "小鹏", "logo": "", "sort": 4 },
  { "name": "理想", "logo": "", "sort": 5 },
  { "name": "零跑", "logo": "", "sort": 6 }
]
```

---

## 五、小程序代码配置

### 5.1 修改环境 ID

编辑 `miniprogram/app.ts`：

```typescript
wx.cloud.init({
  env: 'your-prod-env-id',  // 替换为正式环境ID
  traceUser: true,
});
```

### 5.2 关闭 Mock 模式

在以下文件中将 `USE_MOCK` 设置为 `false`：

- `miniprogram/pages/index/index.ts`
- `miniprogram/pages/wallpaper/index.ts`
- `miniprogram/pages/sound/index.ts`
- `miniprogram/pages/search/index.ts`

### 5.3 检查配置文件

确认 `project.config.json`：

```json
{
  "appid": "你的正式AppID",
  "projectname": "车机美化库",
  "miniprogramRoot": "miniprogram/",
  "cloudfunctionRoot": "cloudfunctions/"
}
```

---

## 六、提交审核

### 6.1 上传代码

1. 微信开发者工具 -> 工具栏 -> 上传
2. 填写版本号（如 1.0.0）
3. 填写项目备注

### 6.2 提交审核

1. 登录 [微信公众平台](https://mp.weixin.qq.com)
2. 进入「管理」->「版本管理」
3. 找到刚上传的版本
4. 点击「提交审核」
5. 填写审核信息：
   - 服务类目
   - 功能页面
   - 测试账号（如需要）

### 6.3 审核注意事项

- 确保隐私协议页面完整
- 确保用户协议页面完整
- 内容需符合规范，无违规内容
- 图片无版权问题
- 音频文件无版权问题

---

## 七、发布上线

### 7.1 审核通过后

1. 登录微信公众平台
2. 版本管理 -> 审核版本
3. 点击「发布」

### 7.2 灰度发布（可选）

- 可选择按比例发布（如 10%、50%、100%）
- 观察数据指标
- 确认无问题后全量发布

---

## 八、上线检查清单

| 检查项 | 状态 |
|-------|------|
| 云环境 ID 已切换为正式环境 | [ ] |
| 所有云函数已部署并测试通过 | [ ] |
| 数据库索引已创建 | [ ] |
| 初始数据已导入（品牌列表） | [ ] |
| CMS 管理员已配置 | [ ] |
| USE_MOCK 已设置为 false | [ ] |
| 隐私协议页面已添加 | [ ] |
| 用户协议页面已添加 | [ ] |
| AppID 配置正确 | [ ] |
| 版本号已更新 | [ ] |
| 审核信息已填写完整 | [ ] |

---

## 九、上线后运维

### 9.1 监控告警

在云开发控制台设置：

1. 云函数错误率 > 1% 告警
2. 云函数超时率 > 5% 告警
3. 数据库读取量突增告警
4. 存储空间使用率 > 80% 告警

### 9.2 数据备份

- 数据库：开启每日自动备份
- 存储：重要文件定期归档

### 9.3 日常运营

1. 定期通过 CMS 上传新内容
2. 查看统计数据（api-stats）
3. 监控用户反馈
4. 处理举报内容

---

## 十、回滚方案

如发现严重问题需要回滚：

### 10.1 小程序回滚

1. 微信公众平台 -> 版本管理
2. 选择上一个稳定版本
3. 点击「版本回退」

### 10.2 云函数回滚

1. 云开发控制台 -> 云函数
2. 选择需要回滚的函数
3. 点击「版本管理」
4. 选择上一个版本发布

### 10.3 数据库回滚

1. 云开发控制台 -> 数据库
2. 选择「备份与恢复」
3. 选择备份时间点
4. 执行恢复

---

## 附录：常见问题

### Q1: 云函数调用失败

检查：
- 云环境 ID 是否正确
- 云函数是否已部署
- 网络是否正常

### Q2: 图片加载失败

检查：
- 存储安全规则是否正确
- 文件是否已上传
- URL 路径是否正确

### Q3: 审核被拒

常见原因：
- 内容不合规
- 缺少必要页面（隐私协议等）
- 功能描述不清晰
- 类目选择不正确

---

## 十一、阿里云生产部署（my-car-admin）

本节用于独立后台 `my-car-admin` 生产部署，域名固定为：

- 管理前端：`https://admin.breakcode.top`
- 后端 API：`https://api.breakcode.top`

### 11.1 ECS 目录与运行时

建议在 ECS 上使用以下目录：

```bash
/srv/my-car-admin/
  ├── backend/
  ├── frontend/
  ├── nginx/
  ├── logs/
  └── scripts/
```

安装运行时：

- Docker
- Docker Compose
- Nginx（宿主机）

### 11.2 Docker Compose（示例）

在 `/srv/my-car-admin/backend/docker-compose.prod.yml`：

```yaml
version: "3.9"
services:
  backend:
    image: your-registry/my-car-admin-backend:latest
    container_name: mycar_backend
    restart: always
    env_file:
      - .env
    ports:
      - "127.0.0.1:8000:8000"
    volumes:
      - /srv/my-car-admin/backend/uploads:/data/uploads
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 11.3 Nginx（admin/api 双域名）

`admin.breakcode.top`（前端静态）：

- `root` 指向前端构建产物目录
- 开启 SPA fallback：`try_files $uri /index.html`

`api.breakcode.top`（反代后端）：

- `/api/v1/` -> `http://127.0.0.1:8000/api/v1/`
- `/media/` -> `/srv/my-car-admin/backend/uploads/`

Nginx 关键项：

- HTTP 跳转 HTTPS
- TLS 1.2+
- gzip on
- `client_max_body_size`（建议 `20m`）
- `proxy_read_timeout`（建议 `60s`）

### 11.4 后端生产环境变量

参考 `my-car-admin/backend/.env.example`，生产环境至少配置：

```bash
ENV=prod
MONGO_URI=mongodb://xxx:xxx@mongo:27017
MONGO_DB_NAME=my_car_admin
JWT_SECRET_KEY=<strong-secret>
MEDIA_BASE_URL=https://api.breakcode.top/media
UPLOAD_DIR=/data/uploads
CORS_ORIGINS=["https://admin.breakcode.top"]
```

### 11.5 云函数环境变量切换（关键）

需要更新以下云函数：

- `api-home`
- `api-wallpapers`
- `api-sounds`
- `api-search`

统一环境变量：

```text
ADMIN_API_BASE_URL=https://api.breakcode.top/api/v1
ADMIN_PUBLIC_TOKEN=<public-token-or-empty>
```

发布步骤：

1. 微信开发者工具 -> 云开发 -> 云函数
2. 分别进入上述四个函数，更新环境变量
3. 执行“上传并部署：云端安装依赖”
4. 控制台测试：
   - `api-home`：`{}`
   - `api-wallpapers`：`{"action":"list","page":1,"pageSize":10}`
   - `api-sounds`：`{"action":"list","page":1,"pageSize":10}`
   - `api-search`：`{"action":"hot"}`

### 11.6 切换与回滚策略

切换顺序：

1. `api.breakcode.top` 健康检查通过（`/api/v1/health`）
2. 管理后台 `admin.breakcode.top` 登录与 CRUD 通过
3. 更新并部署 4 个云函数环境变量
4. 小程序全链路回归

回滚顺序：

1. 云函数 `ADMIN_API_BASE_URL` 回切到旧地址
2. 后端镜像回退到上一版本 tag
3. 数据库按备份时间点恢复（仅在数据异常时）

### 11.7 上线验收（阿里云）

- `admin.breakcode.top` 可打开且登录成功
- `api.breakcode.top/api/v1/health` 返回正常
- 小程序首页/壁纸/音效/搜索走真实数据
- 云函数日志中无持续性 5xx 错误
- Nginx 与后端日志可检索、可定位请求链路
