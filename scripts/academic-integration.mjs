import { cp, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildAcademic, source, output } from './academic.mjs';

const mime = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
  '.xml': 'application/xml', '.json': 'application/json',
};

export default function academic() {
  let config;
  return {
    name: 'acad-homepage-jekyll',
    hooks: {
      'astro:config:done': ({ config: resolved }) => { config = resolved; },
      'astro:server:setup': async ({ server, logger }) => {
        const paths = await buildAcademic(config.base, config.site);
        let timer;
        let pending = Promise.resolve();
        let buildError;
        const changed = file => {
          file = path.resolve(file);
          if (!file.startsWith(source + path.sep) || /[\\/](vendor|\.bundle|\.jekyll-cache|_site)[\\/]/.test(file) || path.basename(file).startsWith('.jekyll')) return;
          clearTimeout(timer);
          timer = setTimeout(() => {
            pending = pending.then(async () => {
              await buildAcademic(config.base, config.site);
              buildError = undefined;
              server.ws.send({ type: 'full-reload' });
            }).catch(error => { buildError = error; logger.error(error.message); });
          }, 200);
        };
        server.watcher.add(source);
        server.watcher.on('all', (_event, file) => changed(file));
        server.httpServer?.once('close', () => clearTimeout(timer));
        server.middlewares.use(async (req, res, next) => {
          try {
            const url = new URL(req.originalUrl || req.url || '/', 'http://localhost');
            if (url.pathname === paths.academic) {
              res.writeHead(302, { Location: paths.academic + '/' + url.search }); res.end(); return;
            }
            if (!url.pathname.startsWith(paths.academic + '/')) return next();
            await pending;
            if (buildError) { res.writeHead(503); res.end('Academic build failed. See terminal.'); return; }
            const relative = decodeURIComponent(url.pathname.slice(paths.academic.length + 1));
            const target = path.resolve(output, relative || 'index.html');
            if (!target.startsWith(path.resolve(output) + path.sep)) { res.writeHead(403); res.end(); return; }
            let file = target;
            if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
            const body = await readFile(file);
            res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
            if (req.method !== 'HEAD') res.end(body); else res.end();
          } catch (error) {
            if (error.code === 'ENOENT') { res.writeHead(404); res.end('Not found'); }
            else next(error);
          }
        });
      },
      'astro:build:done': async ({ dir }) => {
        await buildAcademic(config.base, config.site);
        await cp(output, path.join(fileURLToPath(dir), 'academic'), { recursive: true });
      },
    },
  };
}
