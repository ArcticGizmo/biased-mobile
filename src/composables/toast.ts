import { toastController } from '@ionic/vue';
import type { Color } from '@ionic/core';

const DEFAULT_TOAST_DURATION = 5_000;

export interface ToastOps {
  id?: string;
  header?: string;
  message?: string;
  duration?: number;
  color?: Color;
  icon?: string;
}

export const useToast = () => {
  const showToast = async (opts: ToastOps) => {
    const t = await toastController.create({
      ...opts,
      position: 'bottom',
      duration: opts.duration || DEFAULT_TOAST_DURATION,
      animated: true,
      cssClass: 'toast-bottom'
    });
    t.present();
  };

  return { showToast };
};
