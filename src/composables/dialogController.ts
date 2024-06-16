import { type DefferablePromise, DeferredPromise } from '@/util/deferredPromise';
import { Ref, markRaw, ref } from 'vue';

export interface DialogOptions {
  component: any;
  componentProps?: any;
}

interface DialogInstance<T> {
  component: any;
  componentProps?: any;
  prom: DefferablePromise<DialogDismissResp<T>>;
  closing: Ref<boolean>;
}

export interface DialogDismissReq<T> {
  id?: string;
  role?: string;
  data?: T;
}

export interface DialogDismissResp<T> {
  role?: string;
  data?: T;
}

export const DIALOGS = ref<DialogInstance<any>[]>([]);

const create = async <T = unknown>(options: DialogOptions) => {
  const dialog: DialogInstance<T> = {
    component: markRaw(options.component),
    componentProps: options.componentProps,
    prom: DeferredPromise<DialogDismissResp<T>>(),
    closing: ref(false)
  };
  DIALOGS.value.push(dialog as any);

  return await dialog.prom;
};

const dismiss = <T>(options: DialogDismissReq<T>) => {
  const dialog = DIALOGS.value[DIALOGS.value.length - 1];

  if (!dialog) {
    throw new Error('There is no active modal to dismiss');
  }

  if (dialog.closing) {
    console.warn('[Dialog] already closing. New dismiss will have no effect');
    return;
  }

  const resp: DialogDismissResp<T> = { role: options.role, data: options.data };
  dialog.closing = true;
  setTimeout(() => {
    dialog.prom.resolve(resp);
    DIALOGS.value.pop();
  }, 300);
};

const backdropDismiss = () => {
  dismiss({ role: 'backdrop' });
};

export const dialogController = { create, dismiss, backdropDismiss };
