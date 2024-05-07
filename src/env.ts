import { isPlatform } from '@ionic/vue';

const IS_MOBILE = isPlatform('hybrid');

export const ENV = { ...import.meta.env, isWeb: !IS_MOBILE, isMobile: IS_MOBILE };
