import test from 'node:test';
import assert from 'node:assert/strict';

test('game sound unlocks from an app gesture, ignores old mute preferences and never queues a late cue', async () => {
  const originals = {window:globalThis.window,document:globalThis.document,localStorage:globalThis.localStorage};
  const listeners = new Map(), oscillators = [], peaks = [];
  let audio;
  class FakeAudio {
    constructor() { audio=this; this.state='suspended'; this.currentTime=12; this.destination={}; }
    async resume() { this.state='running'; }
    createOscillator() {
      const oscillator={frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect:()=>({connect(){}}),start(){},stop(time){this.stopsAt=time;},disconnect(){}};
      oscillators.push(oscillator); return oscillator;
    }
    createGain() { return {gain:{setValueAtTime(){},linearRampToValueAtTime(value){peaks.push(value);},exponentialRampToValueAtTime(){}},disconnect(){}}; }
  }
  try {
    globalThis.window={AudioContext:FakeAudio};
    globalThis.document={addEventListener:(event,fn,capture)=>{assert.equal(capture,true);listeners.set(event,fn);},removeEventListener:event=>listeners.delete(event)};
    // Old mute preferences must not disable mandatory game cues.
    globalThis.localStorage={getItem(){return 'off';},setItem(){throw Error('blocked');}};
    const sound=await import('./gameAudio.js');
    assert.equal(sound.playRoundCue(),false);
    const cleanup=sound.prepareGameAudio();
    assert.equal(listeners.size,2);
    listeners.get('pointerdown')();
    await Promise.resolve();
    assert.equal(audio.state,'running');
    assert.equal(sound.playRoundCue('minute'),true);
    assert.equal(oscillators.length,4);
    assert.ok(peaks.every(value=>value<=.12));
    assert.ok(oscillators.every(o=>o.stopsAt<14));
    assert.equal(sound.playRoundCue('role'),true);
    assert.equal(oscillators.length,6);
    audio.state='suspended';
    assert.equal(sound.playRoundCue(),false);
    assert.equal(oscillators.length,6);
    cleanup(); assert.equal(listeners.size,0);
  } finally { Object.assign(globalThis,originals); }
});
