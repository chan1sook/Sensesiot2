/* eslint-disable import/no-cycle */
import eatDatetimeTerm, {
  isDateTimeTerm,
} from "./datetime_terms/eat-datetime-term.js";
import eatCallProcedureReturn from "./command_terms/eat-call-procedure-return.js";
import eatVariablesGet from "./eat-variables-get.js";
import eatLogicTerm, { isLogicTerm } from "./logic_terms/eat-logic-term.js";
import eatNumberTerm, { isNumberTerm } from "./number_terms/eat-number-term.js";
import eatStringTerm, { isStringTerm } from "./string_terms/eat-string-term.js";

export default async function eatValueTerm(astInfo) {
  const { ast } = astInfo;
  if (ast.type === "variables_get") {
    return eatVariablesGet({
      ...astInfo,
      type: "any",
    });
  }

  if (ast.type === "procedures_callreturn") {
    return eatCallProcedureReturn({
      ...astInfo,
      type: "any",
    });
  }

  if (isNumberTerm(ast.type)) {
    return eatNumberTerm(astInfo);
  }

  if (isLogicTerm(ast.type)) {
    return eatLogicTerm(astInfo);
  }

  if (isStringTerm(ast.type)) {
    return eatStringTerm(astInfo);
  }

  if (isDateTimeTerm(ast.type)) {
    return eatDatetimeTerm(astInfo);
  }

  throw new Error(`Not value_term Block (${ast.type})`);
}
