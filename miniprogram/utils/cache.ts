/**
 * 缓存管理器
 * 支持过期时间、LRU淘汰、容量限制
 */

interface CacheItem<T> {
  data: T;
  expireAt: number;
  createdAt: number;
}

interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
}

class CacheManager {
  private config: CacheConfig = {
    maxSize: 50,
    defaultTTL: 5 * 60 * 1000,
  };

  private memoryCache: Map<string, CacheItem<any>> = new Map();

  constructor(config?: Partial<CacheConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const expireAt = Date.now() + (ttl || this.config.defaultTTL);
    const item: CacheItem<T> = {
      data,
      expireAt,
      createdAt: Date.now(),
    };

    if (this.memoryCache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    this.memoryCache.set(key, item);

    try {
      wx.setStorageSync(`cache_${key}`, item);
    } catch (e) {
      console.warn('Cache storage failed:', e);
    }
  }

  get<T>(key: string): T | null {
    let item = this.memoryCache.get(key) as CacheItem<T> | undefined;

    if (!item) {
      try {
        item = wx.getStorageSync(`cache_${key}`);
        if (item) {
          this.memoryCache.set(key, item);
        }
      } catch (e) {
        console.warn('Cache read failed:', e);
      }
    }

    if (!item) return null;

    if (Date.now() > item.expireAt) {
      this.remove(key);
      return null;
    }

    return item.data;
  }

  remove(key: string): void {
    this.memoryCache.delete(key);
    try {
      wx.removeStorageSync(`cache_${key}`);
    } catch (e) {
      console.warn('Cache remove failed:', e);
    }
  }

  clear(): void {
    this.memoryCache.clear();
    try {
      const res = wx.getStorageInfoSync();
      res.keys
        .filter(k => k.startsWith('cache_'))
        .forEach(k => wx.removeStorageSync(k));
    } catch (e) {
      console.warn('Cache clear failed:', e);
    }
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    this.memoryCache.forEach((item, key) => {
      if (item.createdAt < oldestTime) {
        oldestTime = item.createdAt;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.remove(oldestKey);
    }
  }

  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    this.set(key, data, ttl);
    return data;
  }
}

export const cacheManager = new CacheManager();

export const imageCache = {
  preload(urls: string[]): void {
    urls.forEach(url => {
      if (url) {
        wx.getImageInfo({
          src: url,
          success: () => {},
          fail: () => {},
        });
      }
    });
  },

  preloadBatch(urls: string[], batchSize = 3): void {
    const batches: string[][] = [];
    for (let i = 0; i < urls.length; i += batchSize) {
      batches.push(urls.slice(i, i + batchSize));
    }

    batches.forEach((batch, index) => {
      setTimeout(() => {
        this.preload(batch);
      }, index * 200);
    });
  },
};
