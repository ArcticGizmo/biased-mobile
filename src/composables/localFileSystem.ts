// import { ENV } from '@/env';
// import { Capacitor } from '@capacitor/core';
// import { Directory, Filesystem } from '@capacitor/filesystem';
// import { v4 as uuidv4 } from 'uuid';
// import { FilePicker } from '@capawesome/capacitor-file-picker';

// export interface LocalFile {
//   filePath: string;
//   webviewPath: string;
// }

// const MIME_MAP: Record<string, string> = {
//   'image/jpeg': 'jpg',
//   'image/jpg': 'jpg',
//   'image/png': 'png'
// };

// const getMimeFromBase64Uri = (base64Uri: string) => {
//   return base64Uri.split(';', 1)[0].replace('data:', '');
// };

// export const newBase64Image = async (base64Uri: string) => {
//   const mimeType = getMimeFromBase64Uri(base64Uri);
//   const ext = MIME_MAP[mimeType.toLowerCase()] || MIME_MAP['image/png'];
//   return await saveFile(`photo-cards/${uuidv4()}.${ext}`, base64Uri);
// };

// // TODO: This will become specifically saveImage
// export const saveFile = async (path: string, data: string, directory: Directory = Directory.Data): Promise<LocalFile> => {
//   if (ENV.isWeb) {
//     // TODO: might want another implementation here to persist this data?
//     return {
//       filePath: path,
//       webviewPath: data
//     };
//   }

//   const savedFile = await Filesystem.writeFile({
//     recursive: true,
//     path,
//     data,
//     directory
//   });

//   return {
//     filePath: savedFile.uri,
//     webviewPath: Capacitor.convertFileSrc(savedFile.uri)
//   };
// };

// export const loadFile = async (file: LocalFile) => {
//   if (ENV.isWeb) {
//     return file.webviewPath;
//   }

//   const resp = await Filesystem.readFile({
//     path: file.filePath
//   });

//   return resp.data;
// };

// export const deleteFile = async (file: LocalFile) => {
//   if (ENV.isWeb) {
//     return;
//   }

//   await Filesystem.deleteFile({
//     path: file.filePath
//   });
// };

// export const pickFile = async () => {
//   const resp = await FilePicker.pickFiles({ readData: true });
//   const file = resp.files[0];
//   console.dir(file.mimeType);

//   console.dir(file);
// };
