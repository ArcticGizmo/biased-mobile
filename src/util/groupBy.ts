export function groupBy<T>(items: T[], grouper: (item: T) => any) {
  const groups: Record<string, T[]> = {};

  for (const item of items) {
    const key = grouper(item);
    groups[key] = groups[key] || [];
    groups[key].push(item);
  }

  return groups;
}
