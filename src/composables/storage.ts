import { Preferences } from '@capacitor/preferences';

export const useStorage = <T>(key: string) => {
  const loadValue = async () => {
    const resp = await Preferences.get({ key });
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
