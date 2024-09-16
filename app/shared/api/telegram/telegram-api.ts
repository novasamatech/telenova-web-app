import { type WebApp } from '@twa-dev/types';

export const telegramApi = {
  getStoreName,
  getCloudStorageItem,
  removeCloudStorageItems,
  isWebPlatform,
};

function getCloudStorageItem(webApp: WebApp, store: string): Promise<string> {
  return new Promise((resolve, reject) => {
    webApp.CloudStorage.getItem(store, (error, value) => {
      if (error || value === undefined) {
        reject(error);
      } else {
        resolve(value);
      }
    });
  });
}

function getStoreName(webApp: WebApp, key: string): string {
  const userId = webApp.initDataUnsafe.user?.id;

  return userId ? `${userId}_${key}` : '';
}

function removeCloudStorageItems(webApp: WebApp, keys: string[]): Promise<boolean> {
  return new Promise((resolve, reject) => {
    webApp.CloudStorage.removeItems(keys, (error, result) => {
      if (error || result === undefined) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

function isWebPlatform(webApp: WebApp): boolean {
  return webApp.platform.startsWith('web');
}
