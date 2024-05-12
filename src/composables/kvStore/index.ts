import { ENV } from '@/env';
import { KvStoreNative } from './kvStore.native';
import { KvStoreWeb } from './kvStore.web';

export const KvStore = ENV.isWeb ? new KvStoreWeb() : new KvStoreNative();
