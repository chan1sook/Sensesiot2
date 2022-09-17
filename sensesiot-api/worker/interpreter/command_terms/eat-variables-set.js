import eatToken from "../eat-token.js";
import eatValueTerm from "../eat-value-term.js";

export default async function eatVariablesSet(astInfo) {
  const { ast, variables } = astInfo;
  if (ast.type !== "variables_set") {
    throw new Error(`Not variables_set Block (${ast.type})`);
  }

  const { VALUE } = ast.inputs;
  const valueTerm = await eatToken(eatValueTerm, VALUE, astInfo, undefined);

  const { VAR } = ast.fields;
  const targetVariable = variables.find((ele) => ele.id === VAR.id);
  if (!targetVariable) {
    variables.push({
      id: VAR.id,
      value: valueTerm,
    });
  } else {
    targetVariable.value = valueTerm;
  }
}
