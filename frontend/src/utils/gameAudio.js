let context;
export async function unlockGameAudio() {
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return false;
    if (!context || context.state === 'closed') context = new Audio();
    if (context.state !== 'running') await context.resume();
    return context.state === 'running';
  } catch { return false; }
}

// Installed before entering a room: Start/Next round clicks unlock sound too.
export function prepareGameAudio() {
  const unlock = () => { void unlockGameAudio(); };
  document.addEventListener('pointerdown', unlock, true);
  document.addEventListener('keydown', unlock, true);
  return () => {
    document.removeEventListener('pointerdown', unlock, true);
    document.removeEventListener('keydown', unlock, true);
  };
}

export function playRoundCue(kind = 'minute') {
  // Never queue a stale signal to play minutes later after unlocking audio.
  if (context?.state !== 'running') return false;
  const start = context.currentTime;
  const minute = kind === 'minute';
  const frequencies = minute ? [196, 294, 481, 703] : [392, 588];
  const duration = minute ? 1.9 : .65;
  frequencies.forEach((frequency, index) => {
    const oscillator = context.createOscillator(), gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * .985, start + duration);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime((minute ? .12 : .065) / (index + 1) ** 1.5, start + .018);
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start); oscillator.stop(start + duration + .05);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  });
  return true;
}

export function playChatCue() {
  if (context?.state !== 'running') return false;
  const start = context.currentTime, oscillator = context.createOscillator(), gain = context.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(660, start);
  oscillator.frequency.setValueAtTime(880, start + .08);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(.045, start + .01);
  gain.gain.exponentialRampToValueAtTime(.0001, start + .24);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(start); oscillator.stop(start + .26);
  oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  return true;
}
