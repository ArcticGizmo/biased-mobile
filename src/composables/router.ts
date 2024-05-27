import { useIonRouter, AnimationBuilder } from '@ionic/vue';

interface BackOpts {
  fallback?: string;
  animation?: AnimationBuilder;
}

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

  return { push: router.push, replace: router.replace, canGoBack: router.canGoBack, back };
};
