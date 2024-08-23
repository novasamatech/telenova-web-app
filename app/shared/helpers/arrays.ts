import { type KeysOfType } from './utility';

/**
 * Create dictionary with given key and value Keys can only be type of string,
 * number or symbol
 *
 * @param collection Array of items
 * @param property Field to be used as key
 * @param predicate Transformer function
 *
 * @returns {Object}
 */
export function dictionary<T extends Record<K, PropertyKey>, K extends KeysOfType<T, PropertyKey>>(
  collection: T[],
  property: K,
  predicate?: (item: T) => any,
): Record<T[K], any> {
  return collection.reduce(
    (acc, item) => {
      const element = item[property];

      if (predicate) {
        acc[element] = predicate(item);
      } else {
        acc[element] = item;
      }

      return acc;
    },
    {} as Record<T[K], any>,
  );
}
