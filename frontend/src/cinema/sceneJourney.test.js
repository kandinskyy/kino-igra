import test from 'node:test';
import assert from 'node:assert/strict';
import {reverseJourney} from './sceneJourney.js';

test('forward presentation gate never launches a reverse journey before the portal',()=>{
  assert.equal(reverseJourney('game','lobby',{enteringGame:true}),false);
  assert.equal(reverseJourney('lobby','game',{enteringGame:true}),false);
  assert.equal(reverseJourney('game','home'),true);
  assert.equal(reverseJourney('game','lobby'),true);
  assert.equal(reverseJourney('lobby','home'),true);
  assert.equal(reverseJourney('waiting','lobby'),false);
});
