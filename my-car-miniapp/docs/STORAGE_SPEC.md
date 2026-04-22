# 云存储目录规范

## 目录结构

```
云存储根目录/
├── images/
│   ├── wallpapers/
│   │   ├── thumb/          # 壁纸缩略图（宽度 400px）
│   │   │   └── {id}.webp
│   │   └── origin/         # 壁纸原图
│   │       └── {id}.jpg
│   ├── brands/             # 品牌 Logo
│   │   └── {brandId}.png
│   └── avatars/            # 用户头像
│       └── {userId}.jpg
├── sounds/
│   ├── preview/            # 音效试听版（前 15s，128kbps）
│   │   └── {id}.mp3
│   └── full/               # 音效完整版
│       └── {id}.mp3
└── banners/                # 轮播图
    └── {id}.jpg
```

## 命名规范

### 文件命名
- 使用小写字母和数字
- 使用连字符 `-` 分隔单词
- 文件名格式：`{id}.{ext}` 或 `{id}-{variant}.{ext}`

### 示例
- 壁纸缩略图：`images/wallpapers/thumb/abc123.webp`
- 壁纸原图：`images/wallpapers/origin/abc123.jpg`
- 音效预览：`sounds/preview/xyz789.mp3`
- 音效完整：`sounds/full/xyz789.mp3`

## 图片规格

| 类型 | 尺寸 | 格式 | 质量 |
|------|------|------|------|
| 壁纸缩略图 | 400px 宽 | WebP | 80% |
| 壁纸原图 | 原始尺寸 | JPG/PNG | 90% |
| 品牌 Logo | 200x200 | PNG | - |
| 用户头像 | 200x200 | JPG | 85% |
| 轮播图 | 750x400 | JPG | 85% |

## 音频规格

| 类型 | 时长 | 码率 | 格式 |
|------|------|------|------|
| 音效试听 | 前 15s | 128kbps | MP3 |
| 音效完整 | 完整 | 320kbps | MP3 |

## 访问权限

### 公开读取
- `images/**` - 所有图片
- `sounds/preview/**` - 音效试听版
- `banners/**` - 轮播图

### 需要鉴权
- `sounds/full/**` - 音效完整版（需登录）
- `avatars/**` - 用户头像（仅本人可写）

## CDN 配置

- 启用 CDN 加速
- 缓存时间：7 天
- 支持 WebP 自动转换
- 支持图片裁剪参数
