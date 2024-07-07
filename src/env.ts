import { isPlatform } from '@ionic/vue';

const IS_MOBILE = isPlatform('hybrid');

const env = import.meta.env || {};

export const ENV = {
  IS_DEV: env.DEV,
  IS_PROD: env.PROD,
  isWeb: !IS_MOBILE,
  isMobile: IS_MOBILE,
  driveId: env.VITE_GDRIVE_ID
};
