const { test } = require('node:test');
const assert = require('node:assert/strict');
const catalog = require('./movies.json');
const collection = require('../shared/superhero-catalog.json').works;
const { validCategorySelection, selectedCatalog } = require('./catalog-selection');
const { draw, reroll } = require('./room-actions');

test('special collection is exclusive while ordinary combinations remain valid', () => {
  for (const selection of [['films'], ['films', 'cartoons'], ['superheroes'], ['superheroes', 'superheroes']]) {
    assert.equal(validCategorySelection(selection), true);
  }
  for (const selection of [null, 'films', [], ['unknown'], [{}], ['superheroes', 'films'], ['cartoons', 'superheroes']]) {
    assert.equal(validCategorySelection(selection), false);
    assert.throws(() => selectedCatalog(catalog, selection));
  }
});

test('Marvel and DC collection references unique films, series and animation without copying records', () => {
  assert.equal(new Set(collection.map(work => work.id)).size, collection.length);
  for (const work of collection) {
    const original = catalog.find(movie => movie.id === work.id);
    assert.ok(original, work.id);
    assert.equal(original.title, work.title);
    assert.ok(['films', 'series', 'cartoons'].includes(original.category), work.title);
    assert.ok(['marvel', 'dc'].includes(work.franchise), work.title);
  }
  const pool = selectedCatalog(catalog, ['superheroes']);
  assert.equal(pool.length, collection.length);
  assert.ok(!pool.some(movie => /^(Суперсемейка|Хеллбой|НЕПОБЕДИМЫЙ|Черепашки-ниндзя|Пипец)/.test(movie.title)));
  assert.ok(pool.some(movie => movie.title.startsWith('Человек-паук: Через вселенные')));
  assert.ok(pool.some(movie => movie.category === 'cartoons'));
  for (const name of ['Локи (', 'Миротворец (', 'Пингвин (', 'Флэш (', 'Тайны Смолвиля (']) {
    assert.ok(pool.some(movie => movie.category === 'series' && movie.title.startsWith(name)), name);
  }
  assert.ok(pool.every(movie => catalog.includes(movie)));
  const duplicated = selectedCatalog([...catalog, ...catalog], ['superheroes']);
  assert.equal(duplicated.length, pool.length);
  assert.ok(selectedCatalog(catalog, ['films']).some(movie => !pool.includes(movie)));
});

test('superhero rounds and rerolls stay inside their collection even after history exhaustion', () => {
  const ids = new Set(collection.map(work => work.id));
  for (const mode of ['original', 'opinion']) {
    const room = { categories: ['superheroes'], mode, state: 'round_start', host: 'a', criticId: 'b', phase: 'critic', roundId: 1,
      players: [{ id: 'a', connected: true }, { id: 'b', connected: true }], ratings: {} };
    for (let round = 0; round < 30; round++) {
      room.movies = draw(room, catalog, 5);
      assert.equal(new Set(room.movies.map(movie => movie.id)).size, 5);
      assert.ok(room.movies.every(movie => ids.has(movie.id)));
    }
    const before = room.movies.map(movie => movie.id);
    room.usedMovieIds = catalog.map(movie => movie.id);
    room.usedMovieTitles = [];
    const replacement = reroll(room, mode === 'opinion' ? 'b' : 'a', before[0], 1, catalog);
    assert.ok(ids.has(replacement.id));
    assert.ok(!before.includes(replacement.id));
    assert.equal(new Set(room.movies.map(movie => movie.id)).size, 5);
  }
});
