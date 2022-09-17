import { fetchSensesiotDataByFetchDataOf } from "../../../services/sensesiot/widget.js";

export default async function eatControlSensorToggle(astInfo) {
  const { ast, widgetData, eventEmitter } = astInfo;

  if (ast.type !== "control_sensor_toggle") {
    throw new Error(`Not control_sensor_toggle Block (${ast.type})`);
  }

  const { DEVICE_KEY, SLOT, VALUE } = ast.fields;
  const { userUid } = widgetData;

  let fetchData;
  let data = "";
  switch (VALUE) {
    case "ON":
      data = "on";
      break;
    case "OFF":
      data = "off";
      break;
    case "TOGGLE":
      fetchData = await fetchSensesiotDataByFetchDataOf({
        fetchType: "control1",
        deviceKey: DEVICE_KEY,
        slot: `${SLOT}`,
        anchorToday: Date.now(),
      });
      if (
        Array.isArray(fetchData) &&
        fetchData.length > 0 &&
        fetchData[0].metadata
      ) {
        data = fetchData[0].metadata.data === "on" ? "off" : "on";
      } else {
        data = "on";
      }
      break;
    default:
  }

  eventEmitter.emit("controlDevice", {
    uid: userUid,
    deviceKey: DEVICE_KEY,
    slot: SLOT,
    data,
  });
}
