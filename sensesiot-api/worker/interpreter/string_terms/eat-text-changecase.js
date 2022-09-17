import { titleCase } from "title-case";
// eslint-disable-next-line import/no-cycle
import eatStringTerm from "./eat-string-term.js";
import eatToken from "../eat-token.js";

export default async function eatTextChangeCase(astInfo) {
  const { ast } = astInfo;
  if (ast.type !== "text_changeCase") {
    throw new Error(`Not text_changeCase Block (${ast.type})`);
  }

  const { TEXT } = ast.inputs;
  const strTerm = await eatToken(eatStringTerm, TEXT, astInfo, "");

  const { CASE } = ast.fields;

  switch (CASE) {
    case "UPPERCASE":
      return strTerm.toLocaleUpperCase();
    case "LOWERCASE":
      return strTerm.toLocaleLowerCase();
    case "TITLECASE":
      return titleCase(strTerm);
    default:
      throw new Error(`Invalid text_changeCase CASE ${CASE}`);
  }
}
