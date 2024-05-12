// TODO: this become KVStore

import { useViteMessaging } from '@/vite/messaging';
import { Preferences } from '@capacitor/preferences';
import { isPlatform } from '@ionic/vue';

type Parser<T> = (raw: string | null | undefined) => T | undefined;

const useNativeStorage = <T>(key: string, parser?: Parser<T>) => {
  const loadValue = async () => {
    const resp = await Preferences.get({ key });
    if (parser) {
      return parser(resp.value);
    }
    return resp.value ? (JSON.parse(resp.value) as T) : undefined;
  };

  const saveValue = async (value?: T) => {
    await Preferences.set({
      key,
      value: JSON.stringify(value)
    });
  };

  return { loadValue, saveValue };
};

const useWebStorage = <T>(key: string, parser?: Parser<T>) => {
  const { sendData: sendSaveRequest } = useViteMessaging<{ path: string; value: T | undefined }, 'ok'>('storage:save');
  const { sendData: sendLoadRequest } = useViteMessaging<{ path: string }, string | undefined>('storage:load');

  const loadValue = async () => {
    const resp = await sendLoadRequest({ path: `${key}.txt` });

    if (parser) {
      return parser(resp);
    }

    if (resp == null) {
      return undefined;
    }
    return JSON.parse(resp);
  };

  const saveValue = async (value: T | undefined) => {
    await sendSaveRequest({ path: `${key}.txt`, value });
  };

  return { loadValue, saveValue };
};

export const useStorage = <T>(key: string, parser?: Parser<T>) => {
  if (isPlatform('hybrid')) {
    return useNativeStorage<T>(key, parser);
  } else {
    return useWebStorage<T>(key, parser);
  }
};
