/**
 * Rotations we can apply to Go Boards. Doesn't rotate the fundamental data (the
 * SGF points), but rotates at the time the board is drawn.
 * @enum {string}
 */
export enum Rotation {
  NO_ROTATION = 'NO_ROTATION',
  CLOCKWISE_90 = 'CLOCKWISE_90',
  CLOCKWISE_180 = 'CLOCKWISE_180',
  CLOCKWISE_270 = 'CLOCKWISE_270'
}
