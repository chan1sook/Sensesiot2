/* eslint-disable import/no-cycle */
import eatMathArithmetic from "./eat-math-arithmetic.js";
import eatMathSingle from "./eat-math-single.js";
import eatMathNumber from "./eat-math-number.js";
import eatReadSensorData from "./eat-read-sensor.js";
import eatMathTrig from "./eat-math-trig.js";
import eatMathConstant from "./eat-math-constant.js";
import eatMathRound from "./eat-math-round.js";
import eatTextIndexOf from "./eat-text-indexof.js";
import eatTextCount from "./eat-text-count.js";
import eatMathModulo from "./eat-math-modulo.js";
import eatMathConstrain from "./eat-math-constrain.js";
import eatTextLength from "./eat-text-length.js";
import eatMathRandomInt from "./eat-math-randomint.js";
import eatVariablesGet from "../eat-variables-get.js";
import eatCallProcedureReturn from "../command_terms/eat-call-procedure-return.js";

const numberTermTypes = [
  "math_number",
  "math_arithmetic",
  "math_single",
  "math_trig",
  "math_constant",
  "math_round",
  "math_modulo",
  "math_constrain",
  "math_random_int",
  "read_sensor_data",
  "text_indexOf",
  "text_length",
  "text_count",
  "variables_get",
  "procedures_callreturn",
];

export function isNumberTerm(type) {
  return numberTermTypes.includes(type);
}

export default async function eatNumberTerm(astInfo) {
  const { ast } = astInfo;
  switch (ast.type) {
    case "math_number":
      return eatMathNumber(astInfo);
    case "math_arithmetic":
      return eatMathArithmetic(astInfo);
    case "math_single":
      return eatMathSingle(astInfo);
    case "math_trig":
      return eatMathTrig(astInfo);
    case "math_constant":
      return eatMathConstant(astInfo);
    case "math_round":
      return eatMathRound(astInfo);
    case "math_modulo":
      return eatMathModulo(astInfo);
    case "math_constrain":
      return eatMathConstrain(astInfo);
    case "math_random_int":
      return eatMathRandomInt(astInfo);
    case "read_sensor_data":
      return eatReadSensorData(astInfo);
    case "text_indexOf":
      return eatTextIndexOf(astInfo);
    case "text_length":
      return eatTextLength(astInfo);
    case "text_count":
      return eatTextCount(astInfo);
    case "variables_get":
      return eatVariablesGet({
        ...astInfo,
        type: "number",
      });
    case "procedures_callreturn":
      return eatCallProcedureReturn({
        ...astInfo,
        type: "number",
      });
    default:
      throw new Error(`Not number_term Block (${ast.type})`);
  }
}
