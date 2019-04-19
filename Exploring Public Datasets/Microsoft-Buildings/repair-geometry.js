const jsts = require("jsts");

module.exports = repairGeometry;

function repairGeometry(input, opts) {
  opts = { properties: {}, ...opts };
  const reader = new jsts.io.GeoJSONReader();
  const f = reader.read(input);
  const simplifier = new jsts.simplify.VWSimplifier(f.geometry);
  simplifier.setDistanceTolerance(0.00001);
  const simple = simplifier.getResultGeometry();
  const writer = new jsts.io.GeoJSONWriter();
  const gj = writer.write(simple);
  const line = JSON.stringify(gj);
  return line;
}
