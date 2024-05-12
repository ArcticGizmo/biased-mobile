const EXTENSION_LOOKUP: Record<string, string | undefined> = {
  jpg: 'image/jpg',
  jpeg: 'image/jpg',
  png: 'image/png'
};

const MIME_MAP: Record<string, string | undefined> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png'
};

export const getMimeTypeFromPath = (path: string, fallback?: string) => {
  const parts = path.split('.');
  const extension = parts[parts.length - 1];
  return EXTENSION_LOOKUP[extension] || fallback;
};

export const getMimeTypeFromBase64Uri = (base64Uri: string, fallback?: string) => {
  return base64Uri.split(';', 1)[0].replace('data:', '') ?? fallback;
};

export const getExtensionFromBase64Uri = (base64Uri: string, fallback?: string) => {
  const mimeType = getMimeTypeFromBase64Uri(base64Uri);
  return getExtensionFromMimeType(mimeType) ?? fallback;
};

export const getExtensionFromMimeType = (mimeType: string) => MIME_MAP[mimeType];
