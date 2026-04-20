# 数据一致性规范

本文档定义了小程序与后台管理系统的数据模型规范，确保数据一致性。

## 1. 通用约定

### 1.1 字段命名规范
- 使用 camelCase 命名
- 时间字段统一使用时间戳（毫秒）
- 关联字段以 `Id` 结尾
- 状态字段使用数字枚举

### 1.2 通用字段
```
_id: string          // 自动生成的文档ID
createdAt: number    // 创建时间戳
updatedAt: number    // 更新时间戳
```

### 1.3 状态枚举
```
status:
  0 = 待审核/草稿
  1 = 已上架/启用
  2 = 已下架/禁用
```

---

## 2. 数据模型定义

### 2.1 轮播图 (banners)

| 字段 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| _id | string | 是 | 文档ID |
| imageUrl | string | 是 | 图片URL（云存储路径） |
| linkType | string | 是 | 跳转类型：wallpaper/sound/url/none |
| linkUrl | string | 否 | 跳转地址（当linkType为url时必填） |
| targetId | string | 否 | 目标ID（当linkType为wallpaper/sound时必填） |
| title | string | 否 | 标题（用于SEO） |
| status | number | 是 | 状态：0=下架, 1=上架 |
| sort | number | 是 | 排序（升序） |
| createdAt | number | 是 | 创建时间 |
| updatedAt | number | 是 | 更新时间 |

**索引：**
- `status + sort`（复合索引）

---

### 2.2 品牌 (brands)

| 字段 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| _id | string | 是 | 文档ID |
| name | string | 是 | 品牌名称（2-20字符） |
| logo | string | 否 | Logo图片URL |
| sort | number | 是 | 排序（升序） |
| createdAt | number | 是 | 创建时间 |
| updatedAt | number | 是 | 更新时间 |

**索引：**
- `sort`（单字段索引）

---

### 2.3 车型 (car_models)

| 字段 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| _id | string | 是 | 文档ID |
| brandId | string | 是 | 关联品牌ID |
| name | string | 是 | 车型名称（2-30字符） |
| sort | number | 是 | 排序（升序） |
| createdAt | number | 是 | 创建时间 |
| updatedAt | number | 是 | 更新时间 |

**索引：**
- `brandId + sort`（复合索引）

---

### 2.4 壁纸 (wallpapers)

| 字段 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| _id | string | 是 | 文档ID |
| title | string | 是 | 标题（2-50字符） |
| coverUrl | string | 是 | 封面图URL（缩略图） |
| originUrl | string | 是 | 原图URL（高清大图） |
| brandId | string | 是 | 关联品牌ID |
| modelId | string | 否 | 关联车型ID |
| tags | array | 否 | 标签数组，如 ["科技", "简约"] |
| resolution | string | 是 | 分辨率，如 "1080x1920" |
| fileSize | number | 否 | 文件大小（字节） |
| status | number | 是 | 状态：0=待审核, 1=已上架, 2=已下架 |
| publishAt | number | 是 | 发布时间戳 |
| hotScore | number | 是 | 热度分数（默认0，查看+1） |
| downloadCount | number | 否 | 下载次数 |
| favoriteCount | number | 否 | 收藏次数 |
| createdAt | number | 是 | 创建时间 |
| updatedAt | number | 是 | 更新时间 |

**索引：**
- `status + publishAt`（复合索引，列表默认排序）
- `status + hotScore`（复合索引，热门排序）
- `brandId + status`（复合索引，品牌筛选）
- `tags`（多值索引，标签筛选）

**云存储路径规范：**
```
封面图: /wallpapers/covers/{_id}.jpg
原图: /wallpapers/origins/{_id}.jpg
```

---

### 2.5 音效 (sounds)

| 字段 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| _id | string | 是 | 文档ID |
| title | string | 是 | 标题（2-50字符） |
| coverUrl | string | 是 | 封面图URL |
| audioUrl | string | 是 | 音频文件URL |
| brandId | string | 是 | 关联品牌ID |
| modelId | string | 否 | 关联车型ID |
| soundType | string | 是 | 音效类型（见枚举） |
| duration | number | 是 | 时长（秒） |
| bitrate | number | 否 | 比特率（kbps），默认320 |
| fileSize | number | 否 | 文件大小（字节） |
| status | number | 是 | 状态：0=待审核, 1=已上架, 2=已下架 |
| publishAt | number | 是 | 发布时间戳 |
| hotScore | number | 是 | 热度分数（默认0） |
| playCount | number | 否 | 播放次数 |
| downloadCount | number | 否 | 下载次数 |
| favoriteCount | number | 否 | 收藏次数 |
| createdAt | number | 是 | 创建时间 |
| updatedAt | number | 是 | 更新时间 |

