/* eslint-disable import/no-cycle */
import eatNumberTerm from "../number_terms/eat-number-term.js";
import eatStringTerm from "./eat-string-term.js";
import eatToken from "../eat-token.js";

export default async function eatTextCharAt(astInfo) {
  const { ast } = astInfo;
  if (ast.type !== "text_charAt") {
    throw new Error(`Not text_charAt Block (${ast.type})`);
  }

  const { VALUE, AT } = ast.inputs;
  const [strTerm, atTerm] = await Promise.all([
    eatToken(eatStringTerm, VALUE, astInfo, ""),
    eatToken(eatNumberTerm, AT, astInfo, 0),
  ]);

  const { WHERE } = ast.fields;
  let pos = 0;
  switch (WHERE) {
    case "FROM_START":
      pos = atTerm;
      break;
    case "FROM_END":
      pos = strTerm.length - atTerm - 1;
      break;
    case "FIRST":
      pos = 0;
      break;
    case "LAST":
      pos = strTerm.length - 1;
      break;
    case "RANDOM":
      pos = Math.floor(Math.random() * strTerm.length);
      break;
    default:
      throw new Error(`Invalid text_charAt WHERE ${WHERE}`);
  }

  return strTerm.charAt(pos) || "";
}
