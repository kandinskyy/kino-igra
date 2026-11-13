export const defaultKinonamesSettings = {
  variant: 'coop',
  coop: {clues: 9, blue: 9, black: 3, lives: 2},
  competitive: {clueSeconds: 60, guessSeconds: 120, traitors: false},
};

export function mergeKinonamesSettings(value = {}) {
  return {
    ...defaultKinonamesSettings,
    ...value,
    coop: {...defaultKinonamesSettings.coop, ...value.coop},
    competitive: {...defaultKinonamesSettings.competitive, ...value.competitive},
  };
}
