/**
 * 统一错误码规范
 */

export const ErrorCodes = {
  SUCCESS: 0,

  // 客户端错误 (1xxx)
  CLIENT_ERROR: 1000,
  INVALID_PARAMS: 1001,
  NETWORK_ERROR: 1002,
  TIMEOUT: 1003,
  CLOUD_NOT_READY: 1004,

  // 认证错误 (2xxx)
  AUTH_ERROR: 2000,
  NOT_LOGGED_IN: 2001,
  TOKEN_EXPIRED: 2002,
  TOKEN_INVALID: 2003,
  PERMISSION_DENIED: 2004,

  // 业务错误 (3xxx)
  BUSINESS_ERROR: 3000,
  RESOURCE_NOT_FOUND: 3001,
  RESOURCE_ALREADY_EXISTS: 3002,
  OPERATION_FAILED: 3003,
  LIMIT_EXCEEDED: 3004,

  // 服务端错误 (5xxx)
  SERVER_ERROR: 5000,
  DATABASE_ERROR: 5001,
  STORAGE_ERROR: 5002,
  CLOUD_FUNCTION_ERROR: 5003,
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

export const ErrorMessages: Record<number, string> = {
  [ErrorCodes.SUCCESS]: '成功',
  [ErrorCodes.CLIENT_ERROR]: '客户端错误',
  [ErrorCodes.INVALID_PARAMS]: '参数错误',
  [ErrorCodes.NETWORK_ERROR]: '网络连接失败，请检查网络',
  [ErrorCodes.TIMEOUT]: '请求超时，请稍后重试',
  [ErrorCodes.CLOUD_NOT_READY]: '云服务未就绪',
  [ErrorCodes.AUTH_ERROR]: '认证失败',
  [ErrorCodes.NOT_LOGGED_IN]: '请先登录',
  [ErrorCodes.TOKEN_EXPIRED]: '登录已过期，请重新登录',
  [ErrorCodes.TOKEN_INVALID]: '登录凭证无效',
  [ErrorCodes.PERMISSION_DENIED]: '没有操作权限',
  [ErrorCodes.BUSINESS_ERROR]: '操作失败',
  [ErrorCodes.RESOURCE_NOT_FOUND]: '资源不存在',
  [ErrorCodes.RESOURCE_ALREADY_EXISTS]: '资源已存在',
  [ErrorCodes.OPERATION_FAILED]: '操作失败，请重试',
  [ErrorCodes.LIMIT_EXCEEDED]: '操作次数超限',
  [ErrorCodes.SERVER_ERROR]: '服务器繁忙，请稍后重试',
  [ErrorCodes.DATABASE_ERROR]: '数据服务异常',
  [ErrorCodes.STORAGE_ERROR]: '存储服务异常',
  [ErrorCodes.CLOUD_FUNCTION_ERROR]: '云函数执行失败',
};

export function getErrorMessage(code: number): string {
  return ErrorMessages[code] || '未知错误';
}
