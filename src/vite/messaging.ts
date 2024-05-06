type ViteMessageResponse<T> = { id: number; ok: true; data: T } | { id: number; ok: false; error: any };

type Resolve = (payload: any) => void;
type Reject = (error: any) => void;

let REQ_ID = 1;

const getHot = () => {
  if (!import.meta.env.DEV) {
    throw 'Vite hot reloading not available outside of DEV';
  }

  const hot = import.meta.hot;

  if (!hot) {
    throw 'Vite hot reloading not available';
  }

  return hot;
};

export const sendMessage = <T = any>(event: string, data: T) => {
  const hot = getHot();
  hot.send(event, data);
};

export const listenForMessage = <T = any>(event: string, callback: (payload: T) => void) => {
  const hot = getHot();
  hot.on(event, callback);
};

export const useViteMessaging = <Req = any, Resp = any>(name: string) => {
  const hot = getHot();

  const proms: Record<string, { resolve: Resolve; reject: Reject }> = {};

  hot.on(`${name}:response`, (resp: ViteMessageResponse<Resp>) => {
    const prom = proms[resp.id];
    if (!prom) {
      console.error(`[vite msg] could not find promise for request ${resp.id}`);
      return;
    }

    if (resp.ok) {
      prom.resolve(resp.data);
    } else {
      prom.reject(resp.error);
    }

    delete proms[resp.id];
  });

  const sendData = (data: Req) => {
    return new Promise<Resp>((resolve, reject) => {
      const id = REQ_ID++;
      proms[id] = { resolve, reject };
      hot.send(`${name}:request`, { id, data });
    });
  };

  return { sendData };
};
