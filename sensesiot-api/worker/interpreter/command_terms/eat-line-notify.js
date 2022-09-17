import axios from "axios";
import eatStringTerm from "../string_terms/eat-string-term.js";
import eatToken from "../eat-token.js";

export default async function eatLineNotify(astInfo) {
  const { ast, widgetLogs, stacktrace } = astInfo;

  if (ast.type !== "line_notify") {
    throw new Error(`Not line_notify Block (${ast.type})`);
  }

  const { LINE_TOKEN } = ast.fields;
  const { MESSAGE } = ast.inputs;

  const msgTerm = await eatToken(eatStringTerm, MESSAGE, astInfo, false);

  try {
    await axios.post(
      "https://notify-api.line.me/api/notify",
      {
        message: msgTerm,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${LINE_TOKEN}`,
        },
      }
    );
  } catch (err) {
    widgetLogs.push({
      message: "Can't Notify to LINE",
      isError: true,
      errorType: "runtime",
      stacktrace: JSON.parse(JSON.stringify(stacktrace)),
      ts: Date.now(),
    });
  }
}
