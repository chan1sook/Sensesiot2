import { ObjectId } from "mongodb";
import { sensesiotV2 } from "../../database/mongodb.js";
import { preditNewCredit } from "./credits.js";
import { randomDeviceKey } from "../../utils/random.js";

export async function getSensesiotDevicesByUser(uid) {
  const deviceCol = sensesiotV2.collection("devices");

  const devices = await deviceCol.find({ uid }).toArray();
  return devices;
}

export async function createSensesiotDevice(
  uid,
  { name = "", model = "", type = "custom" }
) {
  const { max: maxCredits, predit: preditCredits } = await preditNewCredit(
    uid,
    { device: 1 }
  );

  if (preditCredits > maxCredits) {
    throw new Error("Credits not enough");
  }

  const deviceCol = sensesiotV2.collection("devices");
  const today = new Date();
  const deviceType = type || "custom";
  const data = {
    uid,
    deviceKey: randomDeviceKey(20),
    name,
    model,
    type: deviceType,
    createTime: today,
    lastestUpdateTime: today,
  };

  const { insertedId } = await deviceCol.insertOne(data);
  return {
    _id: insertedId,
    ...data,
  };
}

export async function updateSensesiotDevice(uid, deviceId, data) {
  const deviceCol = sensesiotV2.collection("devices");
  const deviceType = data.type || "custom";
  const { value } = await deviceCol.findOneAndUpdate(
    {
      _id: ObjectId(deviceId),
      uid,
    },
    {
      $set: { ...data, type: deviceType, lastestUpdateTime: new Date() },
    },
    { returnDocument: "after" }
  );

  if (!value) {
    throw new Error("Forbidden");
  }

  return value;
}

export function removeSensesiotDevice(uid, deviceId) {
  const deviceCol = sensesiotV2.collection("devices");
  return deviceCol.findOneAndDelete({
    _id: ObjectId(deviceId),
    uid,
  });
}

export default Object.freeze({
  getSensesiotDevicesByUser,
  createSensesiotDevice,
  updateSensesiotDevice,
  removeSensesiotDevice,
});
