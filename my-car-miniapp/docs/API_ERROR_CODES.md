# API 错误码规范

## 错误码分类

| 范围 | 类别 | 说明 |
|------|------|------|
| 0 | 成功 | 请求成功 |
| 1xxx | 客户端错误 | 参数错误、网络问题等 |
| 2xxx | 认证错误 | 登录、权限相关 |
| 3xxx | 业务错误 | 业务逻辑相关 |
| 5xxx | 服务端错误 | 服务器内部错误 |

## 详细错误码

### 成功 (0)
| 错误码 | 名称 | 说明 |
|--------|------|------|
| 0 | SUCCESS | 请求成功 |

### 客户端错误 (1xxx)
| 错误码 | 名称 | 说明 |
|--------|------|------|
| 1000 | CLIENT_ERROR | 客户端错误 |
| 1001 | INVALID_PARAMS | 参数错误 |
| 1002 | NETWORK_ERROR | 网络连接失败 |
| 1003 | TIMEOUT | 请求超时 |
| 1004 | CLOUD_NOT_READY | 云服务未就绪 |

### 认证错误 (2xxx)
| 错误码 | 名称 | 说明 |
|--------|------|------|
| 2000 | AUTH_ERROR | 认证失败 |
| 2001 | NOT_LOGGED_IN | 未登录 |
| 2002 | TOKEN_EXPIRED | 登录已过期 |
| 2003 | TOKEN_INVALID | 登录凭证无效 |
| 2004 | PERMISSION_DENIED | 没有操作权限 |

### 业务错误 (3xxx)
| 错误码 | 名称 | 说明 |
|--------|------|------|
| 3000 | BUSINESS_ERROR | 操作失败 |
| 3001 | RESOURCE_NOT_FOUND | 资源不存在 |
| 3002 | RESOURCE_ALREADY_EXISTS | 资源已存在 |
| 3003 | OPERATION_FAILED | 操作失败 |
| 3004 | LIMIT_EXCEEDED | 操作次数超限 |

### 服务端错误 (5xxx)
| 错误码 | 名称 | 说明 |
|--------|------|------|
| 5000 | SERVER_ERROR | 服务器繁忙 |
| 5001 | DATABASE_ERROR | 数据服务异常 |
| 5002 | STORAGE_ERROR | 存储服务异常 |
| 5003 | CLOUD_FUNCTION_ERROR | 云函数执行失败 |

## 统一响应格式

```typescript
interface ApiResponse<T = any> {
  code: number;      // 错误码
  message: string;   // 错误信息
  data: T;          // 响应数据
  timestamp: number; // 响应时间戳
}
```

## 示例

### 成功响应
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "_id": "xxx",
    "title": "壁纸标题"
  },
  "timestamp": 1713542400000
}
```

### 错误响应
```json
{
  "code": 2001,
  "message": "请先登录",
  "data": null,
  "timestamp": 1713542400000
}
```
