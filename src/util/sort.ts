import fuzzysort from 'fuzzysort';

export type SortKeyFn<T> = (item: T) => string;

export type SortKey<T> = keyof T | SortKeyFn<T>;
export type SortKeys<T> = (keyof T)[] | SortKey<T>[];

export function sort<T>(items: T[], key: SortKey<T>, search: string) {
  if (!search.trim()) {
    return [...items];
  }

  const resp = fuzzysort.go(search, items, { key: key as any });

  return resp.map(r => r.obj);
}

export function multiSort<T>(items: T[], keys: SortKeys<T>, search: string) {
  if (!search.trim()) {
    return [...items];
  }

  const resp = fuzzysort.go(search, items, { keys: keys as any });

  return resp.map(r => r.obj);
}
