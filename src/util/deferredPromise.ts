export interface DefferablePromise<T> extends Promise<T> {
  resolve: (resp?: T) => Promise<T>;
  reject: (err?: any) => Promise<any>;
}

export const DeferredPromise = <T>() => {
  const bag = {};
  return Object.assign(new Promise((resolve, reject) => Object.assign(bag, { resolve, reject })), bag) as DefferablePromise<T>;
};
