/**
 * 云函数请求封装
 * - 统一错误处理
 * - Loading 状态管理
 * - 自动重试
 * - 超时处理
 */

import { ErrorCodes, getErrorMessage } from './error-codes';

interface RequestOptions {
  showLoading?: boolean;
  loadingText?: string;
  showError?: boolean;
  retry?: number;
  retryDelay?: number;
  timeout?: number;
}

interface CloudFunctionResult<T = any> {
  result: ApiResponse<T>;
}

const defaultOptions: RequestOptions = {
  showLoading: true,
  loadingText: '加载中...',
  showError: true,
  retry: 1,
  retryDelay: 1000,
  timeout: 15000,
};

let loadingCount = 0;

function showLoadingToast(text: string) {
  if (loadingCount === 0) {
    wx.showLoading({ title: text, mask: true });
  }
  loadingCount++;
}

function hideLoadingToast() {
  loadingCount--;
  if (loadingCount <= 0) {
    loadingCount = 0;
    wx.hideLoading();
  }
}

function showErrorToast(message: string) {
  wx.showToast({
    title: message,
    icon: 'none',
    duration: 2500,
  });
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function callCloudFunction<T>(
  name: string,
  data: Record<string, any> = {},
  timeout: number
): Promise<ApiResponse<T>> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('TIMEOUT'));
    }, timeout);

    wx.cloud.callFunction({
      name,
      data,
      success: (res: CloudFunctionResult<T>) => {
        clearTimeout(timer);
        resolve(res.result);
      },
      fail: (err: any) => {
        clearTimeout(timer);
        reject(err);
      },
    });
  });
}

export async function request<T = any>(
  name: string,
  data: Record<string, any> = {},
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const opts = { ...defaultOptions, ...options };
  let lastError: any = null;
  let attempt = 0;

  if (opts.showLoading) {
    showLoadingToast(opts.loadingText!);
  }

  try {
    while (attempt < opts.retry!) {
      attempt++;
      try {
        const result = await callCloudFunction<T>(name, data, opts.timeout!);

        if (result.code === ErrorCodes.SUCCESS) {
          return result;
        }

        if (result.code === ErrorCodes.NOT_LOGGED_IN || result.code === ErrorCodes.TOKEN_EXPIRED) {
          wx.removeStorageSync('token');
          if (opts.showError) {
            showErrorToast(getErrorMessage(result.code));
          }
          return result;
        }

        if (opts.showError) {
          showErrorToast(result.message || getErrorMessage(result.code));
        }
        return result;
      } catch (err: any) {
        lastError = err;
        console.error(`[Request] ${name} attempt ${attempt} failed:`, err);

        if (attempt < opts.retry!) {
          await sleep(opts.retryDelay!);
        }
      }
    }

    const errorCode = lastError?.message === 'TIMEOUT' ? ErrorCodes.TIMEOUT : ErrorCodes.NETWORK_ERROR;
    const errorMessage = getErrorMessage(errorCode);

    if (opts.showError) {
      showErrorToast(errorMessage);
    }

    return {
      code: errorCode,
      message: errorMessage,
      data: null as any,
      timestamp: Date.now(),
    };
  } finally {
    if (opts.showLoading) {
      hideLoadingToast();
    }
  }
}

export async function silentRequest<T = any>(
  name: string,
  data: Record<string, any> = {}
): Promise<ApiResponse<T>> {
  return request<T>(name, data, {
    showLoading: false,
    showError: false,
  });
}

export async function backgroundRequest<T = any>(
  name: string,
  data: Record<string, any> = {}
): Promise<ApiResponse<T>> {
  return request<T>(name, data, {
    showLoading: false,
    showError: false,
    retry: 3,
    retryDelay: 2000,
  });
}

export default request;
