type ViteMessageResponse<T> = { id: number; ok: true; data: T } | { id: number; ok: false; error: any };

type Resolve = (payload: any) => void;
type Reject = (error: any) => void;

let REQ_ID = 1;

class ViteMessagingClient {
  // TODO: need to keep track of event handlers
  private _listeningFor: string[] = [];
  private _proms: Record<string, { resolve: Resolve; reject: Reject }> = {};

  private get hot() {
    if (!import.meta.env.DEV) {
      throw 'Vite hot reloading not available outside of DEV';
    }

    const hot = import.meta.hot;

    if (!hot) {
      throw 'Vite hot reloading not available';
    }

    return hot;
  }

  private registerListener<TResp>(event: string) {
    if (this._listeningFor.includes(event)) {
      return;
    }

    this.hot.on(`${event}:response`, (resp: ViteMessageResponse<TResp>) => {
      const prom = this._proms[resp.id];
      if (!prom) {
        // usually means another instance caught it
        return;
      }

      if (resp.ok) {
        prom.resolve(resp.data);
      } else {
        prom.reject(resp.error);
      }

      delete this._proms[resp.id];
    });

    this._listeningFor.push(event);
  }

  async request<TData, TResp>(event: string, data: TData) {
    this.registerListener<TResp>(event);

    return new Promise<TResp>((resolve, reject) => {
      const id = REQ_ID++;
      this._proms[id] = { resolve, reject };
      this.hot.send(`${event}:request`, { id, data });
    });
  }

  send<TData>(event: string, data: TData) {
    this.hot.send(`${event}:request`, data);
  }

  on<TResp>(event: string, callback: (payload: TResp) => void) {
    this.hot.on(`${event}:response`, callback);
  }
}

export const ViteMessaging = new ViteMessagingClient();
