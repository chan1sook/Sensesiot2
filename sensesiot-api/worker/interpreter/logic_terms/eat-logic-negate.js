/* eslint-disable import/no-cycle */
import eatToken from "../eat-token.js";
import eatValueTerm from "../eat-value-term.js";

export default async function eatLogicNegate(astInfo) {
  const { ast } = astInfo;
  if (ast.type !== "logic_negate") {
    throw new Error(`Not logic_negate Block (${ast.type})`);
  }

  const { BOOL } = ast.inputs;
  const term = await eatToken(eatValueTerm, BOOL, astInfo, false);

  return !term;
}
