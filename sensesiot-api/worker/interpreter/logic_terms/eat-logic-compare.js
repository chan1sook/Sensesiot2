import eatToken from "../eat-token.js";
// eslint-disable-next-line import/no-cycle
import eatValueTerm from "../eat-value-term.js";

function compare(a, b, OP) {
  let leftTerm = a;
  let rightTerm = b;

  if (a instanceof Date && b instanceof Date) {
    leftTerm = a.getTime();
    rightTerm = b.getTime();
  }

  const isAllowGTECompare =
    typeof leftTerm === "number" && typeof rightTerm === "number";

  switch (OP) {
    case "GTE":
      return isAllowGTECompare && leftTerm >= rightTerm;
    case "GT":
      return isAllowGTECompare && leftTerm > rightTerm;
    case "LTE":
      return isAllowGTECompare && leftTerm <= rightTerm;
    case "LT":
      return isAllowGTECompare && leftTerm < rightTerm;
    case "EQ":
      return leftTerm === rightTerm;
    case "NEQ":
      return leftTerm !== rightTerm;
    default:
      throw new Error(`No valid logic_compare OP ${OP}`);
  }
}

export default async function eatLogicCompare(astInfo) {
  const { ast } = astInfo;
  if (ast.type !== "logic_compare") {
    throw new Error(`Not logic_compare Block (${ast.type})`);
  }

  const { A, B } = ast.inputs;
  const { OP } = ast.fields;

  const [leftTerm, rightTerm] = await Promise.all([
    eatToken(eatValueTerm, A, astInfo, false),
    eatToken(eatValueTerm, B, astInfo, false),
  ]);

  return compare(leftTerm, rightTerm, OP);
}
