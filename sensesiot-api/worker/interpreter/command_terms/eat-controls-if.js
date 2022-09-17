// eslint-disable-next-line import/no-cycle
import eatCommandTerm from "./eat-cmd-term.js";
import eatLogicTerm from "../logic_terms/eat-logic-term.js";
import eatToken from "../eat-token.js";

export default async function eatControlsIf(astInfo) {
  const { ast } = astInfo;
  if (ast.type !== "controls_if") {
    throw new Error(`Not controls_if Block (${ast.type})`);
  }

  const { inputs } = ast;

  let fullfilled = false;
  let cmdTerm;

  for (let i = 0; i < 100 && !fullfilled; i += 1) {
    if (inputs[`IF${i}`]) {
      if (inputs[`DO${i}`]) {
        // eslint-disable-next-line no-await-in-loop
        fullfilled = await eatToken(
          eatLogicTerm,
          inputs[`IF${i}`],
          astInfo,
          false
        );

        if (fullfilled) {
          cmdTerm = inputs[`DO${i}`].block || inputs[`DO${i}`].shadow;
        }
      }
    } else if (inputs.ELSE) {
      cmdTerm = inputs.ELSE.block || inputs.ELSE.shadow;
      fullfilled = true;
    } else {
      fullfilled = true;
    }
  }

  if (cmdTerm) {
    eatCommandTerm({
      ...astInfo,
      ast: cmdTerm,
    });
  }
}
