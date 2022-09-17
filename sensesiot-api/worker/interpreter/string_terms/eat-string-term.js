/* eslint-disable import/no-cycle */
import eatCallProcedureReturn from "../command_terms/eat-call-procedure-return.js";
import eatVariablesGet from "../eat-variables-get.js";
import eatReadSensorControlState from "./eat-read-control.js";
import eatTextChangeCase from "./eat-text-changecase.js";
import eatTextCharAt from "./eat-text-charat.js";
import eatTextJoin from "./eat-text-join.js";
import eatTextMultiline from "./eat-text-multiline.js";
import eatTextReplace from "./eat-text-replace.js";
import eatTextReverse from "./eat-text-reverse.js";
import eatTextSubstring from "./eat-text-substring.js";
import eatTextTrim from "./eat-text-trim.js";
import eatText from "./eat-text.js";

const stringTermTypes = [
  "text",
  "text_multiline",
  "text_join",
  "text_getSubstring",
  "text_changeCase",
  "text_charAt",
  "text_trim",
  "text_reverse",
  "text_replace",
  "read_sensor_control_state",
  "variables_get",
  "procedures_callreturn",
];

export function isStringTerm(type) {
  return stringTermTypes.includes(type);
}

export default async function eatStringTerm(astInfo) {
  const { ast } = astInfo;
  switch (ast.type) {
    case "text":
      return eatText(astInfo);
    case "text_multiline":
      return eatTextMultiline(astInfo);
    case "text_join":
      return eatTextJoin(astInfo);
    case "text_getSubstring":
      return eatTextSubstring(astInfo);
    case "text_changeCase":
      return eatTextChangeCase(astInfo);
    case "text_charAt":
      return eatTextCharAt(astInfo);
    case "text_trim":
      return eatTextTrim(astInfo);
    case "text_reverse":
      return eatTextReverse(astInfo);
    case "text_replace":
      return eatTextReplace(astInfo);
    case "read_sensor_control_state":
      return eatReadSensorControlState(astInfo);
    case "variables_get":
      return eatVariablesGet({
        ...astInfo,
        type: "string",
      });
    case "procedures_callreturn":
      return eatCallProcedureReturn({
        ...astInfo,
        type: "string",
      });
    default:
      throw new Error(`Not string_term Block (${ast.type})`);
  }
}
