/**
 * Checks to make sure a number is inbounds.  In other words, whether a number
 * is between 0 (inclusive) and bounds (exclusive).
 */
export function inBounds(num:number, bounds:number): boolean {
  return ((num < bounds) && (num >= 0))
}

/**
 * Checks to make sure a number is out-of-bounds
 * returns true if a number is outside a bounds (inclusive) or negative
 * @param {number} num
 * @param {number} bounds
 * @return {boolean}
 */
export function outBounds(num:number, bounds:number): boolean {
  return ((num >= bounds) || (num < 0))
}
