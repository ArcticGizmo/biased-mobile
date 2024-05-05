import { toastController } from '@ionic/vue';
import type { Color } from '@ionic/core';

export interface ToastOps {
  id?: string;
  header?: string;
  message?: string;
  duration?: number;
  color?: Color;
}

export const useToast = () => {
  const showToast = async (opts: ToastOps) => {
    const t = await toastController.create({ ...opts, position: 'bottom', duration: opts.duration || 3_000, animated: true });
    t.present();
  };

  return { showToast };
};
