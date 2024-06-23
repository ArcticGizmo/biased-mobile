import { AlertButton, alertController, loadingController } from '@ionic/vue';

type StringLiteral<T> = T extends string ? (string extends T ? never : T) : never;
type LiteralUnion<T extends U, U = string> = T | (U & Record<never, never>);

type ButtonClass = LiteralUnion<'danger', string>;

export interface SimpleAlertOptions<Ok, Cancel> {
  header?: string;
  subHeader?: string;
  message?: string;
  okName?: StringLiteral<Ok>;
  cancelName?: StringLiteral<Cancel>;
  okClass?: ButtonClass;
  cancelClass?: ButtonClass;
}

export const showLoading = async (message?: string) => {
  const loading = await loadingController.create({
    message,
    cssClass: 'transparent-loading'
  });
  loading.present();
  return loading;
};

export const showSimpleAlert = async <Ok = 'ok', Cancel = 'cancel'>(options: SimpleAlertOptions<Ok, Cancel>) => {
  const okName = (options.okName as string) || 'ok';
  const cancelName = (options.cancelName as string) || 'cancel';

  const buttons: AlertButton[] = [
    {
      text: cancelName,
      role: cancelName,
      cssClass: options.cancelClass
    },
    {
      text: okName,
      role: okName,
      cssClass: options.okClass
    }
  ];

  const alert = await alertController.create({
    ...options,
    animated: true,
    buttons
  });

  alert.present();

  const resp = await alert.onDidDismiss();

  const role = resp.role;

  if (role !== okName && role !== cancelName) {
    return undefined;
  }

  return role as StringLiteral<Ok> | StringLiteral<Cancel>;
};
