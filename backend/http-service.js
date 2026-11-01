const fs = require('node:fs');
const path = require('node:path');
const axios = require('axios');
const express = require('express');
const https = require('node:https');
const posterAgent = new https.Agent({ keepAlive: true, maxSockets: 16 });
const downloadPoster = (file, size) => axios.get(`https://image.tmdb.org/t/p/w${size}/${file}`, {
  responseType: 'arraybuffer', timeout: 8000, maxContentLength: 2 * 1024 * 1024,
  maxRedirects: 0, httpsAgent: posterAgent,
});

module.exports = ({ app, server, movies, fetchPoster = downloadPoster }) => {
  const dist = path.join(__dirname, '../frontend/dist');
  const cache = new Map(), pending = new Map();
  let bytes = 0;
  const posterFiles = new Set(movies.map(m => m.posterUrl));
  app.get('/api/preview-movies', (req, res) => {
    const pool = movies.filter(m => m.posterUrl?.startsWith('/api/poster/'));
    const sample = [];
    while (pool.length && sample.length < 5) {
      const index = require('node:crypto').randomInt(pool.length);
      sample.push(pool.splice(index, 1)[0]);
    }
    res.set('Cache-Control', 'no-store').json(sample);
  });
  app.disable('x-powered-by');
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Frame-Options', 'DENY'); next();
  });
  app.get('/api/poster/:file', async (req, res) => {
    const file = req.params.file;
    if (!/^[a-zA-Z0-9_-]+\.(jpg|png|webp)$/.test(file) || !posterFiles.has('/api/poster/' + file)) return res.sendStatus(404);
    const size = req.query.w ?? '500';
    if (typeof size !== 'string' || !['185', '342', '500'].includes(size)) return res.sendStatus(400);
    const cacheKey = size + '/' + file;
    try {
      let entry = cache.get(cacheKey);
      const cacheHit = Boolean(entry);
      if (entry) { cache.delete(cacheKey); cache.set(cacheKey, entry); }
      if (!entry) {
        if (!pending.has(cacheKey)) {
          if (pending.size >= 16) return res.status(503).set('Retry-After', '2').end();
          pending.set(cacheKey, fetchPoster(file, size).then(r => {
            if (!/^image\/(jpeg|png|webp)/.test(r.headers['content-type'] || '')) throw Error('Invalid image');
            const result = { buffer: Buffer.from(r.data), type: r.headers['content-type'] };
            while (cache.size && bytes + result.buffer.length > 32 * 1024 * 1024) {
              const key = cache.keys().next().value; bytes -= cache.get(key).buffer.length; cache.delete(key);
            }
            cache.set(cacheKey, result); bytes += result.buffer.length; return result;
          }).finally(() => pending.delete(cacheKey)));
        }
        entry = await pending.get(cacheKey);
      }
      res.set('Server-Timing', `poster;desc="${cacheHit ? 'memory' : 'upstream'}"`)
        .set('Cache-Control', 'public, max-age=31536000, immutable').type(entry.type).send(entry.buffer);
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
