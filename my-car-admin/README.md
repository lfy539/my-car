# my-car-admin

Phase 1 交付内容：

- 后端：FastAPI 基础框架、MongoDB 初始化、JWT 登录认证、健康检查
- 前端：React + Ant Design 基础后台、登录页、受保护路由、Dashboard 页面
- 测试：Phase 1 独立测试计划与冒烟测试脚本

## 后端启动

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

## 前端启动

```bash
cd frontend
npm install
npm run dev
```

## 一键发布（本地构建 -> 服务器部署）

脚本位置：

- `scripts/deploy_prod.sh`
- `scripts/deploy.conf.example`

使用步骤：

1. 复制配置模板并填写服务器参数

```bash
cd my-car-admin/scripts
cp deploy.conf.example deploy.conf
```

2. 执行一键发布（仅发布应用）

```bash
./deploy_prod.sh
```

3. 首次部署可附带 nginx 站点配置

```bash
./deploy_prod.sh --setup-nginx
```

说明：

- 脚本会在本地执行前端 build 和后端镜像 build。
- 脚本会上传前端 `dist`、后端镜像 tar 和 `ENV_FILE` 到远程服务器。
- 远程默认以 Docker 启动后端容器，并执行健康检查：`/api/v1/health`。
