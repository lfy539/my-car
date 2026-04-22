# my-car Monorepo

当前仓库已拆分为两个独立子项目：

- `my-car-miniapp`：微信小程序端（含云函数与文档）
- `my-car-admin`：独立后台管理系统（FastAPI + React）

## 子项目说明

### 1) 小程序项目

- 路径：`my-car-miniapp`
- 技术栈：微信小程序 + TypeScript + SCSS + 云函数代理
- 核心目录：
  - `my-car-miniapp/miniprogram`
  - `my-car-miniapp/cloudfunctions`
  - `my-car-miniapp/docs`

### 2) 后台管理项目

- 路径：`my-car-admin`
- 技术栈：FastAPI + MongoDB + React + Ant Design
- 核心目录：
  - `my-car-admin/backend`
  - `my-car-admin/frontend`
  - `my-car-admin/tests`

## 仓库结构

```
my-car/
├── my-car-miniapp/        # 小程序项目（含云函数与文档）
│   ├── miniprogram/
│   ├── cloudfunctions/
│   ├── docs/
│   ├── scripts/
│   └── typings/
└── my-car-admin/          # 后台管理项目
    ├── backend/
    ├── frontend/
    └── tests/
```

## 文档

- 小程序文档：`my-car-miniapp/docs`
- 后台文档：`my-car-admin/README.md`

## License

MIT
