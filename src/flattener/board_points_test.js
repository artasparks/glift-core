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
    ok(bp.hasCoord(new glift.Point(18, 18)));
    ok(!bp.hasCoord(new glift.Point(19, 19)));
  });
})();
