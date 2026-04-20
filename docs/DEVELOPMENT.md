# 开发指南

## 环境要求

- 微信开发者工具 >= 1.06
- Node.js >= 18.0
- 基础库版本 >= 3.0

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/lfy539/my-car.git
cd my-car
```

### 2. 配置云开发环境

1. 打开微信开发者工具
2. 导入项目，选择 `my-car` 目录
3. 在 `project.config.json` 中填入你的 AppID
4. 开通云开发，创建环境
5. 在 `miniprogram/app.ts` 中配置环境 ID

### 3. 初始化云函数

```bash
# 进入云函数目录
cd cloudfunctions/api-health
npm install

cd ../api-user
npm install
```

### 4. 部署云函数

在微信开发者工具中：
1. 右键点击 `cloudfunctions` 目录
2. 选择"上传并部署：云端安装依赖"

### 5. 创建数据库集合

在云开发控制台创建以下集合：
- `users` - 用户表
- `wallpapers` - 壁纸表
- `sounds` - 音效表
- `brands` - 品牌表
- `car_models` - 车型表
- `user_favorites` - 用户收藏表
- `user_events` - 用户行为表

## 项目结构

```
my-car/
├── miniprogram/           # 小程序代码
│   ├── pages/             # 页面
│   ├── components/        # 组件
│   ├── styles/            # 样式
│   ├── utils/             # 工具函数
│   ├── services/          # API 服务
│   ├── stores/            # 状态管理
│   └── assets/            # 静态资源
├── cloudfunctions/        # 云函数
│   ├── api-health/        # 健康检查
│   └── api-user/          # 用户相关
├── typings/               # 类型定义
├── docs/                  # 文档
└── project.config.json    # 项目配置
```

## 开发规范

### 代码风格
- 使用 TypeScript
- 使用 SCSS 编写样式
- 组件使用 PascalCase 命名
- 文件使用 kebab-case 命名

### Git 提交规范
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建/工具

## 调试技巧

### 查看云函数日志
1. 打开云开发控制台
2. 进入"云函数" -> "日志"
3. 选择对应云函数查看

### 测试接口健康度
1. 进入"我的"页面
2. 点击"接口健康检查"
3. 查看返回结果

## 常见问题

### Q: 云函数调用失败
A: 检查云开发环境 ID 是否正确，云函数是否已部署

### Q: 样式不生效
A: 检查 SCSS 文件是否正确导入变量文件

### Q: TypeScript 报错
A: 检查 typings 目录下的类型定义是否完整
