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

  if (
    Array.isArray(data) &&
    data.length > 0 &&
    data[0].metadata &&
    Number.isFinite(data[0].metadata.data)
  ) {
    return data[0].metadata.data;
  }

  return NaN;
}
