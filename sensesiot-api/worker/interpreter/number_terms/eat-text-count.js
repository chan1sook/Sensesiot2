import occurrence from "substr-occurrence";
// eslint-disable-next-line import/no-cycle
import eatStringTerm from "../string_terms/eat-string-term.js";
import eatToken from "../eat-token.js";

export default async function eatTextCount(astInfo) {
  const { ast } = astInfo;
  if (ast.type !== "text_count") {
    throw new Error(`Not text_count Block (${ast.type})`);
  }

  const { TEXT, SUB } = ast.inputs;
  const [valueTerm, findTerm] = await Promise.all([
    eatToken(eatStringTerm, TEXT, astInfo, ""),
    eatToken(eatStringTerm, SUB, astInfo, ""),
  ]);

  return occurrence(valueTerm, findTerm);
}
