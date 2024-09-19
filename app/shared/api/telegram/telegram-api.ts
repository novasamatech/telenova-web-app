import { type WebApp } from '@twa-dev/types';

export const telegramApi = {
  getStoreName,
  getItem,
  setItem,
  removeCloudStorageItems,
  isWebPlatform,
};

function getItem(webApp: WebApp, store: string): Promise<string> {
  const tgStoreName = getStoreName(webApp, store);

  return new Promise((resolve, reject) => {
    webApp.CloudStorage.getItem(tgStoreName, (error, result) => {
      if (error || result === undefined) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

function setItem(webApp: WebApp, store: string, value: string): Promise<boolean> {
  const tgStoreName = getStoreName(webApp, store);

  return new Promise((resolve, reject) => {
    webApp.CloudStorage.setItem(tgStoreName, value, (error, result) => {
      if (error || result === undefined) {
        reject(error);
      } else {
        resolve(result);
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
