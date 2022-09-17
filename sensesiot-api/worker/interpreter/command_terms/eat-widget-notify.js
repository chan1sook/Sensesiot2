import eatToken from "../eat-token.js";
import eatValueTerm from "../eat-value-term.js";

export default async function eatWidgetNotify(astInfo) {
  const { ast, widgetLogs, stacktrace } = astInfo;
  if (ast.type !== "widget_notify") {
    throw new Error(`Not widget_notify Block (${ast.type})`);
  }

  const { IS_ERROR } = ast.fields;
  const { MESSAGE } = ast.inputs;
  const msgTerm = await eatToken(eatValueTerm, MESSAGE, astInfo, "");

  widgetLogs.push({
    message: `${msgTerm}`,
    isError: IS_ERROR,
    errorType: "manual",
    stacktrace: JSON.parse(JSON.stringify(stacktrace)),
    ts: Date.now(),
  });
}
