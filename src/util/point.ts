import { Rotation } from './rotation'
import * as bounds from './bounds'

/**
 * A point string is just a string with the format '<Number>,<Number>'. We use
 * this special type as a reminder to the reader of the code.
 *
 * Example: '12,5'
 */
export type PtStr = string;

/**
 * @param x coordinate
 * @param y coordinate
 * @return point string
 */
export function coordToString(x:number, y:number) {
  return x + ',' + y;
};

/**
 * @return a point from a point string 'x,y'.
 */
export function pointFromString(str:string) {
  try {
    var split = str.split(",");
    var x = parseInt(split[0], 10);
    var y = parseInt(split[1], 10);
    return new Point(x, y);
  } catch(e) {
    throw "Parsing Error! Couldn't parse a point from: " + str;
  }
};

/**
 * Convert SGF data from SGF data.
 *
 * Returns an array of points. This exists to handle point-rectangle data sets
 * and point data sets uniformly.
 *
 * Example: TR[aa][ab]... vs TR[aa:cc]
 *
 * @param str The sgf string to pars.
 * @return An array of points.
 */
export function pointArrFromSgfProp(str:string): Array<Point> {
  if (str.length === 2) {
    // Assume the properties have the form [ab].
    return [pointFromSgfCoord(str)];
  } else if (str.length > 2) {
    // Assume a point rectangle. This a weirdness of the SGF spec and the reason
    // why this function exists. See http://www.red-bean.com/sgf/sgf4.html#3.5.1
    var splat = str.split(':');
    if (splat.length !== 2) {
      throw new Error('Expected two points: TopLeft and BottomRight for ' +
        'point rectangle. Instead found: ' + str);
    }
    var out = [];
    var tl = pointFromSgfCoord(splat[0]);
    var br = pointFromSgfCoord(splat[1]);
    if (br.x() < tl.x() || br.y() < br.y()) {
      throw new Error('Invalid point rectangle: tl: ' + tl.toString() +
          ', br: ' + br.toString());
    }
    var delta = br.translate(-tl.x(), -tl.y());
    for (var i = 0; i <= delta.y(); i++) {
      for (var j = 0; j <= delta.x(); j++) {
        var newX = tl.x() + j, newY = tl.y() + i;
        out.push(new Point(newX, newY));
      }
    }
    return out;
  } else {
    throw new Error('Unknown pointformat for property data: ' + str);
  }
};


/**
 * Take an SGF point (e.g., 'mc') and return a GliftPoint.
 * SGFs are indexed from the Upper Left:
 *    _  _  _
 *   |aa ba ca ...
 *   |ab bb
 *   |.
 *   |.
 *   |.
 */
export function pointFromSgfCoord(str:string): Point {
  if (str.length !== 2) {
    throw 'Unknown SGF Coord length: ' + str.length +
        'for property ' + str;
  }
  var a = 'a'.charCodeAt(0);
  return new Point(str.charCodeAt(0) - a, str.charCodeAt(1) - a);
};

/**
 * Basic Point class.
 *
 * As a historical note, this class has transformed more than any other class.
 * It was originally cached, with private variables and immutability.  However,
 * I found that all this protection was too tedious.
 */
export class Point {
  private x_: number;
  private y_: number;

  constructor(xIn:number, yIn:number) {
    /**
     * @private {number}
     * @const
     */
    this.x_ = xIn;
    /**
     * @private {number}
     * @const
     */
    this.y_ = yIn;
  }

  /** @return {number} x value */
  x() { return this.x_; }

  /** @return {number} y value */
  y() { return this.y_; }

  /**
   * Whether this point equals another obj.
   */
  equals(inpt: any): boolean {
    if (!inpt) { return false; }
    if (!inpt.x && !inpt.y) { return false; }
    var pt = /** @type {!Point} */ (inpt);
    return this.x_ === pt.x() && this.y_ === pt.y();
  }

