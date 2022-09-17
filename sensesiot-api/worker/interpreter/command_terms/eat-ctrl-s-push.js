export default async function eatControlSensorPush(astInfo) {
  const { ast, widgetData, eventEmitter } = astInfo;

  if (ast.type !== "control_sensor_push") {
    throw new Error(`Not control_sensor_push Block (${ast.type})`);
  }

  const { DEVICE_KEY, SLOT } = ast.fields;
  const { userUid } = widgetData;

  eventEmitter.emit("controlDevice", {
    uid: userUid,
    deviceKey: DEVICE_KEY,
    slot: SLOT,
    data: "",
  });
}
