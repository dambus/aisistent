import { createServer } from 'http';
import { readFileSync } from 'fs';
import { join } from 'path';

const DIR  = 'scripts/output';
const PORT = 7788;

createServer((req, res) => {
  const file = req.url === '/' ? 'PPDG-1S-p-overlay.html' : req.url.replace(/^\//, '');
  try {
    const body = readFileSync(join(DIR, file));
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(body);
  } catch {
    res.writeHead(404); res.end('not found');
  }
}).listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));
