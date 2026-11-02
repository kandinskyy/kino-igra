import {test} from 'node:test';
import assert from 'node:assert/strict';
import {colors, emblems, robotIndex, robotColor} from './playerSymbols.js';
import {cast} from '../components/characters/cast.js';

test('29 selectable identities map to the deployed cast, including replacements', () => {
  assert.equal(colors.length, 29);
  assert.equal(new Set(colors.map(c => c.toLowerCase())).size, 29);
  assert.deepEqual(new Set(emblems.map(c => c.outfit)), new Set(cast.map(c => c.id)));
  assert.equal(emblems[1].outfit, 'vader');
  assert.equal(emblems[7].outfit, 'batman');
  assert.equal(emblems[15].outfit, 'joker');
  assert.deepEqual(colors.slice(0, 24), [
    '#B57EDC','#1CA0E5','#00E676','#FF007F','#FFB300','#8A2BE2',
    '#FF3864','#00F5D4','#FF6D00','#AEEA00','#0091EA','#FF1493',
    '#FFD600','#00B4D8','#7B2CBF','#D8B4FE','#A98D60','#9A9FAF',
    '#EDB72F','#DE6F36','#D25A72','#AC92CD','#6F8F48','#E1DFD2',
  ]);
  for (const [index, identity] of emblems.entries()) {
    assert.equal(robotIndex(identity.hex.toLowerCase()), index);
    assert.equal(robotColor(identity.hex), identity.color);
    assert.ok(identity.name && identity.film && identity.colorName);
  }
  assert.equal(robotIndex(undefined), 0);
  assert.equal(robotColor('unknown'), emblems[0].color);
});
