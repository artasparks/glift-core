goog.provide('glift.flattener.BoardPoints');
goog.provide('glift.flattener.EdgeLabel');
goog.provide('glift.flattener.BoardPt');

/**
 * A collection of values indicating in intersection  on the board. The intPt is
 * the standard (0-18,0-18) point indexed from the upper left. The coordPt is
 * the float point in pixel space. Lastly, each intersection on the board 'owns'
 * an area of space, indicated by the bounding box.
 *
 * @typedef {{
 *  intPt: !glift.Point,
 *  coordPt: !glift.Point,
 *  bbox: !glift.orientation.BoundingBox
 * }}
 */
glift.flattener.BoardPt;

/**
 * A label on the edge of the board, for when the draw board coordinates option
 * is set.
 *
 * @typedef {{
 *  label: string,
 *  coordPt: !glift.Point
 * }}
 */
glift.flattener.EdgeLabel;

/**
 * BoardPoints is a helper for actually rendering the board when pixel
 * representations are required.
 *
 * In more detail: board points maintains a mapping from an intersection on the
 * board to a coordinate in pixel-space. It also contains information about the
 * spacing of the points and the radius (useful for drawing circles).
 *
 * Later, this is directly to create everything that lives on an intersection.
 * In particular,
 *  - lines
 *  - star ponts
 *  - marks
 *  - stones
 *  - stone shadows
 *  - button bounding box.
 *
 * @param {!Array<!glift.flattener.BoardPt>} points
 * @param {number} spacing
 * @param {!glift.orientation.BoundingBox} intBbox
 * @param {number} numIntersections
 * @param {!Array<glift.flattener.EdgeLabel>=} opt_edgeLabels
 *
 * @constructor @final @struct
 */
glift.flattener.BoardPoints = function(
    points, spacing, intBbox, numIntersections, opt_edgeLabels) {
  /** @const {!Array<!glift.flattener.BoardPt>} */
  this.points = points;

  /** @const {!Object<!glift.PtStr, !glift.flattener.BoardPt>} */
  this.cache = {};
  for (var i = 0; i < this.points.length; i++) {
    var pt = points[i];
    this.cache[pt.intPt.toString()] = pt;
  }

  /** @const {number} */
  this.spacing = spacing;
  /** @const {number} */
  this.radius = spacing / 2;

  /** @const {!glift.orientation.BoundingBox} */
  this.intBbox = intBbox;

  /** @const {number} */
  this.numIntersections = numIntersections;

  /** @const {!Array<!glift.flattener.EdgeLabel>} */
  this.edgeCoordLabels = opt_edgeLabels || [];
};

glift.flattener.BoardPoints.prototype = {
  /**
   * Get the coordinate for a given integer point string.  Note: the integer
   * points are 0 indexed, i.e., 0->18 for a 19x19.  Recall that board points
   * from the the top left (0,0) to the bottom right (18, 18).
   *
   * @param {!glift.Point} pt
   * @return {!glift.flattener.BoardPt}
   */
  getCoord: function(pt) {
    return this.cache[pt.toString()];
  },

  /**
   * Return all the points as an array.
   * @return {!Array<!glift.flattener.BoardPt>}
   */
  data: function() {
    return this.points;
  },

  /**
   * Test whether an integer point exists in the points map.
   * @param {!glift.Point} pt
   * @return {boolean}
   */
  hasCoord: function(pt) {
    return this.cache[pt.toString()] !== undefined;
  },

  /**
   * Since starpoints are rotationally semmetric, we define an array of arrays
   * and then determine all combinations of pairs in the inner array.
   * @private {!Object<number, !Array<!Array<number>>>}
   */
  starPointTempl_:  {
    9 : [[ 2, 6 ], [ 4 ]],
    13 : [[ 3, 9 ], [6]],
    19 : [[ 3, 9, 15 ]]
  },

  /**
   * Return an array on integer points (0-indexed), used to indicate where star
   * points should go. Ex. [(3,3), (3,9), (3,15), ...].  This only returns the
   * points that are actually present in the points mapping.
   *
   * @return {!Array<!glift.Point>}
   */
  starPoints: function() {
    var point = glift.util.point,
        // In pts, each element in the sub array is mapped against every other
        // element.  Thus [2, 6] generates [(2,2), (2,6), (6,2), (6,6)] and
        // [[2, 6], [4]] generates the above concatinated with [4,4].
        pts = this.starPointTempl_,
        outerSet = pts[this.numIntersections] || [],
        outStarPoints = [];
    for (var k = 0; k < outerSet.length; k++) {
      var thisSet = outerSet[k];
      for (var i = 0; i < thisSet.length; i++) {
        for (var j = 0; j < thisSet.length; j++) {
          var pt = point(thisSet[i], thisSet[j]);
          if (this.hasCoord(pt)) {
            outStarPoints.push(pt);
          }
        }
      }
    }
    return outStarPoints;
  }
};

/**
 * Creates a beard points wrapper from a flattened object.
 *
 * @param {!glift.flattener.Flattened} flat
 * @param {number} spacing In pt.
 */
glift.flattener.BoardPoints.fromFlattened = function(flat, spacing) {
  return glift.flattener.BoardPoints.fromBbox(
      flat.board().boundingBox(), spacing, flat.board().maxBoardSize());
};

/**
 * Creates a board points wrapper.
 *
 * @param {glift.orientation.BoundingBox} bbox In intersections
 * @param {number} spacing Of the intersections. In pt.
 * @param {number} size
 * @return {!glift.flattener.BoardPoints}
 */
glift.flattener.BoardPoints.fromBbox = function(bbox, spacing, size) {
  var tl = bbox.topLeft();
  var br = bbox.botRight();
  var half = spacing / 2;
  /** @type {!Array<!glift.flattener.BoardPt>} */
  var bpts = [];
  for (var x = tl.x(); x < bbox.width(); x++) {
    for (var y = tl.y(); y < bbox.height(); y++) {
      var i = x - tl.x();
      var j = y - tl.y();
      var b = {
        intPt: new glift.Point(x, y),
        coordPt: new glift.Point(x + half + i*spacing, y + half + j*spacing),
      };
    }
  }
  return new glift.flattener.BoardPoints(bpts, spacing, bbox, size);
};
