import eatCommandTerm from "./command_terms/eat-cmd-term.js";
import eatToken from "./eat-token.js";

export default async function eatDefineProcedure(astInfo) {
  const { ast, variables, procedures, stacktrace } = astInfo;
  if (ast.type !== "procedures_defnoreturn") {
    throw new Error(`Not procedures_defnoreturn Block (${ast.type})`);
  }

  const { NAME } = ast.fields;
  const { STACK } = ast.inputs || {};

  procedures[NAME] = async (localParams) => {
    const oldVariables = [];

    for (let i = 0; i < localParams.length; i += 1) {
      const { name, term } = localParams[i];
      const targetVariable = variables.find((ele) => ele.name === name);
      if (targetVariable) {
        oldVariables.push({ ...targetVariable });
        targetVariable.value = term;
      }
    }

    const oldStack = stacktrace.stack;
    stacktrace.stack = NAME;
    stacktrace.lines[stacktrace.stack] = 0;

    await eatToken(eatCommandTerm, STACK, astInfo);

    stacktrace.stack = oldStack;

    for (let i = 0; i < localParams.length; i += 1) {
      const { name } = localParams[i];
      const targetOldVariable = oldVariables.find((ele) => ele.name === name);
      const targetVariable = variables.find((ele) => ele.name === name);
      if (targetVariable) {
        if (targetOldVariable) {
          targetVariable.value = targetOldVariable.value;
        } else {
          delete targetVariable.value;
        }
      }
    }
  };
}
