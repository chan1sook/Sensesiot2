/* eslint-disable import/no-cycle */
import eatToken from "../eat-token.js";
import eatValueTerm from "../eat-value-term.js";

export default async function eatLogicOperation(astInfo) {
  const { ast } = astInfo;
  if (ast.type !== "logic_operation") {
    throw new Error(`Not logic_operation Block (${ast.type})`);
  }

  const { A, B } = ast.inputs;
  const { OP } = ast.fields;
  const [leftTerm, rightTerm] = await Promise.all([
    eatToken(eatValueTerm, A, astInfo, false),
    eatToken(eatValueTerm, B, astInfo, false),
  ]);

  switch (OP) {
    case "AND":
      return leftTerm && rightTerm;
    case "OR":
      return leftTerm || rightTerm;
    default:
      throw new Error(`No valid logic_operation OP ${OP}`);
  }
}
