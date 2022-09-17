/* eslint-disable import/no-cycle */
import eatNumberTerm from "./eat-number-term.js";
import eatToken from "../eat-token.js";

export default async function eatMathRandomInt(astInfo) {
  const { ast } = astInfo;
  if (ast.type !== "math_random_int") {
    throw new Error(`Not math_random_int Block (${ast.type})`);
  }

  const { FROM, TO } = ast.inputs;
  const [fromTerm, toTerm] = await Promise.all([
    eatToken(eatNumberTerm, FROM, astInfo, 0),
    eatToken(eatNumberTerm, TO, astInfo, 0),
  ]);

  const r = Math.random();
  const numSpace = toTerm - fromTerm;

  return Math.floor(fromTerm + r * numSpace);
}
