// eslint-disable-next-line import/no-cycle
import eatNumberTerm from "./eat-number-term.js";
import eatToken from "../eat-token.js";

export default async function eatMathModulo(astInfo) {
  const { ast } = astInfo;
  if (ast.type !== "math_modulo") {
    throw new Error(`Not math_modulo Block (${ast.type})`);
  }

  const { DIVIDEND, DIVISOR } = ast.inputs;
  const [numTerm, divTerm] = await Promise.all([
    eatToken(eatNumberTerm, DIVIDEND, astInfo, 0),
    eatToken(eatNumberTerm, DIVISOR, astInfo, 0),
  ]);

  return numTerm % divTerm;
}
