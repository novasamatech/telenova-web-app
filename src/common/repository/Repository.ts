import { useRef } from 'react';

import { IRepositoryService } from './types';

export const useRepository = <K extends string, V>(): IRepositoryService<K, V> => {
  const store = useRef<Record<K, V>>({} as Record<K, V>);

  function fetch(key: K): Promise<V | undefined> {
    return new Promise(function (resolve) {
      resolve(store.current[key]);
    });
  }

  function save(value: V, key: K): Promise<void> {
    return new Promise(function (resolve) {
      const newStore = store.current;
      newStore[key] = value;
      store.current = newStore;
      resolve();
    });
  }

  return {
    fetch,
    save,
  };
};
