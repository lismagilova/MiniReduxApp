import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { createServer } from 'vite';
const preview = process.argv.includes('--preview');
const vite = preview ? null : await createServer({ server: { middlewareMode: true }, appType: 'custom' });
// браузеру нужен начальный документ. он создаётся в памяти, html-файлов нет.
const page = `<script type="module" src="${preview ? '/app.js' : '/src/main.js'}"></script>`;
const server = http.createServer((req, res) => {
  const respond = async () => {
    if (req.url === '/' || req.url === '/index.html') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(vite ? await vite.transformIndexHtml('/', page) : page);
    } else if (preview && req.url === '/app.js') {
      res.setHeader('Content-Type', 'text/javascript; charset=utf-8');
      res.end(await readFile(new URL('./dist/app.js', import.meta.url)));
    } else { res.statusCode = 404; res.end('not found'); }
  };
  const safeRespond = () => respond().catch(() => { res.statusCode = 500; res.end('сначала запусти npm run build'); });
  if (vite) vite.middlewares(req, res, safeRespond); else safeRespond();
});
server.listen(8002, '127.0.0.1', () => console.log('minireduxapp: http://localhost:8002'));
