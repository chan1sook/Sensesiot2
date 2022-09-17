import { fetchSensesiotDataByFetchDataOf } from "../../../services/sensesiot/widget.js";

export default async function eatReadSensorControlState(astInfo) {
  const { ast } = astInfo;
  if (ast.type !== "read_sensor_control_state") {
    throw new Error(`Not read_sensor_control_state Block (${ast.type})`);
  }

  const { DEVICE_KEY, SLOT } = ast.fields;

  const data = await fetchSensesiotDataByFetchDataOf({
    fetchType: "control1",
    deviceKey: DEVICE_KEY,
    slot: `${SLOT}`,
  });

  if (data && data.metadata) {
    return data.metadata.data;
  }

  return "";
}
