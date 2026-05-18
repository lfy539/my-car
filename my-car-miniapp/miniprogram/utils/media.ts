export const API_HOST = 'https://api.breakcode.top';

export function normalizeMediaUrl(rawUrl?: string): string {
  if (!rawUrl) return '';
  if (rawUrl.startsWith('https://')) return rawUrl;
  if (rawUrl.startsWith('http://')) return rawUrl.replace(/^http:\/\//, 'https://');
  if (rawUrl.startsWith('//')) return `https:${rawUrl}`;
  if (rawUrl.startsWith('/')) return `${API_HOST}${rawUrl}`;
  return `${API_HOST}/${rawUrl}`;
}

export function buildMediaDownloadUrls(primary?: string, fallback?: string): string[] {
  const candidates = [primary, fallback].filter(Boolean).map((url) => normalizeMediaUrl(url));
  return Array.from(new Set(candidates));
}

export function ensureAlbumPermission(): Promise<boolean> {
  const promptOpenSetting = (resolve: (value: boolean) => void) => {
    wx.showModal({
      title: '需要相册权限',
      content: '保存图片需要相册权限，请前往设置开启。',
      success: (modalRes) => {
        if (!modalRes.confirm) {
          resolve(false);
          return;
        }
        wx.openSetting({
          success: (openRes) => resolve(!!openRes.authSetting['scope.writePhotosAlbum']),
          fail: () => resolve(false),
        });
      },
      fail: () => resolve(false),
    });
  };

  return new Promise((resolve) => {
    wx.getSetting({
      success: (settingRes) => {
        const scope = settingRes.authSetting['scope.writePhotosAlbum'];
        if (scope === true) {
          resolve(true);
          return;
        }
        if (scope === false) {
          promptOpenSetting(resolve);
          return;
        }
        wx.authorize({
          scope: 'scope.writePhotosAlbum',
          success: () => resolve(true),
          fail: () => promptOpenSetting(resolve),
        });
      },
      fail: () => resolve(false),
    });
  });
}

export function downloadFileToTempPath(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    wx.downloadFile({
      url,
      success: (res) => {
        if (res.statusCode === 200 && res.tempFilePath) {
          resolve(res.tempFilePath);
          return;
        }
        reject(new Error(`download status ${res.statusCode}`));
      },
      fail: reject,
    });
  });
}

export function downloadImageToTempPath(url: string): Promise<string> {
  const downloadByImageInfo = () =>
    new Promise<string>((resolve, reject) => {
      wx.getImageInfo({
        src: url,
        success: (res) => {
          if (res.path) {
            resolve(res.path);
            return;
          }
          reject(new Error('empty image path'));
        },
        fail: reject,
      });
    });

  return downloadFileToTempPath(url).catch(() => downloadByImageInfo());
}

function getExtensionFromUrl(url: string): string {
  const pathname = url.split('?')[0] || '';
  const match = pathname.match(/\.([a-zA-Z0-9]+)$/);
  return match ? `.${match[1].toLowerCase()}` : '';
}

function ensureDir(dirPath: string): Promise<void> {
  const fs = wx.getFileSystemManager();
  return new Promise((resolve, reject) => {
    fs.access({
      path: dirPath,
      success: () => resolve(),
      fail: () => {
        fs.mkdir({
          dirPath,
          recursive: true,
          success: () => resolve(),
          fail: reject,
        });
      },
    });
  });
}

/** 将下载的音频持久化到用户目录（带正确扩展名，避免 wx.saveFile 配额/无后缀问题） */
export function persistSoundFile(tempFilePath: string, sourceUrl: string, soundId: string): Promise<string> {
  const fs = wx.getFileSystemManager();
  const ext = getExtensionFromUrl(sourceUrl) || '.mp3';
  const dirPath = `${wx.env.USER_DATA_PATH}/sounds`;
  const destPath = `${dirPath}/${soundId}${ext}`;

  const copyToUserPath = () =>
    new Promise<string>((resolve, reject) => {
      const writeFile = () => {
        fs.copyFile({
          srcPath: tempFilePath,
          destPath,
          success: () => resolve(destPath),
          fail: (copyErr) => {
            fs.readFile({
              filePath: tempFilePath,
              success: (readRes) => {
                fs.writeFile({
                  filePath: destPath,
                  data: readRes.data,
                  success: () => resolve(destPath),
                  fail: () => reject(copyErr),
                });
              },
              fail: () => reject(copyErr),
            });
          },
        });
      };

      fs.access({
        path: destPath,
        success: () => {
          fs.unlink({
            filePath: destPath,
            complete: writeFile,
          });
        },
        fail: writeFile,
      });
    });

  const saveByLegacyApi = () =>
    new Promise<string>((resolve, reject) => {
      wx.saveFile({
        tempFilePath,
        success: (res) => resolve(res.savedFilePath),
        fail: reject,
      });
    });

  return ensureDir(dirPath).then(() => copyToUserPath()).catch(() => saveByLegacyApi());
}

export function shareDownloadedFile(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!wx.canIUse('shareFileMessage')) {
      reject(new Error('shareFileMessage not supported'));
      return;
    }
    wx.shareFileMessage({
      filePath,
      success: () => resolve(),
      fail: reject,
    });
  });
}

export function formatMediaDownloadError(err: unknown): string {
  const errMsg =
    (err as WechatMiniprogram.GeneralCallbackResult)?.errMsg ||
    (err instanceof Error ? err.message : '') ||
    String(err);
  if (/domain|url not in domain|not in domain list/i.test(errMsg)) {
    return '资源域名未配置，请联系管理员';
  }
  if (/auth deny|authorize|permission denied/i.test(errMsg)) {
    return '权限不足，请检查设置';
  }
  if (/exceed|quota|storage limit/i.test(errMsg)) {
    return '本地存储空间不足';
  }
  if (/cancel/i.test(errMsg)) {
    return '已取消';
  }
  return '下载失败，请稍后重试';
}

export function formatImageSaveError(err: unknown): string {
  const errMsg =
    (err as WechatMiniprogram.GeneralCallbackResult)?.errMsg ||
    (err instanceof Error ? err.message : '') ||
    String(err);
  if (/auth deny|authorize|permission denied/i.test(errMsg)) {
    return '请先开启相册权限';
  }
  return formatMediaDownloadError(err);
}

export function saveImageToAlbum(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    wx.saveImageToPhotosAlbum({
      filePath,
      success: () => resolve(),
      fail: reject,
    });
  });
}

