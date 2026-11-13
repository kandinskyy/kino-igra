/** Cover wide displays without cropping the controls on taller desktop windows. */
export function foyerScale(width, height) {
  const horizontal = width / 1672, vertical = height / 941;
  return width / height >= 1.55 ? Math.max(horizontal, vertical) : Math.min(horizontal, vertical);
}
