import { HttpProxy, ProxyOptions } from 'vite';

export class CorsProxy {
  private prefix: string;
  private target: HttpProxy.ProxyTargetDetailed = { host: '', port: 80 };

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  private rewrite(path: string) {
    const newPath = path.replace(this.prefix + '/', '');

    const u = new URL(newPath);
    this.target.host = u.host;
    this.target.port = Number(u.port);
    this.target.protocol = u.protocol;
    this.target.hostname = u.hostname;

    return newPath;
  }

  entry(): Record<string, ProxyOptions> {
    return {
      [this.prefix]: {
        target: this.target,
        changeOrigin: true,
        followRedirects: true,
        rewrite: p => this.rewrite(p)
      }
    };
  }
}
