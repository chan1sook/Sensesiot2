/* eslint-disable import/no-cycle */
import eatControlSensorPush from "./eat-ctrl-s-push.js";
import eatControlSensorToggle from "./eat-ctrl-s-toggle.js";
import eatControlSensorRange from "./eat-ctrl-s-range.js";
import eatControlsIf from "./eat-controls-if.js";
import eatLineNotify from "./eat-line-notify.js";
import eatWidgetNotify from "./eat-widget-notify.js";
import eatVariablesSet from "./eat-variables-set.js";
import eatMathChange from "./eat-math-change.js";
import eatToken from "../eat-token.js";
import eatCallProcedure from "./eat-call-procedure.js";
import eatProcedureIfReturn from "./eat-procedure-ifreturn.js";

export default async function eatCommandTerm(astInfo) {
  const { ast, stacktrace } = astInfo;
  let ifReturnResult = {
    stopReturn: false,
    value: undefined,
  };

  stacktrace.lines[stacktrace.stack] += 1;

  switch (ast.type) {
    case "control_sensor_push":
      await eatControlSensorPush(astInfo);
      break;
    case "control_sensor_toggle":
      await eatControlSensorToggle(astInfo);
      break;
    case "control_sensor_range":
      await eatControlSensorRange(astInfo);
      break;
    case "controls_if":
      await eatControlsIf(astInfo);
      break;
    case "line_notify":
      await eatLineNotify(astInfo);
      break;
    case "variables_set":
      await eatVariablesSet(astInfo);
      break;
    case "math_change":
      await eatMathChange(astInfo);
      break;
    case "widget_notify":
      await eatWidgetNotify(astInfo);
      break;
    case "procedures_callnoreturn":
      await eatCallProcedure(astInfo);
      break;
    case "procedures_ifreturn":
      ifReturnResult = await eatProcedureIfReturn(astInfo);
      break;
    default:
      throw new Error(`Not command_term Block (${ast.type})`);
  }

  if (ifReturnResult && ifReturnResult.stopReturn) {
    return ifReturnResult;
  }

  ifReturnResult = await eatToken(
    eatCommandTerm,
    ast.next,
    astInfo,
    ifReturnResult
  );

  return ifReturnResult;
}
