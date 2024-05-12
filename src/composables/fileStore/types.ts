// export interface FileDescriptor {
//   type: 'web' | 'native';
//   path: string;
// }

export type FileSaveResult = { ok: true; path: string } | { ok: false; error: any };

export type FileLoadResult = { ok: true; data: string | undefined } | { ok: false; error: any };
