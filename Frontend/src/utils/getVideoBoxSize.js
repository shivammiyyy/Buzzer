export function getVideoBoxSize(X, Y, n, aspect_ratio = 1) {
  const tile_count = n;
  const b = Y; // height of rectangle
  const a = X; // width of rectangle

  let sizeX = Math.sqrt((b * a * aspect_ratio) / tile_count);
  let numberOfPossibleWholeTilesH = Math.floor((b * aspect_ratio) / sizeX);
  let numberOfPossibleWholeTilesW = Math.floor(a / sizeX);
  let total = numberOfPossibleWholeTilesH * numberOfPossibleWholeTilesW;

  while (total < tile_count) {
    sizeX--;
    numberOfPossibleWholeTilesH = Math.floor((b * aspect_ratio) / sizeX);
    numberOfPossibleWholeTilesW = Math.floor(a / sizeX);
    total = numberOfPossibleWholeTilesH * numberOfPossibleWholeTilesW;
  }

  return {
    x: sizeX,
    y: sizeX / aspect_ratio,
  };
}