**soundType 枚举：**
```
锁车声 | 解锁声 | 启动声 | 迎宾音 | 提示音 | 充电提示 | 其他
```

**索引：**
- `status + publishAt`（复合索引）
- `status + hotScore`（复合索引）
- `brandId + status`（复合索引）
- `soundType + status`（复合索引）

**云存储路径规范：**
```
封面图: /sounds/covers/{_id}.jpg
音频: /sounds/audios/{_id}.mp3
```

---

### 2.6 用户 (users)

| 字段 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| _id | string | 是 | 文档ID |
| openId | string | 是 | 微信OpenID（唯一） |
| unionId | string | 否 | 微信UnionID |
| nickname | string | 否 | 昵称 |
| avatar | string | 否 | 头像URL |
| phone | string | 否 | 手机号（加密存储） |
| status | number | 是 | 状态：1=正常, 2=禁用 |
| lastLoginAt | number | 否 | 最后登录时间 |
| createdAt | number | 是 | 创建时间 |
| updatedAt | number | 是 | 更新时间 |

**索引：**
- `openId`（唯一索引）

---

### 2.7 用户收藏 (user_favorites)

| 字段 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| _id | string | 是 | 文档ID |
| userId | string | 是 | 用户OpenID |
| targetType | string | 是 | 目标类型：wallpaper/sound |
| targetId | string | 是 | 目标ID |
| createdAt | number | 是 | 创建时间 |

**索引：**
- `userId + targetType + targetId`（唯一复合索引，防重复收藏）
- `userId + createdAt`（复合索引，收藏列表排序）

---

### 2.8 用户事件 (user_events)

| 字段 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| _id | string | 是 | 文档ID |
| userId | string | 是 | 用户OpenID |
| eventType | string | 是 | 事件类型（见枚举） |
| targetType | string | 否 | 目标类型：wallpaper/sound |
| targetId | string | 否 | 目标ID |
| ext | object | 否 | 扩展数据 |
| createdAt | number | 是 | 创建时间 |

**eventType 枚举：**
```
view     - 浏览详情
download - 下载
play     - 播放音效
favorite - 收藏
share    - 分享
search   - 搜索
```

**索引：**
- `eventType + createdAt`（复合索引，统计查询）
- `targetType + targetId + createdAt`（复合索引，内容热度统计）

---

## 3. API 响应规范

### 3.1 统一响应格式

```typescript
interface ApiResponse<T> {
  code: number;      // 状态码
  message: string;   // 提示信息
  data: T;           // 响应数据
  timestamp: number; // 响应时间戳
}
```

### 3.2 状态码定义

| 范围 | 说明 |
|-----|------|
| 0 | 成功 |
| 1xxx | 参数错误 |
| 2xxx | 认证/权限错误 |
| 3xxx | 业务逻辑错误 |
| 5xxx | 服务器错误 |

### 3.3 分页响应格式

```typescript
interface PageResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

---

## 4. 数据校验规则

### 4.1 字符串校验
- title: 2-50字符，不允许特殊字符
- tags: 每个标签1-10字符，最多10个标签
- resolution: 格式 `{width}x{height}`

### 4.2 URL校验
- 必须是有效的云存储路径或HTTPS链接
- 图片支持: jpg, png, webp
- 音频支持: mp3, m4a, wav

### 4.3 关联校验
- brandId 必须存在于 brands 集合
- modelId 如果填写，必须存在于 car_models 集合且属于该 brandId

---

## 5. CMS 管理注意事项

1. **上传媒体文件**：先上传到云存储，获取URL后再填入字段
2. **发布时间**：设置为未来时间可实现定时发布
3. **热度分数**：由系统自动计算，CMS中不建议手动修改
4. **删除内容**：建议改为下架状态而非物理删除，保证数据可追溯
5. **批量操作**：修改品牌/车型时注意关联内容的更新
