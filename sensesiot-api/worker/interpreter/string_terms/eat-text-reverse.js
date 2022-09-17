/* eslint-disable import/no-cycle */
import eatStringTerm from "./eat-string-term.js";
import eatToken from "../eat-token.js";

export default async function eatTextReverse(astInfo) {
  const { ast } = astInfo;
  if (ast.type !== "text_reverse") {
    throw new Error(`Not text_reverse Block (${ast.type})`);
  }

  const { TEXT } = ast.inputs;
  const strTerm = await eatToken(eatStringTerm, TEXT, astInfo, "");

  return strTerm.split().reverse().join();
}
