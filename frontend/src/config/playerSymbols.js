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

export function criticNameStyle(color) {
  const hex = robotColor(color).slice(1);
  const [r,g,b] = [0,2,4].map(i=>parseInt(hex.slice(i,i+2),16)/255);
  const max=Math.max(r,g,b), min=Math.min(r,g,b), delta=max-min;
  let hue=0;
  if (delta) hue=max===r?((g-b)/delta)%6:max===g?(b-r)/delta+2:(r-g)/delta+4;
  hue=(hue*60+360)%360;
  return {'--critic-neon':`hsl(${Math.round(hue)} 100% 72%)`};
}
