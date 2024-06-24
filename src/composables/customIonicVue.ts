import { IonicMode } from '../types';
import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';

const KEY = '__mode';

export const setMode = (mode: IonicMode) => {
  const url = new URL(window.location.href);
  url.searchParams.set(KEY, mode);
  window.location.href = url.toString();
};

export const getMode = () => {
  const url = new URL(window.location.href);
  return url.searchParams.get(KEY) || undefined;
};

export const modeGuard = (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  if (from.query[KEY] && !to.query[KEY]) {
    to.query[KEY] = from.query[KEY];
    next(to);
    return;
  }

  next();
};
