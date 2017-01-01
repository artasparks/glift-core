(function() {
  module('glift.flattener.boardPointsTest');
  var basicSgf = '(;GB[1]C[foo]AW[aa]AB[ab]LB[ab:z]SQ[cc])';
  var movetree = glift.rules.movetree.getFromSgf(basicSgf);
  var flat = glift.flattener.flatten(movetree);
  var spacing = 20; // pixels? mm? I dunno.

  test('BoardPoints Construction: normal full board.', function() {
    var bp = glift.flattener.BoardPoints.fromFlattened(flat, spacing);
    ok(bp);
    deepEqual(bp.intHeight(), 19, 'height');
    deepEqual(bp.intWidth(), 19, 'width');

    ok(bp.hasCoord(new glift.Point(0, 0)));
    deepEqual(bp.getCoord(new glift.Point(0, 0)).coordPt,
        new glift.Point(spacing/2, spacing/2), 'Zero coordPt');

    ok(bp.hasCoord(new glift.Point(18, 18)));
    deepEqual(bp.getCoord(new glift.Point(18, 18)).coordPt,
        new glift.Point(18*spacing + spacing/2, 18*spacing + spacing/2),
        '18,18 coordPt');

    ok(bp.hasCoord(new glift.Point(13, 15)));
    deepEqual(bp.getCoord(new glift.Point(13, 15)).intPt,
        new glift.Point(13,15));
    deepEqual(bp.getCoord(new glift.Point(13, 15)).coordPt,
        new glift.Point(13*spacing + spacing/2, 15*spacing + spacing/2),
        '13,15 coordPt');

    ok(!bp.hasCoord(new glift.Point(19, 19)));
  });

  test('BoardPoints: cropped.', function() {
    var newflat = glift.flattener.flatten(movetree, {
      boardRegion: 'BOTTOM_RIGHT'
    });
    var bp = glift.flattener.BoardPoints.fromFlattened(newflat, spacing);
    ok(!bp.hasCoord(new glift.Point(0, 0)));
    ok(bp.hasCoord(new glift.Point(18, 18)));
    ok(bp.hasCoord(new glift.Point(7, 8)));
    ok(!bp.hasCoord(new glift.Point(19, 19)));
  });

  test('BoardPoints: star points.', function() {
    var bp = glift.flattener.BoardPoints.fromFlattened(flat, spacing);
    bp.numIntersections = 19;
    deepEqual(bp.starPoints(), [
      new glift.Point(3,3),
      new glift.Point(3,9),
      new glift.Point(3,15),
      new glift.Point(9,3),
      new glift.Point(9,9),
      new glift.Point(9,15),
      new glift.Point(15,3),
      new glift.Point(15,9),
      new glift.Point(15,15)]);

    bp.numIntersections = 13;
    deepEqual(bp.starPoints(), [
      new glift.Point(3,3),
      new glift.Point(3,9),
      new glift.Point(9,3),
      new glift.Point(9,9),
      new glift.Point(6,6)]);

    bp.numIntersections = 9;
    deepEqual(bp.starPoints(), [
      new glift.Point(2,2),
      new glift.Point(2,6),
      new glift.Point(6,2),
      new glift.Point(6,6),
      new glift.Point(4,4)]);
  });
})();
