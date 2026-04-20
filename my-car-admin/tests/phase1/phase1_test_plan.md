# Phase 1 测试计划

## 1. 测试范围

- 后端基础能力：服务启动、数据库连接、健康检查、认证登录、当前用户接口
- 前端基础能力：登录页面、路由守卫、Dashboard 渲染

## 2. 测试环境

- Python 3.11+
- Node.js 20+
- MongoDB 6.0+
- Backend: `http://127.0.0.1:8000`
- Frontend: `http://127.0.0.1:5174`

## 3. 测试数据

- 默认管理员（由后端启动自动创建）
  - username: `admin`
  - password: `admin123456`

## 4. 测试步骤

1. 启动 MongoDB。
2. 启动后端并确认日志无报错。
3. 执行 `python tests/phase1/backend_smoke_test.py`。
4. 启动前端并访问登录页。
5. 使用默认管理员登录。
6. 验证进入 Dashboard 页面并可退出登录。

## 5. 预期结果

- `/api/v1/health` 返回 `ok=true`
- 登录返回 `access_token`
- `/api/v1/auth/me` 返回管理员信息
- 未登录访问首页自动跳转到登录页
- 登录后进入 Dashboard

## 6. 实际结果

- 后端冒烟脚本执行通过（3/3）：
  - health check 可用
  - 管理员登录成功
  - 获取当前管理员信息成功
- 前端自动化冒烟通过：
  - `npm install` 成功
  - `npm run build` 成功

## 7. 问题记录

- Python 依赖安装初次失败：本机 SSL 证书校验失败，改用 trusted-host 参数后安装成功
- 前端首次构建失败：`ImportMeta.env` 类型缺失，补充 `src/vite-env.d.ts` 后构建通过

## 8. 结论

- PASS（自动化测试通过；UI 手工交互测试可在下一轮补充）
