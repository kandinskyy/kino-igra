const {test} = require('node:test');
const assert = require('node:assert/strict');
const catalog = require('./movies.json');
const categories = require('../shared/catalog-categories.json');

test('catalog identities, dates and curated additions are consistent', () => {
  assert.equal(new Set(catalog.map(m=>m.id)).size,catalog.length);
  assert.equal(new Set(catalog.map(m=>`${m.mediaType}:${m.tmdbId}`)).size,catalog.length);
  for(const category of categories) assert.ok(catalog.filter(m=>m.category===category.id).length>=5);
  for(const m of catalog) {
    assert.ok(Number.isInteger(m.tmdbId),m.title);
    assert.ok(/^\/api\/poster\/[\w-]+\.(jpg|png|webp)$/.test(m.posterUrl),m.title);
    assert.equal(m.sourceUrl,`https://www.themoviedb.org/${m.mediaType}/${m.tmdbId}`);
    assert.ok(categories.some(c=>c.id===m.category),m.title);
    assert.ok((m.category==='films' ? / \(\d{4}\)$/ : / \(\d{4} - (?:\d{4}|\.\.\.)\)$/).test(m.title),m.title);
    assert.equal(m.mediaType,m.category==='films'?'movie':'tv');
    if(m.mediaType==='tv'&&!m.fromStream) {
      assert.ok(m.rating>=7&&m.voteCount>=500,m.title);
      assert.ok(!m.originCountries.some(c=>['TR','IN'].includes(c)),m.title);
    }
  }
});
