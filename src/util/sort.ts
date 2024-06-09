import fuzzysort from 'fuzzysort';
import { firstBy } from 'thenby';

export type SortKeyFn<T> = (item: T) => string;

export type SortKey<T> = keyof T | SortKeyFn<T>;
export type SortKeys<T> = (keyof T)[] | SortKey<T>[];

export interface SortOption<T> {
  key: SortKey<T>;
  desc?: boolean;
}

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

export const sortBy = <T>(items: T[], filters: SortOption<T>[]) => {
  const sortedItems = [...items];

  if (filters.length === 0) {
    return sortedItems;
  }

  sortedItems.sort(buildSorter(filters));
  return sortedItems;
};

const buildSorter = <T>(filters: SortOption<T>[]) => {
  if (filters.length === 0) {
    throw 'sorter by have at least one filter';
  }

  const [first, ...rest] = filters;

  let sorter = firstBy(first.key as any, first.desc ? -1 : 1);

  for (const s of rest) {
    sorter = sorter.thenBy(s.key as any, s.desc ? -1 : 1);
  }

  return sorter;
};
