import eatCommandTerm from "./eat-cmd-term.js";
import eatToken from "../eat-token.js";

export function isRootCommandType(type) {
  return type === "condition_event";
}
export default async function eatRootCommand(astInfo) {
  const { ast, stacktrace } = astInfo;
  if (ast.type !== "condition_event") {
    throw new Error(`Not condition_event Block (${ast.type})`);
  }

  const { CONDITION } = ast.inputs || {};

  stacktrace.stack = "condition_event";
  stacktrace.lines[stacktrace.stack] = 0;

  await eatToken(eatCommandTerm, CONDITION, astInfo);
}
