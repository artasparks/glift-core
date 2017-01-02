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
 * @param {!Array<!glift.flattener.EdgeLabel>} edgeLabels
 *
 * @constructor @final @struct
 */
glift.flattener.BoardPoints = function(
    points, spacing, intBbox, numIntersections, edgeLabels) {
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
  this.edgeCoordLabels = edgeLabels;
};

glift.flattener.BoardPoints.prototype = {
  /** @return {number} intersection-width */
  intWidth: function() { return this.intBbox.width() + 1; },
  /** @return {number} intersection-width */
  intHeight: function() { return this.intBbox.height() + 1; },

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
   * Return an array on integer points (0-indexed), used to indicate where star
   * points should go. Ex. [(3,3), (3,9), (3,15), ...].  This only returns the
   * points that are actually present in the points mapping.
   *
   * @return {!Array<!glift.Point>}
   */
  starPoints: function() {
    return glift.flattener.starpoints.allPts(this.numIntersections);
  }
};

/**
 * Creates a beard points wrapper from a flattened object.
 *
 * @param {!glift.flattener.Flattened} flat
 * @param {number} spacing In pt.
 * @param {boolean} opt_drawBoardCoords
 */
glift.flattener.BoardPoints.fromFlattened =
    function(flat, spacing, opt_drawBoardCoords) {
  var bbox = flat.board().boundingBox();
  return glift.flattener.BoardPoints.fromBbox(
      flat.board().boundingBox(),
      spacing,
      flat.board().maxBoardSize(),
      !!opt_drawBoardCoords);
};

/**
 * Creates a board points wrapper.
 *
 * @param {glift.orientation.BoundingBox} bbox In intersections. Due to weird
 *    legacy nonsense, we assume that the bounding box has an extra intersection
 *    on all sides (i.e., height/width + 2) if drawBoardCoords is specified.
 * @param {number} spacing Of the intersections. In pt.
 * @param {number} size
 * @param {boolean} drawBoardCoords
 * @return {!glift.flattener.BoardPoints}
 */
glift.flattener.BoardPoints.fromBbox =
    function(bbox, spacing, size, drawBoardCoords) {
  var tl = bbox.topLeft();
  var br = bbox.botRight();

  var half = spacing / 2;
  /** @type {!Array<!glift.flattener.BoardPt>} */
  var bpts = [];
  /** @type {!Array<!glift.flattener.EdgeLabel>} */
  var edgeLabels = [];

  // Note: Convention is to leave off the 'I' coordinate. Note that capital
  // letters are enough for normal boards.
  var xCoordLabels = 'ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghjklmnopqrstuvwxyz';

  var offset = drawBoardCoords ? 1 : 0;
  var startX = tl.x();
  var endX = br.x() + 2*offset;
  var startY = tl.y();
  var endY = br.y() + 2*offset;

  var isEdgeX = function(val) { return val === startX || val == endX; }
  var isEdgeY = function(val) { return val === startY || val == endY; }

  for (var x = startX; x <= endX; x++) {
    for (var y = startY; y <= endY; y++) {
      var i = x - startX;
      var j = y - startY;
      var coordPt = new glift.Point(half + i*spacing, half + j*spacing);
      if (drawBoardCoords && (isEdgeX(x) || isEdgeY(y))) {
        if (isEdgeX(x) && isEdgeY(y)) {
          // This is a corner; no coords here.
        }
        var label = '';
        if (isEdgeX(x)) {
          label = xCoordLabels[x];
        } else {
          label = (startY + 1) + '';
        }
        edgeLabels.push({
          label: label,
          coordPt: coordPt,
        });
      } else {
        bpts.push({
          intPt: new glift.Point(x + offset, y + offset),
          coordPt: coordPt,
        });
      }
    }
  }
  return new glift.flattener.BoardPoints(bpts, spacing, bbox, size, edgeLabels);
};
