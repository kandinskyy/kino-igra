import {useEffect, useRef} from 'react';
import {playClockTick, playRoundCue} from '../utils/gameAudio.js';

/**
 * Cues a newly started clue/guess clock once. The short clock ticks begin at
 * five seconds and stop when the clock pauses, disappears or expires.
 * revision is reserved for deliberate timeline rewind/seek in the local demo.
 */
export function useKinonamesAudio(model, now, {enabled = true, paused = false, revision = 0} = {}) {
  const started = useRef('');
  const lastTick = useRef('');
  const revisionSeen = useRef(revision);

  const phaseKey = model?.gameId && `${model.gameId}:${model.turnId}:${model.phase}`;
  const phaseLimit = model?.phase === 'clue'
    ? model.settings?.competitive?.clueSeconds
    : model?.phase === 'guess' ? model.settings?.competitive?.guessSeconds : null;
  const hasConfirmation = model?.confirmation?.deadline != null;
  const timerDeadline = hasConfirmation ? model.confirmation.deadline : model?.deadline;
  const timerKey = hasConfirmation ? `${phaseKey}:confirm:${model.confirmation.cardId}` : phaseKey;
  const phaseSeconds = timerDeadline != null && Number.isFinite(now)
    ? Math.max(0, (timerDeadline - now) / 1000)
    : null;

  useEffect(() => {
    if (revisionSeen.current !== revision) {
      revisionSeen.current = revision;
      // A backward step must not replay the phase-start cue or the current tick.
      started.current = phaseKey || '';
      lastTick.current = '';
      return;
    }
    if (!enabled || !phaseKey || model?.phase === 'finished' || phaseLimit == null || phaseSeconds == null) return;

    if (started.current !== phaseKey) {
      started.current = phaseKey;
      // Allow the cinema-entry transition to finish before this screen mounts;
      // do not replay a phase cue when reconnecting well into an existing turn.
      if (phaseSeconds > phaseLimit - Math.min(8,phaseLimit * .2) && (typeof document === 'undefined' || document.visibilityState === 'visible')) playRoundCue('minute');
    }

    const remaining = Math.ceil(phaseSeconds);
    const tickKey = `${timerKey}:${Math.floor(now / 250)}`;
    if (paused || remaining <= 0 || remaining > 5 || lastTick.current === tickKey) return;
    lastTick.current = tickKey;
    if (typeof document === 'undefined' || document.visibilityState === 'visible') playClockTick();
  }, [enabled, model?.gameId, model?.turnId, model?.phase, model?.settings?.competitive?.clueSeconds, model?.settings?.competitive?.guessSeconds, model?.confirmation?.deadline, model?.confirmation?.cardId, phaseKey, timerKey, phaseLimit, phaseSeconds, now, paused, revision]);
}
