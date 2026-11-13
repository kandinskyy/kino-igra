import assert from 'node:assert/strict';
import test from 'node:test';
import {foyerScale} from './sceneSizing.js';

test('wide desktop foyer covers the viewport and retains both interactive panels',()=>{
 for(const [width,height] of [[1280,720],[1920,950],[2560,1440]]){
  const scale=foyerScale(width,height),left=(width-1672*scale)/2,top=(height-941*scale)/2;
  assert.ok(1672*scale>=width-.01 && 941*scale>=height-.01);
  for(const x of [238,1103]){
   assert.ok(left+x*scale>=0);
   assert.ok(left+(x+320)*scale<=width);
  }
  assert.ok(top+215*scale>=0 && top+638*scale<=height);
 }
});
test('tall desktop windows retain the complete foyer instead of cropping its controls',()=>{
 for(const [width,height] of [[1280,1024],[956,884]]){
  const scale=foyerScale(width,height);
  assert.ok(1672*scale<=width+.01 && 941*scale<=height+.01);
 }
});

