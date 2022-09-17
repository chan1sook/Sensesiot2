/* eslint-disable import/no-cycle */
import eatStringTerm from "./eat-string-term.js";
import eatToken from "../eat-token.js";

export default async function eatTextReplace(astInfo) {
  const { ast } = astInfo;
  if (ast.type !== "text_replace") {
    throw new Error(`Not text_replace Block (${ast.type})`);
  }

  const { TEXT, FROM, TO } = ast.inputs;
  const [strTerm, fromTerm, toTerm] = await Promise.all([
    eatToken(eatStringTerm, TEXT, astInfo, ""),
    eatToken(eatStringTerm, FROM, astInfo, ""),
    eatToken(eatStringTerm, TO, astInfo, ""),
  ]);

  const regex = new RegExp(
    fromTerm.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"),
    "g"
  );
  return strTerm.replace(regex, toTerm);
}
