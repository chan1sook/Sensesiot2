import eatToken from "../eat-token.js";
import eatNumberTerm from "../number_terms/eat-number-term.js";

export default async function eatMathChange(astInfo) {
  const { ast, variables } = astInfo;

  if (ast.type !== "math_change") {
    throw new Error(`Not math_change Block (${ast.type})`);
  }

  const { DELTA } = ast.inputs;
  const deltaTerm = await eatToken(eatNumberTerm, DELTA, astInfo, 0);

  const { VAR } = ast.fields;
  const targetVariable = variables.find((ele) => ele.id === VAR.id);
  let value;
  if (targetVariable) {
    value = targetVariable.value;
  }

  if (typeof value === "number") {
    targetVariable.value += deltaTerm;
  } else {
    throw new Error("Can't change non-number value");
  }
}
