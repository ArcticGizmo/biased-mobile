export function groupBy<T>(items: T[], grouper: (item: T) => any) {
  const groups: Record<string, T[]> = {};

  for (const item of items) {
    let key = grouper(item);
    if (!Array.isArray(key)) {
      key = [key];
    }

    key.forEach((x: any) => {
      groups[x] ??= [];
      groups[x].push(item);
    });
  }

  return groups;
}
