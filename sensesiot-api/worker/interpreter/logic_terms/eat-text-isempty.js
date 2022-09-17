// eslint-disable-next-line import/no-cycle
import eatStringTerm from "../string_terms/eat-string-term.js";
import eatToken from "../eat-token.js";

export default async function eatTextIsEmpty(astInfo) {
  const { ast } = astInfo;
  if (ast.type !== "text_isEmpty") {
    throw new Error(`Not text_isEmpty Block (${ast.type})`);
  }

  const { VALUE } = ast.inputs;
  const valueTerm = await eatToken(eatStringTerm, VALUE, astInfo, "");

  return valueTerm.length === 0;
}
