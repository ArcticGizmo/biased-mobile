import { useIonRouter, AnimationBuilder } from '@ionic/vue';
import { RouteLocationRaw } from 'vue-router';

interface BackOpts {
  fallback?: string;
  animation?: AnimationBuilder;
}

type RouterPush = (to: RouteLocationRaw, routerAnimation?: AnimationBuilder) => void;

export const useSimpleRouter = () => {
  const router = useIonRouter();

  const back = (opts: BackOpts) => {
    if (router.canGoBack()) {
      router.back(opts.animation);
      return;
    }

    if (opts.fallback) {
      router.replace(opts.fallback, opts.animation);
    }
  };

  return { push: router.push as RouterPush, replace: router.replace as RouterPush, canGoBack: router.canGoBack, back };
};
