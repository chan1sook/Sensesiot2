// eslint-disable-next-line import/no-cycle
import eatNumberTerm from "./eat-number-term.js";
import eatToken from "../eat-token.js";

export default async function eatMathTrig(astInfo) {
  const { ast } = astInfo;
  if (ast.type !== "math_trig") {
    throw new Error(`Not math_trig Block (${ast.type})`);
  }

  const { NUM } = ast.inputs;
  const numTerm = await eatToken(eatNumberTerm, NUM, astInfo, 0);

  const { OP } = ast.fields;

  switch (OP) {
    case "SIN":
      return Math.sin(numTerm);
    case "COS":
      return Math.cos(numTerm);
    case "TAN":
      return Math.tan(numTerm);
    case "ASIN":
      return Math.asin(numTerm);
    case "ACOS":
      return Math.acos(numTerm);
    case "ATAN":
      return Math.atan(numTerm);
    default:
      throw new Error(`No valid math_single OP ${OP}`);
  }
}
