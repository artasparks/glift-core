goog.provide('glift.orientation.AutoRotateCropPrefs');

/**
 * Options for cropping
 * - What are the destination cropping-regions?
 * - Should the points be flipped over the X or Y axis to get to the desired
 *   crop? By default we rotate, but this can be overridden to do prefer doing
 *   flips (if possible).
 *
 * @typedef {{
 *  corner: glift.enums.boardRegions,
 *  side: glift.enums.boardRegions,
 *  preferFlips: (boolean|undefined),
 * }}
 */
glift.orientation.AutoRotateCropPrefs;

/**
 * Automatically rotate a movetree. Relies on findCanonicalRotation to find the
 * correct orientation.
 *
 * Size is determined by examining the sz property of the game.
 * @param {!glift.rules.MoveTree} movetree
 * @param {!glift.orientation.AutoRotateCropPrefs=} opt_prefs
 * @return {!glift.rules.MoveTree}
 */
glift.orientation.autoRotateCrop = function(movetree, opt_prefs) {
  var nmt = movetree.newTreeRef();
  var region = glift.orientation.getQuadCropFromMovetree(movetree);
  var rotation = glift.orientation.findCropRotation_(region, opt_prefs);
  if (rotation == glift.enums.rotations.NO_ROTATION) {
    return nmt.getTreeFromRoot();
  }

  var doFlips = !!opt_prefs.preferFlips;
  var flip = glift.enums.Flip.NO_FLIP;
  if (doFlips) {
    flip = glift.orientation.flipForRotation_(region, rotation);
  }
  if (flip !== glift.enums.Flip.NO_FLIP) {
    nmt.recurseFromRoot(function(mt) {
      var props = mt.properties();
      props.forEach(function(prop, vals) {
        var size = movetree.getIntersections();
        if (flip === glift.enums.Flip.VERTICAL) {
          props.flipVert(prop, size);
        } else {
          props.flipHorz(prop, size);
        }
      });
    });
  } else {
    nmt.recurseFromRoot(function(mt) {
      var props = mt.properties();
      props.forEach(function(prop, vals) {
        var size = movetree.getIntersections();
        props.rotate(prop, size, rotation);
      });
    });
  }
  return nmt.getTreeFromRoot();
};

/**
 * Calculates the desired rotation for a movetree, based on rotation
 * preferences and the movetrees quad-crop.
 *
 * Region ordering should specify what regions the rotation algorithm should
 * target. If not specified, defaults to TOP_RIGHT / TOP.
 *
 * This is primarily intended to be used for problems. It doesn't make sense to
 * rotate commentary diagrams.
 *
 * @param {!glift.rules.MoveTree} movetree
 * @param {!glift.orientation.AutoRotateCropPrefs=} opt_prefs
 * @return {!glift.enums.rotations} The rotation that should be performed.
 */
glift.orientation.findCanonicalRotation = function(movetree, opt_prefs) {
  var region = glift.orientation.getQuadCropFromMovetree(movetree);
  return glift.orientation.findCropRotation_(region, opt_prefs);
};

/**
 * Calculates what rotation is required to go from one orientation to another orientation.
 *
 * @param {!glift.enums.boardRegions} region
 * @param {!glift.orientation.AutoRotateCropPrefs=} opt_prefs
 * @return {!glift.enums.rotations} The rotation that should be performed.
 * @private
 */
glift.orientation.findCropRotation_ = function(region, opt_prefs) {
  var boardRegions = glift.enums.boardRegions;
  var rotations = glift.enums.rotations;
  var cornerRegions = {
    TOP_LEFT: 0,
    BOTTOM_LEFT: 90,
    BOTTOM_RIGHT: 180,
    TOP_RIGHT: 270
  };
  var sideRegions = {
    TOP: 0,
    LEFT: 90,
    BOTTOM: 180,
    RIGHT: 270
  };

  var prefs = opt_prefs;
  if (!prefs) {
    prefs = {
      corner: boardRegions.TOP_RIGHT,
      side: boardRegions.TOP
    };
  }

  if (cornerRegions[region] !== undefined ||
      sideRegions[region] !== undefined) {
    var start = 0, end = 0;
    if (cornerRegions[region] !== undefined) {
      start = cornerRegions[region];
      end = cornerRegions[prefs.corner];
    }

    if (sideRegions[region] !== undefined) {
      start = sideRegions[region];
      end = sideRegions[prefs.side];
    }

    var rot = (360 + start - end) % 360;
    switch(rot) {
      case 0: return rotations.NO_ROTATION;
      case 90: return rotations.CLOCKWISE_90;
      case 180: return rotations.CLOCKWISE_180;
      case 270: return rotations.CLOCKWISE_270;
      default: return rotations.NO_ROTATION;
    }
  }

  // No rotations. We only rotate when the quad crop region is either a corner
  // or a side.
  return rotations.NO_ROTATION;
};

/**
 * @param {glift.enums.boardRegions} region
 * @param {glift.enums.rotations} rotation
 * @return {glift.enums.Flip}
 * @private
 */
glift.orientation.flipForRotation_ = function(region, rotation) {
  var br = glift.enums.boardRegions;
  var rots = glift.enums.rotations;

  if (rotation === rots.CLOCKWISE_90 &&
      (region == br.TOP_LEFT || region == br.BOTTOM_RIGHT)) {
    return glift.enums.Flip.HORIZONTAL;

  } else if (rotation === rots.CLOCKWISE_90 &&
      (region == br.TOP_RIGHT || region == br.BOTTOM_LEFT)) {
    return glift.enums.Flip.VERTICAL;

  } else if (rotation === rots.CLOCKWISE_270 &&
      (region == br.TOP_LEFT || region == br.BOTTOM_RIGHT)) {
    return glift.enums.Flip.VERTICAL;

  } else if (rotation === rots.CLOCKWISE_270 &&
      (region == br.TOP_RIGHT || region == br.BOTTOM_LEFT)) {
    return glift.enums.Flip.HORIZONTAL;
  }

  // TODO(kashomon): Add support for sides.

  return glift.enums.Flip.NO_FLIP;
};
