// eslint-disable-next-line import/no-cycle
import eatNumberTerm from "./eat-number-term.js";
import eatToken from "../eat-token.js";

export default async function eatMathSingle(astInfo) {
  const { ast } = astInfo;
  if (ast.type !== "math_single") {
    throw new Error(`Not math_single Block (${ast.type})`);
  }

  const { NUM } = ast.inputs;
  const numTerm = await eatToken(eatNumberTerm, NUM, astInfo, 0);

  const { OP } = ast.fields;
  switch (OP) {
    case "ROOT":
      return Math.sqrt(numTerm);
    case "ABS":
      return Math.abs(numTerm);
    case "NEG":
      return -numTerm;
    case "LN":
      return Math.log(numTerm);
    case "LOG10":
      return Math.log10(numTerm);
    case "EXP":
      return Math.exp(numTerm);
    case "POW10":
      return 10 ** numTerm;
    default:
      throw new Error(`No valid math_single OP ${OP}`);
  }
}
