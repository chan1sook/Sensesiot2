import EventEmitter from "events";
import { updateSensesiotWidgetData } from "../../services/sensesiot/dashboard.js";
import { error } from "../../utils/logging.js";

import eatRootCommand, {
  isRootCommandType,
} from "./command_terms/eat-root-cmd.js";
import eatDefineProcedureReturn from "./eat-def-procedure-return.js";
import eatDefineProcedure from "./eat-def-procedure.js";

export default async function interpreteConditionBlockly(
  { condition = {}, widgetData = {}, eventEmitter = new EventEmitter() } = {
    widgetData: {},
    eventEmitter: new EventEmitter(),
  }
) {
  const {
    blocks: { blocks: rootBlocks },
    variables,
  } = condition;

  const widgetLogs = [];
  const procedures = {};
  const stacktrace = {
    stack: "",
    lines: {},
  };

  try {
    if (widgetData.active) {
      if (Array.isArray(rootBlocks) && rootBlocks.length > 0) {
        const rootBlock = rootBlocks.find((ele) => isRootCommandType(ele.type));

        const procedureBlocks = rootBlocks.filter(
          (ele) => !isRootCommandType(ele.type)
        );

        await Promise.all(
          procedureBlocks.map((blockAst) => {
            switch (blockAst.type) {
              case "procedures_defnoreturn":
                return eatDefineProcedure({
                  ast: blockAst,
                  widgetData,
                  eventEmitter,
                  widgetLogs,
                  variables,
                  procedures,
                  stacktrace,
                });
              case "procedures_defreturn":
                return eatDefineProcedureReturn({
                  ast: blockAst,
                  widgetData,
                  eventEmitter,
                  widgetLogs,
                  variables,
                  procedures,
                  stacktrace,
                });
              default:
                return new Promise((resolve) => {
                  resolve();
                });
            }
          })
        );

        if (rootBlock) {
          await eatRootCommand({
            ast: rootBlock,
            widgetData,
            eventEmitter,
            widgetLogs,
            variables,
            procedures,
            stacktrace,
          });
        }
      }

      widgetLogs.push({
        message: "Condition Run Successful",
        isError: false,
        errorType: "runtime",
        stacktrace: JSON.parse(JSON.stringify(stacktrace)),
        ts: Date.now(),
      });
    } else {
      widgetLogs.push({
        message: "Condition Run Skipped (Not Active)",
        isError: false,
        errorType: "runtime",
        ts: Date.now(),
      });
    }
  } catch (err) {
    widgetLogs.push({
      message: err.message,
      isError: true,
      errorType: "runtime",
      stacktrace: JSON.parse(JSON.stringify(stacktrace)),
      ts: Date.now(),
    });
  }

  try {
    const lastChecked = new Date();
    await updateSensesiotWidgetData(widgetData.userUid, widgetData, {
      logs: widgetLogs,
      lastChecked,
    });

    eventEmitter.emit("updateWidget", {
      uid: widgetData.userUid,
      // eslint-disable-next-line no-underscore-dangle
      widgetId: widgetData._id,
      data: {
        logs: widgetLogs,
        lastChecked,
      },
    });
  } catch (err) {
    error(err, { name: "Interpreter" });
  }
}
