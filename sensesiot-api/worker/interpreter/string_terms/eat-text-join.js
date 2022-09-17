import eatToken from "../eat-token.js";
// eslint-disable-next-line import/no-cycle
import eatValueTerm from "../eat-value-term.js";

export default async function eatTextJoin(astInfo) {
  const { ast } = astInfo;
  if (ast.type !== "text_join") {
    throw new Error(`Not text_join Block (${ast.type})`);
  }

  let result = "";

  const { itemCount } = ast.extraState;
  for (let i = 0; i < itemCount; i += 1) {
    const input = ast.inputs[`ADD${i}`];
    // eslint-disable-next-line no-await-in-loop
    result += await eatToken(eatValueTerm, input, astInfo, "");
  }

  return result;
}
