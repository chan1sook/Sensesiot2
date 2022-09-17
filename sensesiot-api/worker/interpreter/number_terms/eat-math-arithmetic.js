// eslint-disable-next-line import/no-cycle
import eatNumberTerm from "./eat-number-term.js";
import eatToken from "../eat-token.js";

export default async function eatMathArithmetic(astInfo) {
  const { ast } = astInfo;
  if (ast.type !== "math_arithmetic") {
    throw new Error(`Not math_arithmetic Block (${ast.type})`);
  }

  const { A, B } = ast.inputs;
  const [leftTerm, rightTerm] = await Promise.all([
    eatToken(eatNumberTerm, A, astInfo, 0),
    eatToken(eatNumberTerm, B, astInfo, 0),
  ]);

  const { OP } = ast.fields;
  switch (OP) {
    case "ADD":
      return leftTerm + rightTerm;
    case "MINUS":
      return leftTerm - rightTerm;
    case "MULTIPLY":
      return leftTerm * rightTerm;
    case "DIVIDE":
      return leftTerm / rightTerm;
    case "POWER":
      return leftTerm ** rightTerm;
    default:
      throw new Error(`No valid math_arithmetic OP ${OP}`);
  }
}
