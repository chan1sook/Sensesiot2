import eatToken from "../eat-token.js";
import eatValueTerm from "../eat-value-term.js";

export default async function eatProcedureIfReturn(astInfo) {
  const { ast } = astInfo;
  if (ast.type !== "procedures_ifreturn") {
    throw new Error(`Not procedures_ifreturn Block (${ast.type})`);
  }

  const { CONDITION } = ast.inputs;
  const logicTerm = await eatToken(eatValueTerm, CONDITION, astInfo, false);

  if (logicTerm) {
    return {
      stopReturn: true,
      value: undefined,
    };
  }

  return {
    stopReturn: false,
    value: undefined,
  };
}
