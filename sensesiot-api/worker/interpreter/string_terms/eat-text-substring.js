/* eslint-disable import/no-cycle */
import eatNumberTerm from "../number_terms/eat-number-term.js";
import eatStringTerm from "./eat-string-term.js";
import eatToken from "../eat-token.js";

export default async function eatTextSubstring(astInfo) {
  const { ast } = astInfo;
  if (ast.type !== "text_getSubstring") {
    throw new Error(`Not text_getSubstring Block (${ast.type})`);
  }

  const { STRING, AT1, AT2 } = ast.inputs;
  const [strTerm, at1Term, at2Term] = await Promise.all([
    eatToken(eatStringTerm, STRING, astInfo, ""),
    eatToken(eatNumberTerm, AT1, astInfo, 0),
    eatToken(eatNumberTerm, AT2, astInfo, 0),
  ]);

  const { WHERE1, WHERE2 } = ast.fields;
  let start = 0;
  let end = strTerm.length;

  switch (WHERE1) {
    case "FROM_START":
      start = at1Term;
      break;
    case "FROM_END":
      start = strTerm.length - at1Term;
      break;
    case "FIRST":
      start = 0;
      break;
    default:
      throw new Error(`Invalid text_getSubstring WHERE1 ${WHERE1}`);
  }

  switch (WHERE2) {
    case "FROM_START":
      end = at2Term;
      break;
    case "FROM_END":
      end = strTerm.length - at2Term;
      break;
    case "LAST":
      end = strTerm.length;
      break;
    default:
      throw new Error(`Invalid text_getSubstring WHERE2 ${WHERE2}`);
  }

  return strTerm.substring(start, end);
}
