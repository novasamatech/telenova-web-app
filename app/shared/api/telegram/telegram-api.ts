import { type WebApp } from '@twa-dev/types';

export const telegramApi = {
  getStoreName,
  getCloudStorageItem,
};

function getCloudStorageItem(webApp: WebApp, store: string): Promise<string> {
  return new Promise((resolve, reject) => {
    webApp.CloudStorage.getItem(store, (err, value) => {
      if (err || value === undefined) reject(err);

      resolve(value!);
    });
  });
}

function getStoreName(webApp: WebApp, key: string): string {
  const userId = webApp.initDataUnsafe.user?.id;

  return userId ? `${userId}_${key}` : '';
}
