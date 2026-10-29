import { existsSync, createReadStream } from 'node:fs';
import { resolve, sep } from 'node:path';

// Astro's dev server does not resolve public/foo/ to public/foo/index.html.
// Match the production static-directory URLs without creating Astro route owners.
export function standaloneDev() {
  return {
    name: 'standalone-directory-preview',
    apply: 'serve',
    configureServer(server) {
      const root = resolve('public');
      server.middlewares.use((request, response, next) => {
        if (!['GET', 'HEAD'].includes(request.method)) return next();
        const url = new URL(request.url, 'http://localhost');
        let pathname;
        try { pathname = decodeURIComponent(url.pathname); } catch { return next(); }
        const file = resolve(root, '.' + pathname, 'index.html');
        if (!file.startsWith(root + sep) || !existsSync(file)) return next();
        if (!url.pathname.endsWith('/')) {
          response.writeHead(301, { Location: url.pathname + '/' + url.search });
          return response.end();
        }
        response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        if (request.method === 'HEAD') return response.end();
        createReadStream(file).pipe(response);
      });
    },
  };
}
