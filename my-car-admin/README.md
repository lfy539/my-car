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
