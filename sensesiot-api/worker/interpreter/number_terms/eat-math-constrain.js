// eslint-disable-next-line import/no-cycle
import eatNumberTerm from "./eat-number-term.js";
import eatToken from "../eat-token.js";

export default async function eatMathConstrain(astInfo) {
  const { ast } = astInfo;
  if (ast.type !== "math_constrain") {
    throw new Error(`Not math_constrain Block (${ast.type})`);
  }

  const { VALUE, HIGH, LOW } = ast.inputs;
  const [valueTerm, highTerm, lowTerm] = await Promise.all([
    eatToken(eatNumberTerm, VALUE, astInfo, 0),
    eatToken(eatNumberTerm, HIGH, astInfo, 0),
    eatToken(eatNumberTerm, LOW, astInfo, 0),
  ]);
  return Math.max(Math.min(valueTerm, highTerm), lowTerm);
}
