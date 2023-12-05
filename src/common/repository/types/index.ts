export interface IRepositoryService<K extends string, V> {
  fetch: (key: K) => Promise<V | undefined>;
  save: (value: V, key: K) => Promise<void>;
}
