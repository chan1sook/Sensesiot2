import { phi as PHI } from "mathjs";

export default async function eatMathConstant(astInfo) {
  const { ast } = astInfo;
  if (ast.type !== "math_constant") {
    throw new Error(`Not math_constant Block (${ast.type})`);
  }

  const { CONSTANT } = ast.fields;
  switch (CONSTANT) {
    case "PI":
      return Math.PI;
    case "E":
      return Math.E;
    case "GOLDEN_RATIO":
      return PHI;
    case "SQRT2":
      return Math.SQRT2;
    case "SQRT1_2":
      return Math.SQRT1_2;
    case "INFINITY":
      return Infinity;
    default:
      throw new Error(`No valid math_constant ${CONSTANT}`);
  }
}
