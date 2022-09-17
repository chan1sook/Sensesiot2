// eslint-disable-next-line import/no-cycle
import eatNumberTerm from "./eat-number-term.js";
import eatToken from "../eat-token.js";

export default async function eatMathRound(astInfo) {
  const { ast } = astInfo;
  if (ast.type !== "math_round") {
    throw new Error(`Not math_round Block (${ast.type})`);
  }

  const { NUM } = ast.inputs;
  const numTerm = await eatToken(eatNumberTerm, NUM, astInfo, 0);

  const { OP } = ast.fields;
  switch (OP) {
    case "ROUND":
      return Math.round(numTerm);
    case "ROUNDUP":
      return Math.ceil(numTerm);
    case "ROUNDDOWN":
      return Math.floor(numTerm);
    default:
      throw new Error(`No valid math_round OP ${OP}`);
  }
}
