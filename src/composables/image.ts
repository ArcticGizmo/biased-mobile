const MIME_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png'
};

export const getMimeFromBase64Uri = (base64Uri: string) => {
  return base64Uri.split(';', 1)[0].replace('data:', '');
};

export const getExtensionFromMimeType = (mimeType: string): string | undefined => {
  return MIME_MAP[mimeType];
};
