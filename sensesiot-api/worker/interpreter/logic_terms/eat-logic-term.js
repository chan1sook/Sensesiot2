/* eslint-disable import/no-cycle */
import eatCallProcedureReturn from "../command_terms/eat-call-procedure-return.js";
import eatVariablesGet from "../eat-variables-get.js";
import eatDatetimeEquals from "./eat-datetime-equal.js";
import eatLogicBoolean from "./eat-logic-boolean.js";
import eatLogicCompare from "./eat-logic-compare.js";
import eatLogicNegate from "./eat-logic-negate.js";
import eatLogicOperation from "./eat-logic-operation.js";
import eatMathProperty from "./eat-math-prop.js";
import eatTextIsEmpty from "./eat-text-isempty.js";

const logicTermTypes = [
  "logic_boolean",
  "logic_negate",
  "logic_operation",
  "logic_compare",
  "math_number_property",
  "datetime_equals",
  "text_isEmpty",
  "variables_get",
  "procedures_callreturn",
];

export function isLogicTerm(type) {
  return logicTermTypes.includes(type);
}

export default async function eatLogicTerm(astInfo) {
  const { ast } = astInfo;
  switch (ast.type) {
    case "logic_boolean":
      return eatLogicBoolean(astInfo);
    case "logic_negate":
      return eatLogicNegate(astInfo);
    case "logic_operation":
      return eatLogicOperation(astInfo);
    case "logic_compare":
      return eatLogicCompare(astInfo);
    case "math_number_property":
      return eatMathProperty(astInfo);
    case "datetime_equals":
      return eatDatetimeEquals(astInfo);
    case "text_isEmpty":
      return eatTextIsEmpty(astInfo);
    case "variables_get":
      return eatVariablesGet({
        ...astInfo,
        type: "logic",
      });
    case "procedures_callreturn":
      return eatCallProcedureReturn({
        ...astInfo,
        type: "logic",
      });
    default:
      throw new Error(`Not logic_term Block (${ast.type})`);
  }
}
