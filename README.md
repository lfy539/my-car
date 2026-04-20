# 车机美化库

电车专属美化库 · 打造专属移动座舱

一款为电车车主打造的微信小程序，提供精选壁纸和个性音效下载服务。

## 功能特点

- 🖼️ **精选壁纸** - 按车型品牌分类的高质量壁纸
- 🎵 **个性音效** - 锁车声、启动声、提示音等
- ⭐ **收藏管理** - 收藏喜欢的壁纸和音效
- 🔍 **智能搜索** - 快速找到想要的资源
- 📱 **深色主题** - 科技感十足的界面设计

## 支持品牌

- 特斯拉 Tesla
- 比亚迪 BYD
- 蔚来 NIO
- 小鹏 XPeng
- 理想 Li Auto
- 零跑 Leapmotor

## 技术栈

- **前端**: 微信小程序 + TypeScript + SCSS
- **后端**: 微信云开发 (云函数 + 云数据库 + 云存储)
- **状态管理**: 自研轻量级 Store

## 快速开始

1. 克隆项目
```bash
git clone https://github.com/lfy539/my-car.git
```

2. 使用微信开发者工具打开项目

3. 配置云开发环境

4. 部署云函数

详细步骤请参考 [开发指南](docs/DEVELOPMENT.md)

## 项目结构

```
my-car/
├── miniprogram/           # 小程序代码
│   ├── pages/             # 页面（首页/壁纸/音效/我的）
│   ├── components/        # 通用组件
│   ├── styles/            # 全局样式和主题变量
│   ├── utils/             # 工具函数
│   ├── services/          # API 服务层
│   └── stores/            # 状态管理
├── cloudfunctions/        # 云函数
├── typings/               # TypeScript 类型定义
└── docs/                  # 项目文档
```

## 文档

- [API 错误码规范](docs/API_ERROR_CODES.md)
- [云存储目录规范](docs/STORAGE_SPEC.md)
- [开发指南](docs/DEVELOPMENT.md)

## 开发状态

- [x] Phase 0: 项目初始化与技术底座
- [ ] Phase 1: MVP 壁纸+音效闭环
- [ ] Phase 2: 体验增强与性能优化
- [ ] Phase 3: 运营增长与后台能力
- [ ] Phase 4: 商业化与规模化

## License

MIT
