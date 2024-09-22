export const localStorageApi = {
  getItem,
  setItem,
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

function setItem<T>(key: string, value: T): T {
  localStorage.setItem(key, JSON.stringify(value));

  return value;
}

function clear() {
  localStorage.clear();
}
