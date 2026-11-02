import identities from "../../../shared/player-identities.json" with { type: "json" };

// Stable server keys and character order come from the same shared catalog.
export const colors = identities.map(({hex}) => hex);
export const robots = identities;
export const emblems = identities;

export function robotIndex(color) {
  return Math.max(0, colors.findIndex((hex) => hex.toLowerCase() === color?.toLowerCase()));
}

export function robotColor(color) {
  return identities[robotIndex(color)].color;
}
