import eatVariablesGet from "../eat-variables-get.js";
import eatCurrentDatetime from "./eat-current-datetime.js";
import eatDatetimeOf from "./eat-datetime-of.js";

const dateTimeTerm = [
  "current_datetime",
  "datetime_of",
  "variables_get",
  "procedures_callreturn",
];

export function isDateTimeTerm(type) {
  return dateTimeTerm.includes(type);
}

export default async function eatDatetimeTerm(astInfo) {
  const { ast } = astInfo;
  switch (ast.type) {
    case "current_datetime":
      return eatCurrentDatetime(astInfo);
    case "datetime_of":
      return eatDatetimeOf(astInfo);
    case "variables_get":
      return eatVariablesGet({
        ...astInfo,
        type: "datetime",
      });
    case "procedures_callreturn":
      return eatVariablesGet({
        ...astInfo,
        type: "datetime",
      });
    default:
      throw new Error(`Not datetime_term Block (${ast.type})`);
  }
}
