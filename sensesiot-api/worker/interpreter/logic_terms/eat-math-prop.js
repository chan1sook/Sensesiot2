import { isInteger, isNegative, isPositive, isPrime } from "mathjs";
// eslint-disable-next-line import/no-cycle
import eatNumberTerm from "../number_terms/eat-number-term.js";
import eatToken from "../eat-token.js";

export default async function eatMathProperty(astInfo) {
  const { ast } = astInfo;
  if (ast.type !== "math_number_property") {
    throw new Error(`Not math_number_property Block (${ast.type})`);
  }

  const { NUMBER_TO_CHECK, DIVISOR } = ast.inputs;
  const [numTerm, divTerm] = await Promise.all([
    eatToken(eatNumberTerm, NUMBER_TO_CHECK, astInfo, 0),
    eatToken(eatNumberTerm, DIVISOR, astInfo, 0),
  ]);

  const { PROPERTY } = ast.fields;
  switch (PROPERTY) {
    case "ODD":
      return numTerm % 2 === 1;
    case "EVEN":
      return numTerm % 2 === 0;
    case "PRIME":
      return isPrime(numTerm);
    case "WHOLE":
      return isInteger(numTerm);
    case "POSITIVE":
      return isPositive(numTerm);
    case "NEGATIVE":
      return isNegative(numTerm);
    case "DIVISIBLE_BY":
      return numTerm % divTerm === 0;
    default:
      throw new Error(`No valid math_number_property ${PROPERTY}`);
  }
}
