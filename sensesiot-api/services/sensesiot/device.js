import { ObjectId } from "mongodb";
import objectHash from "object-hash";
import { sensesiotV2 } from "../../database/mongodb.js";
import { preditNewCredit } from "./credits.js";

export async function getSensesiotDevicesByUser(uid) {
  const deviceCol = sensesiotV2.collection("devices");

  const devices = await deviceCol.find({ uid }).toArray();
  return devices;
}

export async function createSensesiotDevice(uid, { name = "", model = "" }) {
  const { max: maxCredits, predit: preditCredits } = await preditNewCredit(
    uid,
    { device: 1 }
  );

  if (preditCredits > maxCredits) {
    throw new Error("Credits not enough");
  }

  const deviceCol = sensesiotV2.collection("devices");
  const today = new Date();
  const type = "custom";

  const data = {
    uid,
    deviceKey: objectHash({
      name,
      model,
      type,
      createTime: today.getTime(),
    }),
    name,
    model,
    type,
    createTime: today,
    lastestUpdateTime: new Date(),
  };

  const { insertedId } = await deviceCol.insertOne(data);
  return {
    _id: insertedId,
    ...data,
  };
}

export async function updateSensesiotDevice(uid, deviceId, data) {
  const deviceCol = sensesiotV2.collection("devices");
  const { value } = await deviceCol.findOneAndUpdate(
    {
      _id: ObjectId(deviceId),
      uid,
    },
    {
      $set: { ...data, lastestUpdateTime: new Date() },
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
