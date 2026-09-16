import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' };
const port = Number(process.env.PORT || 5173);
http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const requested = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    const relative = path.relative(root, requested);
    if (relative.startsWith('..') || path.isAbsolute(relative) || relative.split(path.sep).some(p => p.startsWith('.')) || !types[path.extname(requested)]) {
      res.writeHead(403); res.end('Acesso não permitido.'); return;
    }
    const content = await readFile(requested);
    res.writeHead(200, { 'Content-Type': `${types[path.extname(requested)]}; charset=utf-8`, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
    res.end(content);
  } catch (error) {
    const missing = error.code === 'ENOENT' || error.code === 'EISDIR';
    if (!missing) console.error(error);
    res.writeHead(missing ? 404 : 500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(missing ? 'Página não encontrada.' : 'Não foi possível carregar a página.');
  }
}).listen(port, '127.0.0.1', () => console.log(`DevPet disponível em http://localhost:${port}`));
