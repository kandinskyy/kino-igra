const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const http = require('node:http');

test('poster variants are bounded, coalesced and cached independently', async () => {
  const app = express(), server = http.createServer(app), calls = [];
  require('./http-service')({ app, server: { listen() {} }, movies: [{ posterUrl: '/api/poster/test.jpg' }],
    fetchPoster: async (file, size) => {
      calls.push([file, size]);
      await new Promise(resolve => setTimeout(resolve, 30));
      return { data: Buffer.from(`image-${size}`), headers: { 'content-type': 'image/jpeg' } };
    },
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}/api/poster/`;
  try {
    const [a, b] = await Promise.all([fetch(url+'test.jpg?w=185'), fetch(url+'test.jpg?w=185')]);
    assert.equal(await a.text(), 'image-185'); assert.equal(await b.text(), 'image-185');
    assert.deepEqual(calls, [['test.jpg', '185']]);
    const cached = await fetch(url+'test.jpg?w=185');
    assert.match(cached.headers.get('cache-control'), /immutable/);
    assert.match(cached.headers.get('server-timing'), /memory/);
    assert.equal((await fetch(url+'test.jpg?w=342')).status, 200);
    assert.equal((await fetch(url+'test.jpg')).status, 200);
    assert.deepEqual(calls.map(c=>c[1]), ['185', '342', '500']);
    for (const query of ['w=original', 'w=10000', 'w=185&w=500']) assert.equal((await fetch(url+'test.jpg?'+query)).status, 400);
    assert.equal((await fetch(url+'unknown.jpg?w=185')).status, 404);
    assert.equal(calls.length, 3);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
