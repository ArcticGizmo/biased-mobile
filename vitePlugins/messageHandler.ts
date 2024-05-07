import { type ViteDevServer } from 'vite';

type Reply = <T = any>(data: T) => void;
type Reject = <T = any>(error: T) => void;
interface MsgPayload<T> {
  id: string;
  data: T;
}

export const addMessageHandler = <ReqData = any>(
  server: ViteDevServer,
  name: string,
  handle: (req: ReqData, reply: Reply, reject: Reject) => void,
  log?: boolean
) => {
  server.hot.on(`${name}:request`, (req: MsgPayload<ReqData>) => {
    if (log) {
      console.log('[vite msg] request', req);
    }

    const reply = (data: any) => server.hot.send(`${name}:response`, { id: req.id, ok: true, data });
    const reject = (error: any) => server.hot.send(`${name}:response`, { id: req.id, ok: false, error });
    handle(req.data, reply, reject);
  });
};
