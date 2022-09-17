import { fetchSensesiotDataByFetchDataOf } from "../../../services/sensesiot/widget.js";

export default async function eatReadSensorData(astInfo) {
  const { ast } = astInfo;
  if (ast.type !== "read_sensor_data") {
    throw new Error(`Not read_sensor_data Block (${ast.type})`);
  }

  const { DEVICE_KEY, SLOT } = ast.fields;

  const data = await fetchSensesiotDataByFetchDataOf({
    fetchType: "data1",
    deviceKey: DEVICE_KEY,
    slot: `${SLOT}`,
  });

  if (data && data.metadata && Number.isFinite(data.metadata.data)) {
    return data.metadata.data;
  }

  return NaN;
}
