# Phase 5 测试计划（阿里云部署）

## 目标

- 验证 `my-car-admin` 在阿里云 ECS 部署可用。
- 验证 `admin.breakcode.top` 与 `api.breakcode.top` HTTPS 链路可用。
- 验证云函数代理链路已切换到 `api.breakcode.top` 且支持回滚。

## 范围

- 后台前端：登录、内容 CRUD 基本流程。
- 后台 API：健康检查、public 接口可用性。
- 云函数代理：`api-home`、`api-wallpapers`、`api-sounds`、`api-search`。
- 小程序核心页面：首页、壁纸、音效、搜索。

## 前置条件

- ECS、Nginx、Docker Compose 已部署。
- 域名已解析并签发 SSL 证书。
- 云函数已更新环境变量：
  - `ADMIN_API_BASE_URL=https://api.breakcode.top/api/v1`
  - `ADMIN_PUBLIC_TOKEN=<生产值或空>`
- 小程序 `USE_MOCK=false`。

## 测试用例分组

### A. 基础连通性

1. `curl https://api.breakcode.top/api/v1/health` 返回 200。
2. 浏览器访问 `https://admin.breakcode.top` 页面可加载。
3. 后台登录成功，获取 token 正常。

### B. 云函数代理验证

1. `api-home` 空参数返回 `code=0` 且带 `banners/brands`。
2. `api-wallpapers(action=list)` 返回分页结构。
3. `api-sounds(action=list)` 返回分页结构。
4. `api-search(action=hot)` 返回 `keywords` 数组。

### C. 小程序端回归

1. 首页模块可见且不报“获取首页数据失败”。
2. 壁纸/音效列表可加载，详情可打开。
3. 搜索建议与搜索结果可返回真实数据。

### D. 回滚演练

1. 将 4 个云函数 `ADMIN_API_BASE_URL` 临时改为旧地址，验证可恢复旧链路。
2. 回切新地址后再次验证全部通过。
3. 记录回滚耗时与影响范围。

## 通过标准

- A/B/C 用例全部通过。
- D 回滚演练可在 10 分钟内完成回切。
- 无持续性 5xx 与超时告警。
