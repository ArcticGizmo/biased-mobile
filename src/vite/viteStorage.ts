import { useViteMessaging } from '@/vite/messaging';

export const useViteStorage = () => {
  const { sendData: sendSaveRequest } = useViteMessaging<{ path: string; value: string | undefined }, 'ok'>('storage:save');
  const { sendData: sendLoadRequest } = useViteMessaging<{ path: string }, string | undefined>('storage:load');

  const save = async (path: string, data: string | undefined) => {
    await sendSaveRequest({ path, value: data });
  };

  const load = async (path: string) => {
    return await sendLoadRequest({ path });
  };

  return { save, load };
};
