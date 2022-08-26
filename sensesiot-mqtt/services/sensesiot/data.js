import { sensesiotV2 } from "../../database/mongodb.js";
import { getSensesiotDevice } from "./device.js";

const limitRateMs = 200;

export async function getSensesiotDeviceLastestData(uid, deviceKey, slot) {
  const targetDevice = await getSensesiotDevice(uid, deviceKey);
  if (!targetDevice) {
    throw new Error("Device not found");
  }

  const dataCol = sensesiotV2.collection("data");
  const data = await dataCol.findOne(
    {
      uid,
      deviceKey,
      slot,
    },
    { sort: { ts: -1 } }
  );

  return {
    uid,
    deviceKey,
    slot,
    data: data ? data.metadata.data : null,
    ts: data ? data.ts : null,
  };
}

async function getSensesiotDeviceLastestAnyData(uid, deviceKey) {
  const targetDevice = await getSensesiotDevice(uid, deviceKey);
  if (!targetDevice) {
    throw new Error("Device not found");
  }

  const dataCol = sensesiotV2.collection("data");
  const data = await dataCol.findOne(
    {
      uid,
      deviceKey,
    },
    { sort: { ts: -1 } }
  );

  return {
    uid,
    deviceKey,
    slot: data ? data.slot : null,
    data: data ? data.metadata.data : null,
    ts: data ? data.ts : null,
  };
}

export async function insertSensesiotDeviceData(uid, deviceKey, slot, data) {
  const targetDevice = await getSensesiotDevice(uid, deviceKey);
  if (!targetDevice) {
    throw new Error("Device not found");
  }

  if (Number.isNaN(data)) {
    throw new Error("Data mulform/invalid");
  }

  const dataCol = sensesiotV2.collection("data", {
    timeseries: {
      timeField: "ts",
      metaField: "metadata",
      granularity: "seconds",
    },
  });

  const ts = new Date();

  const outputData = {
    metadata: {
      data,
    },
    uid,
    deviceKey,
    slot,
    ts,
  };

  let limitDataRate = false;
  try {
    const lastestData = await getSensesiotDeviceLastestAnyData(uid, deviceKey);
    if (
      !(lastestData.ts instanceof Date) ||
      ts.getTime() - lastestData.ts.getTime() >= limitRateMs
    ) {
      await dataCol.insertOne(outputData);
    } else {
      limitDataRate = true;
    }
  } catch (error) {
    throw new Error("Can't insert data");
  }

  if (limitDataRate) {
    throw new Error("Limit Data Rate");
  }

  return {
    uid,
    deviceKey,
    slot,
    data,
  };
}

export default Object.freeze({
  getSensesiotDeviceLastestData,
  insertSensesiotDeviceData,
});