  /**
   * @return a new duplicate of this point.
   */
  clone(): Point {
    return new Point(this.x(), this.y());
  }

  /**
   * @return  an SGF coord, e.g., 'ab' for (0,1)
   */
  toSgfCoord(): string {
    var a = 'a'.charCodeAt(0);
    return String.fromCharCode(this.x() + a) +
        String.fromCharCode(this.y() + a);
  }

  /**
   * @return a string representation of the coordinate.  I.e., "12,3".
   */
  toString(): PtStr {
    return coordToString(this.x(), this.y());
  }

  /**
   * Returns a new point that's a translation from this one.
   */
  translate(x:number, y:number) {
    return new Point(this.x() + x, this.y() + y);
  }

  /**
   * Rotate an (integer) point based on the board size.
   * Note: This is an immutable transformation on the point.
   *
   * @return A new point that has possibly been rotated.
   */
  rotate(maxIntersections: number, rot: Rotation): Point {
    if (maxIntersections < 0 ||
        rot === undefined ||
        rot === Rotation.NO_ROTATION) {
      return this;
    }

    var normalized = this.normalize(maxIntersections);

    if (bounds.outBounds(this.x(), maxIntersections) ||
        bounds.outBounds(this.x(), maxIntersections)) {
      throw new Error("rotating a point outside the bounds: " +
          this.toString());
    }

    var rotated = normalized;
    if (rot === Rotation.CLOCKWISE_90) {
      rotated = new Point(normalized.y(), -normalized.x());

    } else if (rot === Rotation.CLOCKWISE_180) {
      rotated = new Point(-normalized.x(), -normalized.y());

    } else if (rot === Rotation.CLOCKWISE_270) {
      rotated = new Point(-normalized.y(), normalized.x());
    }

    return rotated.denormalize(maxIntersections);
  }

  /**
   * The inverse of rotate (see above)}.
   *
   * @param maxIntersections Usually 9, 13, or 19.
   * @param rotation Usually 9, 13, or 19.
   * @return a rotated point.
   */
  antirotate(maxIntersections: number, rotation: Rotation): Point {
    if (rotation === Rotation.CLOCKWISE_90) {
      return this.rotate(maxIntersections, Rotation.CLOCKWISE_270);
    } else if (rotation === Rotation.CLOCKWISE_180) {
      return this.rotate(maxIntersections, Rotation.CLOCKWISE_180);
    } else if (rotation === Rotation.CLOCKWISE_270) {
      return this.rotate(maxIntersections, Rotation.CLOCKWISE_90);
    } else {
      return this.rotate(maxIntersections, rotation);
    }
  }

  /**
   * Flip over the X axis (so flip Y points).
   * @param size Usually 9, 13, or 19
   * @return a new point instance.
   */
  flipVert(size: number): Point {
    if (!size) {
      throw new Error('The board size must be defined. Was:' + size);
    }
    var n = this.normalize(size);
    return new Point(n.x(), -n.y()).denormalize(size);
  }

  /**
   * Flip over the Y axis (so flip X points).
   * @param size Usually 9, 13, or 19
   * @return a new point instance.
   */
  flipHorz(size: number): Point {
    if (!size) {
      throw new Error('The board size must be defined. Was:' + size);
    }
    var n = this.normalize(size);
    return new Point(-n.x(), n.y()).denormalize(size);
  }


  /**
   * Makes the 0,0 point in the very center of the board.
   * @param {number} size Usually 9, 13, or 19
   * @return A new point instance.
   */
  normalize(size: number) {
    if (!size) {
      throw new Error('Size is required for normalization. Was: ' + size);
    }
    var mid = (size - 1) / 2;
    return new Point(this.x() - mid, mid - this.y());
  }

  /**
   * Makes the 0,0 point in the top left, like normal.
   * @param size Usually 9, 13, or 19
   * @return A new point instance.
   */
  denormalize(size: number) {
    var mid = (size - 1) / 2;
    return new Point(mid + this.x(), -this.y() + mid);
  }
};
