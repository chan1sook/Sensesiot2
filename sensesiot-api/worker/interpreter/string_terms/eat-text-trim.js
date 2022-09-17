/* eslint-disable import/no-cycle */
import eatStringTerm from "./eat-string-term.js";
import eatToken from "../eat-token.js";

export default async function eatTextTrim(astInfo) {
  const { ast } = astInfo;
  if (ast.type !== "text_trim") {
    throw new Error(`Not text_trim Block (${ast.type})`);
  }

  const { TEXT } = ast.inputs;
  const strTerm = await eatToken(eatStringTerm, TEXT, astInfo, "");

  const { MODE } = ast.fields;

  switch (MODE) {
    case "LEFT":
      return strTerm.trimStart();
    case "RIGHT":
      return strTerm.trimEnd();
    case "BOTH":
      return strTerm.trim();
    default:
      throw new Error(`Invalid text_trim MODE ${MODE}`);
  }
}
