import { type WebApp } from '@twa-dev/types';

export const telegramApi = {
  getStoreName,
  getItem,
  setItem,
  removeItems,
  isWebPlatform,
};

function getItem(webApp: WebApp, store: string): Promise<string> {
  return new Promise((resolve, reject) => {
    webApp.CloudStorage.getItem(store, (error, result) => {
      if (error || result === undefined) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

function setItem(webApp: WebApp, store: string, value: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    webApp.CloudStorage.setItem(store, value, (error, result) => {
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

function removeItems(webApp: WebApp, keys: string[]): Promise<boolean> {
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
