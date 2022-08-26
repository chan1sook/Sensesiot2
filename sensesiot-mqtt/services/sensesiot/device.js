import { sensesiotV2 } from "../../database/mongodb.js";

export async function getSensesiotDevice(uid, deviceKey) {
  const deviceCol = sensesiotV2.collection("devices");

  const device = await deviceCol.findOne({ uid, deviceKey });
  return device;
}

export default Object.freeze({
  getSensesiotDevice,
});
