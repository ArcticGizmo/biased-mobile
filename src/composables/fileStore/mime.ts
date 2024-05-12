const EXTENSION_LOOKUP: Record<string, string> = {
  jpg: 'image/jpg',
  jpeg: 'image/jpg',
  png: 'image/png'
};

export const getMimeType = (path: string, fallback?: string) => {
  const parts = path.split('.');
  const extension = parts[parts.length - 1];
  return EXTENSION_LOOKUP[extension] || fallback;
};
