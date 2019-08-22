/**
 * pathutils.js provides methods for manipulating SVG paths.
 */

/**
 * Move the current position to X,Y.  Usually used in the context of creating a
 * path.
 * @param {number} x
 * @param {number} y
 * @return {string}
 */
export function move(x, y) {
  return "M" + x + " " + y;
}

/**
 * Like move, but with a glift point.
 * @param {!glift.Point} pt
 * @return {string}
 */
export function movePt(pt) {
  return move(pt.x(), pt.y());
}

/**
 * Create a relative SVG line, starting from the 'current' position. I.e.,
 * the (0,0) point is that last place drawn-to or moved-to.
 * @param {number} x
 * @param {number} y
 * @return {string}
 */
export function lineRel(x, y) {
  return "l" + x + " " + y;
}

/**
 * Like lineRel, but with a pt.
 * @param {!glift.Point} pt
 * @return {string}
 */
export function lineRelPt(pt) {
  return lineRel(pt.x(), pt.y());
}

/**
 * Create an absolute SVG line -- different from lower case.
 * This form is usually preferred.
 * @param {number} x
 * @param {number} y
 * @return {string}
 */
export function lineAbs(x, y) {
  return "L" + x + " " + y;
}

/**
 * Like lineAbs, but with a pt.
 * @param {!glift.Point} pt
 * @return {string}
 */
export function lineAbsPt(pt) {
  return lineAbs(pt.x(), pt.y());
}
