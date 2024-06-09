import { ENV } from '@/env';
import { FileStoreNative } from './fileStore.native';
import { FileStoreWeb } from './fileStore.web';

export const FileStore = ENV.isWeb ? new FileStoreWeb() : new FileStoreNative();
