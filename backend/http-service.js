const fs = require('node:fs');
const path = require('node:path');
const axios = require('axios');
const express = require('express');

module.exports = ({ app, server, movies }) => {
  const dist = path.join(__dirname, '../frontend/dist');
  const cache = new Map(), pending = new Map();
  let bytes = 0;
  app.disable('x-powered-by');
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Frame-Options', 'DENY'); next();
  });
  app.get('/api/poster/:file', async (req, res) => {
    const file = req.params.file;
    if (!/^[a-zA-Z0-9_-]+\.(jpg|png|webp)$/.test(file) || !movies.some(m => m.posterUrl === '/api/poster/' + file)) return res.sendStatus(404);
    try {
      let entry = cache.get(file);
      if (!entry) {
        if (!pending.has(file)) {
          if (pending.size >= 16) return res.status(503).set('Retry-After', '2').end();
          pending.set(file, axios.get('https://image.tmdb.org/t/p/w500/' + file, {
            responseType: 'arraybuffer', timeout: 8000, maxContentLength: 2 * 1024 * 1024, maxRedirects: 0,
          }).then(r => {
            if (!/^image\/(jpeg|png|webp)/.test(r.headers['content-type'] || '')) throw Error('Invalid image');
            const result = { buffer: Buffer.from(r.data), type: r.headers['content-type'] };
            while (cache.size && bytes + result.buffer.length > 32 * 1024 * 1024) {
              const key = cache.keys().next().value; bytes -= cache.get(key).buffer.length; cache.delete(key);
            }
            cache.set(file, result); bytes += result.buffer.length; return result;
          }).finally(() => pending.delete(file)));
        }
        entry = await pending.get(file);
      }
      res.set('Cache-Control', 'public, max-age=31536000, immutable').type(entry.type).send(entry.buffer);
    } catch (e) {
      console.warn('[POSTER]', file, e.code || e.message);
      res.status(502).set('Cache-Control', 'no-store').end();
    }
  });
  const ready = () => movies.length >= 5 && fs.existsSync(path.join(dist, 'index.html'));
  app.get('/healthz', (req, res) => res.status(ready() ? 200 : 503).send(ready() ? 'OK' : 'Not ready'));
  app.get('/api/health', (req, res) => res.status(ready() ? 200 : 503).json({ status: ready() ? 'ok' : 'not_ready', uptime: process.uptime(), version: process.env.RENDER_GIT_COMMIT || 'local' }));
  app.use('/assets', express.static(path.join(dist, 'assets'), { maxAge: '1y', immutable: true }));
  app.use(express.static(dist, { maxAge: 0 }));
  app.use((req, res) => {
    if (req.method !== 'GET' || req.path.startsWith('/api') || path.extname(req.path)) return res.sendStatus(404);
    res.set('Cache-Control', 'no-cache').sendFile(path.join(dist, 'index.html'));
  });
  server.listen(process.env.PORT || 3001, '0.0.0.0', () => console.log('Backend server running'));
};
