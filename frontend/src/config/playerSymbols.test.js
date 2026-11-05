import {test} from 'node:test';
import assert from 'node:assert/strict';
import {colors, emblems, robotIndex, robotColor} from './playerSymbols.js';
import {cast} from '../components/characters/cast.js';
import {additions, sortedIndices, universe} from '../components/characters/expansion/cast.js';

test('51 selectable identities map to artwork and retain existing player keys', () => {
  assert.equal(colors.length, 51);
  assert.equal(new Set(colors.map(c => c.toLowerCase())).size, 51);
  assert.deepEqual(new Set(emblems.map(c => c.outfit)), new Set([...cast,...additions].map(c => c.id)));
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

test('character picker groups universes alphabetically without changing identity indices',()=>{
  const order=sortedIndices(emblems);
  assert.equal(new Set(order).size,51);
  const groups=order.map(i=>universe(emblems[i]));
  assert.deepEqual(groups,[...groups].sort((a,b)=>a.localeCompare(b,'ru')));
  for(const film of new Set(groups)){
    const positions=groups.flatMap((group,i)=>group===film?[i]:[]);
    assert.equal(positions.at(-1)-positions[0]+1,positions.length);
  }
  assert.equal(emblems.filter(c=>c.outfit==='makima').length,1);
  for(const removed of ['power','mikasa','stan','guard','sukuna','eleven','dustin','butcher','jon','daenerys'])assert.ok(!emblems.some(c=>c.outfit===removed));
});
