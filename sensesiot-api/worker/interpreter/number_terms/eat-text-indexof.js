// eslint-disable-next-line import/no-cycle
import eatStringTerm from "../string_terms/eat-string-term.js";
import eatToken from "../eat-token.js";

export default async function eatTextIndexOf(astInfo) {
  const { ast } = astInfo;
  if (ast.type !== "text_indexOf") {
    throw new Error(`Not text_indexOf Block (${ast.type})`);
  }

  const { VALUE, FIND } = ast.inputs;
  const [valueTerm, findTerm] = await Promise.all([
    eatToken(eatStringTerm, VALUE, astInfo, ""),
    eatToken(eatStringTerm, FIND, astInfo, ""),
  ]);

  const { END } = ast.fields;

  if (END === "LAST") {
    return valueTerm.lastIndexOf(findTerm);
  }
  return valueTerm.indexOf(findTerm);
}
