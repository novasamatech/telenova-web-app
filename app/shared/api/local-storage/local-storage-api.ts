import secureLocalStorage from 'react-secure-storage';

export const localStorageApi = {
  getItem,
  secureGetItem,
  setItem,
  secureSetItem,
  clear,
};

function getItem<T>(key: string, defaultValue: T): T {
  const storageItem = localStorage.getItem(key);

  if (!storageItem) return defaultValue;

  try {
    return storageItem ? JSON.parse(storageItem) : defaultValue;
  } catch {
    console.error(`🔸LocalStorageApi - Could not retrieve item by key - ${key}`);

    return defaultValue;
  }
}

function secureGetItem<T>(key: string, defaultValue: T): T {
  try {
    return secureLocalStorage.getItem(key) as T;
  } catch {
    console.error(`🔸LocalStorageApi - Could not retrieve item by key - ${key}`);

    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): T {
  localStorage.setItem(key, JSON.stringify(value));

  return value;
}

function secureSetItem<T>(key: string, value: T): T {
  secureLocalStorage.setItem(key, JSON.stringify(value));

  return value;
}

function clear() {
  localStorage.clear();
}
