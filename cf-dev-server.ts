import type { PluginOption } from 'vite'
import path from 'path'
import { once } from 'events'
import { Readable } from 'stream'

export default function vitePlugin(options: { script: string }): PluginOption {
  let workerFile: string;

  return {
    enforce: "post",
    name: "cf-dev-server",
    configResolved(config) {
      workerFile = path.resolve(config.root, options.script);
    },
    async configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const url = new URL(req.url!, `http://${req.headers.host}`);
          const { default: app } = await server.ssrLoadModule(workerFile);
          const webRes = app.fetch(req)
          if (webRes.status != 200) return next();

          res.statusCode = webRes.status;
          res.statusMessage = webRes.statusText;

          for (const [name, value] of webRes.headers) {
            res.setHeader(name, value);
          }

          if (webRes.body) {
            const readable = Readable.from(webRes.body);
            readable.pipe(res);
            await once(readable, "end");
          } else {
            res.end();
          }
        } catch (err) {
          server.ssrFixStacktrace(err);
          return next(err);
        }
      })

      return async () => {
        await server.transformRequest(workerFile);
      };
    }
  }
}