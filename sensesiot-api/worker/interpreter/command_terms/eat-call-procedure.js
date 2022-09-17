// eslint-disable-next-line import/no-cycle

import eatToken from "../eat-token.js";
import eatValueTerm from "../eat-value-term.js";

export default async function eatCallProcedure(astInfo) {
  const { ast, procedures } = astInfo;
  if (ast.type !== "procedures_callnoreturn") {
    throw new Error(`Not procedures_callnoreturn Block (${ast.type})`);
  }

  const { inputs } = ast;
  const { name: procedureName, params } = ast.extraState;
  const inputTerms = await Promise.all(
    params.map((_, i) => eatToken(eatValueTerm, inputs[`ARG${i}`], astInfo))
  );

  const localParams = params.map((ele, i) => ({
    name: ele,
    term: inputTerms[i],
  }));

  await procedures[procedureName](localParams);
}
