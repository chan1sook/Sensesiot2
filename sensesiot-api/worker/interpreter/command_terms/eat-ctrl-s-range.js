import eatNumberTerm from "../number_terms/eat-number-term.js";
import eatToken from "../eat-token.js";

export default async function eatControlSensorRange(astInfo) {
  const { ast, widgetData, eventEmitter } = astInfo;

  if (ast.type !== "control_sensor_range") {
    throw new Error(`Not control_sensor_range Block (${ast.type})`);
  }

  const { DEVICE_KEY, SLOT } = ast.fields;
  const { userUid } = widgetData;
  const { VALUE } = ast.inputs;

  let data = await eatToken(eatNumberTerm, VALUE, astInfo, 0);

  if (!Number.isFinite(data)) {
    throw new Error("Data isn't number");
  }

  data = Math.min(Math.max(data, 0), 100);

  eventEmitter.emit("controlDevice", {
    uid: userUid,
    deviceKey: DEVICE_KEY,
    slot: SLOT,
    data: `${data.toFixed(0)}`,
  });
}
