import { type DefferablePromise, DeferredPromise } from '@/util/deferredPromise';
import { markRaw, ref } from 'vue';

interface DialogOptions {
  component: any;
  componentProps?: any;
}

interface DialogInstance<T> {
  component: any;
  componentProps?: any;
  prom: DefferablePromise<DialogDismissResp<T>>;
}

interface DialogDismissReq<T> {
  id?: string;
  role?: string;
  data?: T;
}

interface DialogDismissResp<T> {
  role?: string;
  data?: T;
}

export const DIALOGS = ref<DialogInstance<any>[]>([]);

const create = async <T = unknown>(options: DialogOptions) => {
  const dialog: DialogInstance<T> = {
    component: markRaw(options.component),
    componentProps: options.componentProps,
    prom: DeferredPromise<DialogDismissResp<T>>()
  };
  DIALOGS.value.push(dialog);

  return await dialog.prom;
};

const dismiss = <T>(options: DialogDismissReq<T>) => {
  const dialog = DIALOGS.value[DIALOGS.value.length - 1];

  if (!dialog) {
    throw new Error('There is no active modal to dismiss');
  }

  const resp: DialogDismissResp<T> = { role: options.role, data: options.data };
  dialog.prom.resolve(resp);
  DIALOGS.value.pop();
};

const backdropDismiss = () => {
  dismiss({ role: 'backdrop' });
};

export const dialogController = { create, dismiss, backdropDismiss };
